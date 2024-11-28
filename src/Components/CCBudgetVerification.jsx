import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaChevronDown, FaRegEdit, FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { fetchCCBudgetForVerification, updateCCBudget, resetState } from '../Slices/ccBudgetSlices';
import SignatureAndRemarks from './SignatureAndRemarks';
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

function CCBudgetVerification({
    
    budgetType: propBudgetType,
    onCCIDFound = defaultProps.onCCIDFound,
    checkContent = defaultProps.checkContent,
    onEmpty = defaultProps.onEmpty,
    onStateChange = defaultProps.onStateChange,
    isInbox = false
}) {
    const params = useParams();
    const dispatch = useDispatch();
    const firstLoadRef = useRef(false);
    const dataFetchedRef = useRef(false);

    const { verificationBudgets, loading, error } = useSelector((state) => state.ccBudget);
    const userRoleId = useSelector(state => state.auth.userInfo.roleId);

    const [inboxExpanded, setInboxExpanded] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [localLoading, setLocalLoading] = useState(true);

    const effectiveBudgetType = useMemo(() => {
        // Check for inbox mode and valid verification budgets
        if (isInbox && 
            Array.isArray(verificationBudgets) && 
            verificationBudgets.length > 0 &&
            verificationBudgets[0].ccid) {
            const typeFromCCID = CCID_TYPE_MAP[verificationBudgets[0].ccid];
            if (typeFromCCID) return typeFromCCID;
        }
    
        // Fall back to props or params
        return propBudgetType || params.budgetType || 'nonperforming';
    }, [isInbox, verificationBudgets, propBudgetType, params.budgetType]); // Dependency array goes here


    const hasContent = useMemo(() =>
        Array.isArray(verificationBudgets) && verificationBudgets.length > 0,
        [verificationBudgets]
    );

    const budgetTypeTitle = useMemo(() => {
        switch (effectiveBudgetType) {
            case 'performing':
                return 'Performing CC Budget';
            case 'nonperforming':
                return 'Non-Performing CC Budget';
            case 'capital':
                return 'Capital CC Budget';
            default:
                return 'CC Budget';
        }
    }, [effectiveBudgetType]);

    const fetchCCBudgets = useCallback(async () => {
        if (!userRoleId || !effectiveBudgetType || dataFetchedRef.current) return;

        setLocalLoading(true);
        try {
            const result = await dispatch(fetchCCBudgetForVerification({
                userRoleId,
                budgetType: effectiveBudgetType
            })).unwrap();

            // Handle CCID notification if in inbox and we have data
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
            fetchCCBudgets();
        }

        return () => {
            firstLoadRef.current = false;
            // Only reset if not in inbox
            if (!isInbox) {
                dispatch(resetState());
            }
        };
    }, [userRoleId, effectiveBudgetType, fetchCCBudgets, dispatch, isInbox]);

  

    // State change notification
    useEffect(() => {
        onStateChange(localLoading || loading, hasContent);
        if (checkContent && !localLoading && !loading && !hasContent) {
            onEmpty();
        }
    }, [loading, localLoading, hasContent, checkContent, onEmpty, onStateChange]);

    const handleAction = useCallback(async (action) => {
        if (!selectedBudget) return;
        if (!remarks?.trim()) {
            showToast('error', `Please provide remarks before ${action === 'reject' ? 'rejecting' : 'verifying'}`);
            return;
        }

        try {
            await dispatch(updateCCBudget({
                id: selectedBudget._id,
                action,
                remarks
            })).unwrap();

            showToast('success', `Budget ${action === 'reject' ? 'rejected' : 'verified'} successfully`);
            setSelectedBudget(null);
            setRemarks('');

            // Reset data fetched flag and refetch
            dataFetchedRef.current = false;
            await fetchCCBudgets();
        } catch (error) {
            console.error('Action failed:', error);
            showToast('error', `Failed to ${action} budget. Please try again`);
        }
    }, [selectedBudget, remarks, dispatch, fetchCCBudgets]);

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

            <div className={`transition-max-height duration-500 ease-in-out overflow-hidden ${inboxExpanded ? 'max-h-screen' : 'max-h-0'}`}>
                {inboxExpanded && (
                    <div className='p-4 bg-white'>
                        <div className='overflow-x-auto'>
                            <table className='min-w-full'>
                                <thead className='text-gray-700'>
                                    <tr>
                                        <th className='border px-4 py-2'>Action</th>
                                        <th className='border px-4 py-2'>Cost Centre Code</th>
                                        <th className='border px-4 py-2'>Financial Year Applied</th>
                                        <th className='border px-4 py-2'>Financial Year</th>
                                        <th className='border px-4 py-2'>Assigned Budget</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {verificationBudgets.map((budget) => (
                                        <tr key={budget._id}>
                                            <td className='border px-4 py-2'>
                                                <FaRegEdit
                                                    className='text-yellow-600 cursor-pointer text-2xl'
                                                    onClick={() => setSelectedBudget(budget)}
                                                />
                                            </td>
                                            <td className='border px-4 py-2'>{budget.ccNo}</td>
                                            <td className='border px-4 py-2'>{budget.applyFiscalYear ? 'Yes' : 'No'}</td>
                                            <td className='border px-4 py-2'>{budget.fiscalYear || 'N/A'}</td>
                                            <td className='border px-4 py-2'>{budget.ccBudget}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {selectedBudget && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white fade-in">
                        <div className='absolute top-0 right-0 mt-4 mr-4'>
                            <button
                                onClick={() => setSelectedBudget(null)}
                                className='text-gray-400 hover:text-gray-500'
                            >
                                <FaTimes className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="mt-3">
                            <div className='mt-8 bg-gray-200 text-gray-500 px-6 py-4'>
                                <h3 className='text-2xl font-bold leading-tight'>Budget Details</h3>
                                <p className='text-lg mt-1 font-medium text-indigo-800'>
                                    <span className='font-bold'>Cost Centre Type:</span> {budgetTypeTitle}
                                </p>
                            </div>

                            <div className="mt-2 px-7 py-3">
                                <div className='grid grid-cols-3 gap-4 mb-4'>
                                    <div className='bg-indigo-400 p-4 rounded-md'>
                                        <p className='text-sm font-medium text-gray-600'>CC Code</p>
                                        <p className='text-xl font-bold text-indigo-800'>{selectedBudget.ccNo}</p>
                                    </div>
                                    <div className='bg-green-200 p-4 rounded-md'>
                                        <p className='text-sm font-medium text-gray-600'>CC Name</p>
                                        <p className='text-xl font-bold text-green-700'>{selectedBudget.ccName}</p>
                                    </div>
                                    <div className='bg-yellow-200 p-4 rounded-md'>
                                        <p className='text-sm font-medium text-gray-600'>Assigned Budget</p>
                                        <p className='text-xl font-bold text-yellow-700'>{selectedBudget.ccBudget}</p>
                                    </div>
                                </div>

                                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                    <div className="px-4 py-5 sm:px-6">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Additional Details</h3>
                                    </div>
                                    <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                                        <dl className="sm:divide-y sm:divide-gray-200">
                                            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                <dt className="text-sm font-medium text-gray-500">Fiancial Year Applicable</dt>
                                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedBudget.applyFiscalYear ? 'Yes' : 'No'}</dd>
                                            </div>
                                            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                <dt className="text-sm font-medium text-gray-500">Financial Year</dt>
                                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedBudget.fiscalYear || 'N/A'}</dd>
                                            </div>
                                            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                <dt className="text-sm font-medium text-gray-500">Transferred from Previous Year</dt>
                                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedBudget.transferredFromPreviousYear ? 'Yes' : 'No'}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>

                                <SignatureAndRemarks
                                    signatures={Array.isArray(selectedBudget.signatureAndRemarks) ?
                                        selectedBudget.signatureAndRemarks : []}
                                />

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

                            <div className="flex justify-end space-x-4 mt-6 px-6">
                                <button
                                    className="px-6 py-2 bg-indigo-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    onClick={() => handleAction('verify')}
                                    disabled={loading || localLoading}
                                >
                                    {(loading || localLoading) ? 'Processing...' : 'Verify'}
                                </button>
                                <button
                                    className="px-6 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
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
    );
}

export default React.memo(CCBudgetVerification);