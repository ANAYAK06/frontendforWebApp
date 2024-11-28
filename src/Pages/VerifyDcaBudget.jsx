import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FaChevronDown } from "react-icons/fa6";
import { FaRegEdit, FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import SignatureAndRemarks from '../Components/SignatureAndRemarks';
import { fetchDCABudgetForVerification, updateDCABudget, rejectDCABudget, resetUpdateSuccess, resetRejectSuccess, resetState } from '../Slices/dcaBudgetSlices'
import { showToast } from '../utilities/toastUtilities';
import { useParams } from 'react-router-dom';


const defaultProps = {
    checkContent: true,
    onEmpty: () => { },
    onStateChange: () => { },
    onCCIDFound: () => { }
};

const CCID_TYPE_MAP = {
    100: 'capital',
    101: 'nonperforming',
    102: 'performing'
};



function VerifyDcaBudget({ 
    budgetType: propBudgetType,
    ccid,
    checkContent = defaultProps.checkContent,
    onEmpty = defaultProps.onEmpty,
    onStateChange = defaultProps.onStateChange,
    onCCIDFound = defaultProps.onCCIDFound,
    isInbox = false
 }) {

    const params = useParams();
    const dispatch = useDispatch();
    const firstLoadRef = useRef(false);
    const dataFetchedRef = useRef(false);

    // Redux state
    const { 
        dcaBudgetForVerification: verificationBudgets, 
        loading, 
        error, 
        updateSuccess, 
        rejectSuccess 
    } = useSelector(state => state.dcaBudget);
    const userRoleId = useSelector(state => state.auth.userInfo.roleId);

    // Local state
    const [inboxExpanded, setInboxExpanded] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [localLoading, setLocalLoading] = useState(true);

    // Memoized values
    const effectiveBudgetType = useMemo(() => {
        // Check for inbox mode and valid verification budgets
        if (isInbox && 
            Array.isArray(verificationBudgets) && 
            verificationBudgets.length > 0 &&
            verificationBudgets[0].ccid) {
            const typeFromCCID = CCID_TYPE_MAP[verificationBudgets[0].ccid];
            if (typeFromCCID) return typeFromCCID;
        }
        
        
        // If ccid prop is provided, use it
        if (ccid) {
            const typeFromCCID = CCID_TYPE_MAP[ccid];
            if (typeFromCCID) return typeFromCCID;
        }
    
        // Fall back to props or params
        return propBudgetType || params.budgetType || 'performing';
    }, [isInbox, verificationBudgets, ccid, propBudgetType, params.budgetType]);

    const hasContent = useMemo(() =>
        Array.isArray(verificationBudgets) && verificationBudgets.length > 0,
        [verificationBudgets]
    );

    const budgetTypeTitle = useMemo(() => {
        switch (effectiveBudgetType) {
            case 'performing':
                return 'Performing DCA Budget';
            case 'nonperforming':
                return 'Non-Performing DCA Budget';
            case 'capital':
                return 'Capital DCA Budget';
            default:
                return 'DCA Budget';
        }
    }, [effectiveBudgetType]);

    const fetchDCABudgets = useCallback(async () => {
        if (!userRoleId || !effectiveBudgetType || dataFetchedRef.current) return;

        setLocalLoading(true);
        try {
            const result = await dispatch(fetchDCABudgetForVerification({
                userRoleId,
                budgetType: effectiveBudgetType
            })).unwrap();

            // Match the result handling with CCBudgetVerification
            if (isInbox && result && result.length > 0 && result[0].ccid) {
                onCCIDFound(result[0].ccid);
            }
            dataFetchedRef.current = true;
        } catch (error) {
            console.error('Fetch failed:', error);
            showToast('error', 'Failed to fetch budget data');
        } finally {
            setLocalLoading(false);
        }
    }, [dispatch, userRoleId, effectiveBudgetType, isInbox, onCCIDFound]);

    // Initial load effect
    useEffect(() => {
        if (!firstLoadRef.current && userRoleId && effectiveBudgetType) {
            firstLoadRef.current = true;
            fetchDCABudgets();
        }
    }, [userRoleId, effectiveBudgetType, fetchDCABudgets]);

    // Handle budget type changes
    useEffect(() => {
        if (firstLoadRef.current && effectiveBudgetType) {
            dataFetchedRef.current = false;
            fetchDCABudgets();
        }
    }, [effectiveBudgetType, fetchDCABudgets]);

    // Handle success states
    useEffect(() => {
        if (updateSuccess) {
            showToast('success', `${budgetTypeTitle} verified successfully`);
            setSelectedBudget(null);
            setRemarks('');
            dataFetchedRef.current = false;
            fetchDCABudgets();
            dispatch(resetUpdateSuccess());
        }
        if (rejectSuccess) {
            showToast('success', `${budgetTypeTitle} rejected successfully`);
            setSelectedBudget(null);
            setRemarks('');
            dataFetchedRef.current = false;
            fetchDCABudgets();
            dispatch(resetRejectSuccess());
        }
    }, [updateSuccess, rejectSuccess, budgetTypeTitle, dispatch, fetchDCABudgets]);

    // Add this to VerifyDcaBudget
    useEffect(() => {
        if (!firstLoadRef.current && userRoleId && effectiveBudgetType) {
            firstLoadRef.current = true;
            fetchDCABudgets();
        }

        return () => {
            firstLoadRef.current = false;
            if (!isInbox) {
                dispatch(resetState());
            }
        };
    }, [userRoleId, effectiveBudgetType, fetchDCABudgets, dispatch, isInbox]);

    useEffect(() => {
        onStateChange(localLoading || loading, hasContent);
        if (checkContent && !localLoading && !loading && !hasContent) {
            onEmpty();
        }
    }, [loading, localLoading, hasContent, checkContent, onEmpty, onStateChange]);

    const handleAction = useCallback(async (action) => {
        if (!selectedBudget) return;
        if (!remarks?.trim()) {
            
            return;
        }

        try {
            const actionFunction = action === 'verify' ? updateDCABudget : rejectDCABudget;
            await dispatch(actionFunction({
                referenceNumber: selectedBudget.referenceNumber,
                remarks
            })).unwrap();

            
            setSelectedBudget(null);
            setRemarks('');

            // Reset data fetched flag and refetch
            dataFetchedRef.current = false;
            await fetchDCABudgets();
        } catch (error) {
            console.error('Action failed:', error);
            showToast('error', `Failed to ${action} budget. Please try again`);
        }
    }, [selectedBudget, remarks, dispatch, fetchDCABudgets]);
    
    if ((localLoading || loading) && !hasContent) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
            </div>
        );
    }

    if (error || !hasContent) return null;





    return (
        <div className='w-full bg-white shadow-md rounded-md overflow-hidden mb-4 mt-4'>
            {/* Header Section */}
            <div className='p-4 bg-slate-100 flex justify-between items-center'>
                <div
                    className='px-2 py-2 rounded-full bg-slate-300 cursor-pointer'
                    onClick={() => setInboxExpanded(!inboxExpanded)}
                >
                    <FaChevronDown
                        className={`text-gray-600 font-bold ${inboxExpanded ? 'rotate-180 duration-300' : ''}`}
                    />
                </div>
                <div>
                    <h3 className='text-gray-600 font-bold'>{budgetTypeTitle} Verification</h3>
                </div>
                <div className='font-bold text-red-500 border px-2 py-2 bg-slate-300'>
                    ({verificationBudgets.length})
                </div>
            </div>

            {/* Expandable Budget List Section */}
            <div className={`transition-max-height duration-500 ease-in-out overflow-hidden ${inboxExpanded ? 'max-h-screen' : 'max-h-0'}`}>
                {inboxExpanded && (
                    <div className='p-4 bg-white'>
                        <div className='overflow-x-auto'>
                            <table className='min-w-full'>
                                <thead className='text-gray-700'>
                                    <tr>
                                        <th className='border px-4 py-2'>Action</th>
                                        <th className='border px-4 py-2'>CC No</th>
                                        <th className='border px-4 py-2'>CC Name</th>
                                        <th className='border px-4 py-2'>Total Budget</th>
                                        <th className='border px-4 py-2'>Assigned Budget</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {verificationBudgets.map((budget) => (
                                        <tr key={budget.ccNo}>
                                            <td className='border px-4 py-2'>
                                                <FaRegEdit
                                                    className='text-yellow-600 cursor-pointer text-2xl'
                                                    onClick={() => setSelectedBudget(budget)}
                                                />
                                            </td>
                                            <td className='border px-4 py-2'>{budget.ccNo}</td>
                                            <td className='border px-4 py-2'>{budget.ccName}</td>
                                            <td className='border px-4 py-2'>
                                                {budget.ccBudget.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}
                                            </td>
                                            <td className='border px-4 py-2'>
                                                {budget.assignedBudget.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal for Budget Details */}
            {selectedBudget && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-start justify-center z-20">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white fade-in">
                        {/* Modal Close Button */}
                        <div className='absolute top-0 right-0 mt-4 mr-4'>
                            <button
                                onClick={() => setSelectedBudget(null)}
                                className='text-gray-400 hover:text-gray-500'
                            >
                                <FaTimes className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="mt-3">
                            {/* Modal Header */}
                            <div className='mt-8 bg-gray-200 text-gray-500 px-6 py-4'>
                                <h3 className='text-2xl font-bold leading-tight'>DCA Budget Details</h3>
                                <p className='text-lg mt-1 font-medium text-indigo-800'>
                                    <span className='font-bold'>CC CODE: </span>{selectedBudget.ccNo}
                                    <span className='font-bold ml-4'>CC NAME: </span>{selectedBudget.ccName}
                                </p>
                            </div>

                            <div className="mt-2 px-7 py-3">
                                {/* Budget Summary Cards */}
                                <div className='grid grid-cols-3 gap-4 mb-4'>
                                    <div className='bg-indigo-400 p-4 rounded-md'>
                                        <p className='text-sm font-medium text-gray-600'>Assigned CC Budget</p>
                                        <p className='text-xl font-bold text-indigo-800'>
                                            {selectedBudget.ccBudget.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}
                                        </p>
                                    </div>
                                    <div className='bg-green-200 p-4 rounded-md'>
                                        <p className='text-sm font-medium text-gray-600'>Balance Budget</p>
                                        <p className='text-xl font-bold text-green-700'>
                                            {selectedBudget.budgetBalance.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}
                                        </p>
                                    </div>
                                    <div className='bg-yellow-200 p-4 rounded-md'>
                                        <p className='text-sm font-medium text-gray-600'>Used Budget</p>
                                        <p className='text-xl font-bold text-yellow-700'>
                                            {selectedBudget.assignedBudget.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}
                                        </p>
                                    </div>
                                </div>

                                {/* DCA Allocations Table */}
                                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                    <div className="px-4 py-5 sm:px-6">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">DCA Allocations</h3>
                                    </div>
                                    <div className="border-t border-gray-200">
                                        <table className='min-w-full divide-y divide-gray-200'>
                                            <thead className='bg-gray-50'>
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DCA Code</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DCA Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Budget</th>
                                                </tr>
                                            </thead>
                                            <tbody className='bg-white divide-y divide-gray-200'>
                                                {selectedBudget.budgets.map((dca) => (
                                                    <tr key={dca.dcaCode}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dca.dcaCode}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dca.dcaName}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                            {dca.assignedBudget.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Signatures and Remarks Section */}
                                <SignatureAndRemarks
                                    signatures={Array.isArray(selectedBudget.signatureAndRemarks) ?
                                        selectedBudget.signatureAndRemarks : []}
                                />

                                {/* Remarks Input */}
                                <div className="mt-4">
                                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
                                        Remarks
                                    </label>
                                    <textarea
                                        id="remarks"
                                        name="remarks"
                                        rows="3"
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                        placeholder="Enter your remarks here"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-4 mt-6 px-6">
                                <button
                                    className="px-6 py-2 bg-green-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
                                    onClick={() => handleAction('verify')}
                                    disabled={loading || localLoading}
                                >
                                    {(loading || localLoading) ? 'Processing...' : 'Verify'}
                                </button>
                                <button
                                    className="px-6 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                                    onClick={() => handleAction('reject')}
                                    disabled={loading || localLoading}
                                >
                                    {(loading || localLoading) ? 'Processing' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default React.memo(VerifyDcaBudget)
