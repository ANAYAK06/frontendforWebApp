import React, { useCallback, useEffect, useState } from 'react'
import { FaChevronDown } from "react-icons/fa6";
import { FaRegEdit } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { fetchCCBudgetForVerification, updateCCBudget } from '../Slices/ccBudgetSlices';
import SignatureAndRemarks from './SignatureAndRemarks';
import { FaTimes } from "react-icons/fa";
import { showToast } from '../utilities/toastUtilities'



function CCBudgetVerification() {






    const dispatch = useDispatch()

    const { verificationBudgets, loading, error } = useSelector((state) => state.ccBudget)
    const userRoleId = useSelector(state => state.auth.userInfo.roleId)

    const [inboxarrowClicked, setInboxarrowClicked] = useState(false)
    const [selectedBudget, setSelectedBudget] = useState(null)
    const [remarks, setRemarks] = useState(null)







    const toggleInboxarrow = useCallback(() => {
        setInboxarrowClicked(prev => !prev)
    }, [])

    useEffect(() => {
        if (selectedBudget) {
            console.log('Selected Budget:', selectedBudget);
            console.log('Signature and Remarks:', selectedBudget.signatureAndRemarks);
        }
    }, [selectedBudget]);

    const fetchCCBudgets = useCallback(() => {
        if (userRoleId) {
            dispatch(fetchCCBudgetForVerification({ userRoleId }))
        }
    }, [dispatch, userRoleId])

    useEffect(() => {
        fetchCCBudgets()
    }, [fetchCCBudgets])

    const handleEdit = useCallback((budget) => {
        setSelectedBudget(budget)
        setRemarks('')
    }, [])

    const handleClose = useCallback(() => {
        setSelectedBudget(null)
        setRemarks('')
    }, [])

    const handleAction = useCallback(async (action) => {
        if (!selectedBudget) return;
        if (!remarks.trim()) {
            showToast('error', `Please Provide Remarks before ${action === 'reject' ? 'rejecting' : 'verifying'}`)
            return
        }

        try {
            await dispatch(updateCCBudget({
                id: selectedBudget._id,
                action,
                remarks
            })).unwrap()
            showToast('success', `Budget ${action === 'reject' ? 'rejected' : 'verified'} successfully`);
            handleClose()

            fetchCCBudgets()


        } catch (error) {
            showToast('error', `Failed to ${action} budget. Please try again`)
        }
    }, [selectedBudget, remarks, dispatch, handleClose, fetchCCBudgets])



    if (loading) return <div className="flex justify-center items-center h-screen"> Loading....</div>
    if (error) return <div className="text-red-500 text-center">{error}</div>;
    if (verificationBudgets.length === 0) return null





    return (


        <>




            <div className='w-full bg-white shadow-md rounded-md overflow-hidden mb-4'>



                <div className='p-4  bg-slate-100 flex justify-between items-center'>
                    <div className='flex justify-between items-center'>
                        <div className='px-2 py-2 rounded-full bg-slate-300 cursor-pointer' onClick={toggleInboxarrow}><FaChevronDown className={`' text-gray-600 font-bold' ${inboxarrowClicked && 'rotate-180 duration-300'}`} /></div>
                        <div><h3 className='text-gray-600 font-bold'>CC Budget Assigned</h3></div>
                        <div className='font-bold text-red-500'>{verificationBudgets.length} </div>


                    </div>
                    <div className={`transition-max-height duration-500 ease-in-out overflow-hidden ${inboxarrowClicked ? 'max-h-screen' : 'max-h-0'}`}>
                        {
                            inboxarrowClicked && (

                                <div className='p-4 bg-white'>

                                




                                <div className=' overflow-x-auto'>
                                    <table className=' min-w-full'>
                                        <thead className='text-gray-700'>
                                            <tr>
                                                <th className='border px-4 py-2'>Action</th>
                                                <th className='border px-4 py-2'>Cost Centre Code</th>
                                                <th className='border px-4 py-2'>Financial Year Applied</th>
                                                <th className='border px-4 py-2'>Financial Year</th>
                                                <th className='border px-4 py-2'>Assigned Budget</th>
                                            </tr>
                                        </thead>
                                        <tbody className='item-centre justify-center'>
                                            {verificationBudgets.map((budget) => (
                                                <tr key={budget._id}>
                                                    <td className='border px-4 py-2'><FaRegEdit onClick={() => handleEdit(budget)} className='text-yellow-600 cursor-pointer text-2xl' /></td>
                                                    <td className=' border px-4 py-2'>{budget.ccNo}</td>
                                                    <td className=' border px-4 py-2'>{budget.applyFiscalYear ? 'Yes' : 'No'}</td>
                                                    <td className=' border px-4 py-2'>{budget.fiscalYear || 'N/A'}</td>
                                                    <td className=' border px-4 py-2'>{budget.ccBudget}</td>

                                                </tr>

                                            ))}


                                        </tbody>

                                    </table>

                                </div>
                                 </div>





                            )
                        }

                    </div>

                </div>







                {selectedBudget && (
                    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
                        <div className='relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white'>
                            <div className='flex justify-between items-center border-b pb-3'>
                                <h3 className='text-lg leading-6 font-medium text-gray-900'>Verify CC Budget</h3>
                                <button onClick={handleClose} className='text-gray-900 font-medium text-lg'>
                                    <FaTimes className='text-xl' />
                                </button>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <p className='text-sm font-medium text-gray-500'>CC Code: </p>
                                    <p className='text-sm text-gray-900'>{selectedBudget.ccNo}</p>
                                </div>
                                <div>
                                    <p className='text-sm font-medium text-gray-500'>Financial Year Applied:</p>
                                    <p className='text-sm text-gray-900'>{selectedBudget.applyFiscalYear ? 'Yes' : 'No'}</p>
                                </div>
                                <div>
                                    <p className='text-sm font-medium text-gray-500'>Financial Year: </p>
                                    <p className='text-sm text-gray-900'>{selectedBudget.fiscalYear || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className='text-sm font-medium text-gray-500'> Assigned Budget: </p>
                                    <p className='text-sm text-gray-900'>{selectedBudget.ccBudget}</p>
                                </div>
                            </div>

                            <div className='mt-4'>
                                <label htmlFor="remarks" className='block text-sm font-medium text-gray-700'>Remarks</label>
                                <textarea
                                    name="remarks"
                                    id="remarks"
                                    rows="3"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder='Your comments (required)'
                                    required
                                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm'
                                ></textarea>
                            </div>

                            <SignatureAndRemarks signatures={selectedBudget.signatureAndRemarks} />

                            <div className='mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense'>
                                <button
                                    onClick={() => handleAction('reject')}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-1 sm:text-sm"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleAction('verify')}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-2 sm:text-sm"
                                >
                                    Verify
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </>
    )
}



export default CCBudgetVerification
