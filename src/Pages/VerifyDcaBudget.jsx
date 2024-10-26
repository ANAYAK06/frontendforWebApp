import React, { useCallback, useEffect, useState } from 'react'
import { FaChevronDown } from "react-icons/fa6";
import { FaRegEdit, FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import SignatureAndRemarks from '../Components/SignatureAndRemarks';
import { fetchDCABudgetForVerification, updateDCABudget, rejectDCABudget, resetUpdateSuccess, resetRejectSuccess } from '../Slices/dcaBudgetSlices'
import { showToast } from '../utilities/toastUtilities';
import { useParams } from 'react-router-dom';



function VerifyDcaBudget({ budgetType: propBudgetType, checkContent, onEmpty }) {
    const params = useParams();
    const effectiveBudgetType = propBudgetType || params.budgetType || 'performing';

    const dispatch = useDispatch();
    const { dcaBudgetForVerification, loading, error, updateSuccess, rejectSuccess } = useSelector(state => state.dcaBudget);
    const userRoleId = useSelector(state => state.auth.userInfo.roleId)
    const [inboxExpanded, setInboxExpanded] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [remarks, setRemarks] = useState('');



    const getBudgetTypeTitle = useCallback(() => {
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
    }, [effectiveBudgetType])



    useEffect(() => {
        if (userRoleId) {
            dispatch(fetchDCABudgetForVerification({ userRoleId, budgetType: effectiveBudgetType }))
        }
    }, [dispatch, userRoleId, effectiveBudgetType])

    useEffect(() => {
        if (updateSuccess) {
            showToast('success', `${getBudgetTypeTitle()} verified successfully`)
            closeBudgetDetails()
            dispatch(fetchDCABudgetForVerification({ userRoleId }))
            dispatch(resetUpdateSuccess())
        }
        if (rejectSuccess) {
            showToast('error', `${getBudgetTypeTitle()} Rejected Successfully`)
            closeBudgetDetails()
            dispatch(fetchDCABudgetForVerification({ userRoleId }))
            dispatch(resetRejectSuccess())

        }
    }, [updateSuccess, rejectSuccess, dispatch, userRoleId, getBudgetTypeTitle])

    useEffect(() => {
        if (checkContent && !loading && dcaBudgetForVerification.length === 0) {
            onEmpty && onEmpty();
        }
    }, [checkContent, loading, dcaBudgetForVerification, onEmpty]);


    const toggleInbox = () => setInboxExpanded(!inboxExpanded);

    const openBudgetDetails = (budget) => setSelectedBudget(budget);

    const closeBudgetDetails = () => {
        setSelectedBudget(null);
        setRemarks('');
    };

    const handleVerify = async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before verifying')
            return
        }
        try {
            await dispatch(updateDCABudget({
                ccNo: selectedBudget.ccNo,
                remarks: remarks
            })).unwrap()

        } catch (error) {
            showToast('error', `Failed to verify ${getBudgetTypeTitle()}: ` + error.message)

        }

    };

    const handleReject = async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before rejecting')
            return
        }
        try {
            await dispatch(rejectDCABudget({
                ccNo: selectedBudget.ccNo,
                remarks: remarks
            })).unwrap()

        } catch (error) {
            showToast('error', `Failed To Reject ${getBudgetTypeTitle()}: ` + error.message)

        }


    };

    if (loading && !dcaBudgetForVerification.length) return <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
    </div>;

    if (error) {
        return <div className="text-red-500 text-center">Error: {error.message || JSON.stringify(error)}</div>;
    }

    if (!dcaBudgetForVerification || dcaBudgetForVerification.length === 0) return null;



    return (
        <div className='w-full bg-white shadow-md rounded-md overflow-hidden mb-4 mt-4'>

            <div className='p-4 bg-slate-100 flex justify-between items-center '>

                <div className='px-2 py-2 rounded-full bg-slate-300 cursor-pointer' onClick={toggleInbox}>
                    <FaChevronDown className={`text-gray-600 font-bold ${inboxExpanded ? 'rotate-180 duration-300' : ''}`} />
                </div>
                <div><h3 className='text-gray-600 font-bold'>{getBudgetTypeTitle()} Verification</h3></div>
                <div className='font-bold text-red-500'>({dcaBudgetForVerification.length})</div>

                <div className={`transition-max-height duration-500 ease-in-out overflow-hidden ${inboxExpanded ? 'max-h-screen' : 'max-h-0'}`}>
                    {inboxExpanded && (
                        <div className='p-4 bg-white'>
                            <div className=' overflow-x-auto'>
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
                                    <tbody className='item-centre justify-center'>
                                        {dcaBudgetForVerification.map((budget) => (
                                            <tr key={budget.ccNo}>
                                                <td className='border px-4 py-2'>
                                                    <FaRegEdit className='text-yellow-600 cursor-pointer text-2xl' onClick={() => openBudgetDetails(budget)} />
                                                </td>
                                                <td className='border px-4 py-2'>{budget.ccNo}</td>
                                                <td className='border px-4 py-2'>{budget.ccName}</td>
                                                <td className='border px-4 py-2'>{budget.ccBudget.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}</td>
                                                <td className='border px-4 py-2'>{budget.assignedBudget.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {inboxExpanded && dcaBudgetForVerification.length === 0 && (
                        <div className='mt-4 text-center text-gray-500'>No budgets available for verification</div>
                    )}
                </div>
            </div>


            {selectedBudget && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">

                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white fade-in">
                        <div className=' absolute top-0 right-0 mt-4 mr-4'>
                            <button onClick={closeBudgetDetails} className='text-gray-400 hover:text-gray-500'>
                                <FaTimes className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="mt-3">
                            <div className=' mt-8 bg-gray-200 text-gray-500 px-6 py-4'>
                                <h3 className='text-2xl font-bold leading-tight'>DCA Budget Details</h3>
                                <p className='text-lg mt-1 font-medium text-indigo-800'> <span className='font-bold'>CC CODE:</span>{selectedBudget.ccNo} , <span className='font-bold'>CC NAME:</span>{selectedBudget.ccName}</p>

                            </div>


                            <div className="mt-2 px-7 py-3">
                                <div className=' grid grid-cols-3 gap-4 mb-4'>
                                    <div className=' bg-indigo-400 p-4 rounded-md'>
                                        <p className='text-sm font-medium text-gray-600'>Assigend CC Budget</p>
                                        <p className='text-xl font-bold text-indigo-800'>{selectedBudget.ccBudget.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}</p>

                                    </div>
                                    <div className=' bg-green-200 p-4 rounded-md'>
                                        <p className='text-sm font-medium text-gray-600'>Balance Budget</p>
                                        <p className='text-xl font-bold text-green-700'>{selectedBudget.budgetBalance.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}</p>

                                    </div>
                                    <div className=' bg-yellow-200 p-4 rounded-md'>
                                        <p className='text-sm font-medium text-gray-600'> Used Budget</p>
                                        <p className='text-xl font-bold text-yellow-700'>{selectedBudget.assignedBudget.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}</p>

                                    </div>

                                </div>
                                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                    <div className="px-4 py-5 sm:px-6">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">DCA Allocations</h3>
                                    </div>
                                    <div className="border-t border-gray-200">
                                        <table className=' min-w-full divide-y divide-gray-200'>
                                            <thead className=' bg-gray-50'>
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DCA Code</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DCA Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Budget</th>

                                                </tr>

                                            </thead>
                                            <tbody className=' bg-white divide-y divide-gray-200'>
                                                {selectedBudget.budgets.map((dca) => (
                                                    <tr key={dca.dcaCode}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dca.dcaCode}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dca.dcaName}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{dca.assignedBudget.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}</td>
                                                    </tr>
                                                ))}

                                            </tbody>

                                        </table>

                                    </div>
                                </div>

                                <SignatureAndRemarks 
                            signatures={Array.isArray(selectedBudget.signatureAndRemarks) ? selectedBudget.signatureAndRemarks : []} 
                        />

                                <div className="mt-4">
                                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
                                        Remarks
                                    </label>
                                    <textarea
                                        id="remarks"
                                        name="remarks"
                                        rows="3"
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                                        placeholder="Enter your remarks here"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="items-center px-4 py-3">
                                <button
                                    id="ok-btn"
                                    className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
                                    onClick={handleVerify}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Verify'}
                                </button>
                                <button
                                    id="cancel-btn"
                                    className="mt-3 px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                                    onClick={handleReject}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default VerifyDcaBudget
