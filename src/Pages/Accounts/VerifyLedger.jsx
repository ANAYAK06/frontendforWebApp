import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { FaChevronDown } from "react-icons/fa6";
import { FaRegEdit, FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import SignatureAndRemarks from '../../Components/SignatureAndRemarks';
import { fetchVerificationLedgers, updateLedger, rejectGeneralLedger,  resetRejectSuccess, resetUpdateSuccess } from '../../Slices/ledgerSlices'
import { showToast } from '../../utilities/toastUtilities';
import { fetchAccountGroups } from '../../Slices/groupSlices'

const defaultProps = {
    checkContent: true,
    onEmpty: () => {},
    onStateChange: () => {}
};

function VerifyLedger(props) {

    const { checkContent, onEmpty, onStateChange } = { ...defaultProps, ...props };
    
    const dispatch = useDispatch();
    const { ledgersForVerification, loading, error, updateSuccess, rejectSuccess } = useSelector(state => state.ledger);
    const userRoleId = useSelector(state => state.auth.userInfo.roleId)
    const [inboxExpanded, setInboxExpanded] = useState(false);
    const [selectedLedger, setSelectedLedger] = useState(null);
    const [remarks, setRemarks] = useState('');
    const {groups} = useSelector((state) => state.group)


    const hasContent = useMemo(() => ledgersForVerification.length > 0, [ledgersForVerification])

    useEffect(()=>{
        console.log('Groups Fetched', groups)
    },[groups])


    const groupLookup = useMemo(() => {
        return groups.reduce((acc, group) => {
            acc[group._id] = group.groupName;
            return acc;
        }, {});
    }, [groups]);



    useEffect(()=>{
        dispatch(fetchAccountGroups())
    }, [dispatch])

  
    
    const closeLedgerDetails = useCallback(() => {
        setSelectedLedger(null);
        setRemarks('');
    },[])
    

    useEffect(() => {
        if (userRoleId) {
            dispatch(fetchVerificationLedgers( userRoleId ))
        }
    }, [dispatch, userRoleId])

    
    useEffect(() => {
        onStateChange(loading, hasContent);
    }, [loading, hasContent, onStateChange]);

    useEffect(() => {
        if (updateSuccess) {
            showToast('success', 'Ledger verified successfully')
            closeLedgerDetails()
            dispatch(fetchVerificationLedgers( userRoleId ))
            dispatch(resetUpdateSuccess())
           
        }
        if (rejectSuccess) {
            showToast('error', 'Ledger Rejected Successfully')
            closeLedgerDetails()
            dispatch(fetchVerificationLedgers( userRoleId ))
            dispatch(resetRejectSuccess())
        }
    }, [updateSuccess, rejectSuccess, dispatch, userRoleId, closeLedgerDetails])

    const toggleInbox = () => setInboxExpanded(!inboxExpanded);

    const openLedgerDetails = (ledger) => setSelectedLedger(ledger);


    const handleVerify = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before verifying')
            return
        }
        if (!selectedLedger || !selectedLedger._id) {
            showToast('error', 'No ledger selected or invalid ledger ID')
            return
        }
        try {
            
            await dispatch(updateLedger({
                id: selectedLedger._id,
                updateData: {remarks:remarks}
            })).unwrap()
           
        } catch (error) {
            showToast('error', 'Failed to verify Ledger: ' + error.message)
        }
    }, [dispatch, selectedLedger, remarks]);

    const handleReject = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before rejecting')
            return
        }
        try {
            await dispatch(rejectGeneralLedger({
                id: selectedLedger._id,
                remarks: remarks
            })).unwrap()
        } catch (error) {
            showToast('error', 'Failed To Reject Ledger: ' + error.message)
        }
    }, [dispatch, selectedLedger, remarks]);

    if (loading && !ledgersForVerification.length) return <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
    </div>;

     // Modify the error handling
     if (error) return null;

     if (!hasContent) return null;

    return (
        <div className='w-full bg-white shadow-md rounded-md overflow-hidden mb-4 mt-4'>
            <div className='p-4 bg-slate-100 flex justify-between items-center'>
                <div className='px-2 py-2 rounded-full bg-slate-300 cursor-pointer' onClick={toggleInbox}>
                    <FaChevronDown className={`text-gray-600 font-bold ${inboxExpanded ? 'rotate-180 duration-300' : ''}`} />
                </div>
                <div><h3 className='text-gray-600 font-bold'>Ledger Verification</h3></div>
                <div className='font-bold text-red-500'>({ledgersForVerification.length})</div>
            </div>
            
            <div className={`transition-max-height duration-500 ease-in-out overflow-hidden ${inboxExpanded ? 'max-h-screen' : 'max-h-0'}`}>
                {inboxExpanded && (
                    <div className='p-4 bg-white'>
                        <div className='overflow-x-auto'>
                            <table className='min-w-full'>
                                <thead className='text-gray-700'>
                                    <tr>
                                        <th className='border px-4 py-2'>Action</th>
                                        <th className='border px-4 py-2'>Ledger Name</th>
                                        <th className='border px-4 py-2'>Group</th>
                                        <th className='border px-4 py-2'>Opening Balance</th>
                                        <th className='border px-4 py-2'>Balance Type</th>
                                    </tr>
                                </thead>
                                <tbody className='item-centre justify-center'>
                                    {ledgersForVerification.map((ledger) => (
                                        <tr key={ledger._id}>   
                                            <td className='border px-4 py-2'>
                                                <FaRegEdit className='text-yellow-600 cursor-pointer text-2xl' onClick={() => openLedgerDetails(ledger)} />
                                            </td>
                                            <td className='border px-4 py-2'>{ledger.ledgerName || 'N/A'}</td>
                                            <td className='border px-4 py-2'>{groupLookup[ledger.groupId] || 'Unknown Group'}</td>
                                            <td className='border px-4 py-2'>{typeof ledger.openingBalance === 'number' ? ledger.openingBalance.toLocaleString('en-US', { style: 'currency', currency: 'INR' }) : 'N/A'}</td>
                                            <td className='border px-4 py-2'>{ledger.balanceType || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {selectedLedger && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white fade-in">
                        <div className='absolute top-0 right-0 mt-4 mr-4'>
                            <button onClick={closeLedgerDetails} className='text-gray-400 hover:text-gray-500'>
                                <FaTimes className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="mt-3">
                            <div className='mt-8 bg-gray-200 text-gray-500 px-6 py-4'>
                                <h3 className='text-2xl font-bold leading-tight'>Ledger Details</h3>
                                <p className='text-lg mt-1 font-medium text-indigo-800'>
                                    <span className='font-bold'>Ledger Name:</span> {selectedLedger.ledgerName}
                                </p>
                            </div>

                            <div className="mt-2 px-7 py-3">
                                <div className='grid grid-cols-3 gap-4 mb-4'>
                                    <div className='bg-indigo-400 p-4 rounded-md'>
                                        <p className='text-sm font-medium text-gray-600'>Group</p>
                                        <p className='text-xl font-bold text-indigo-800'>{groupLookup[selectedLedger.groupId] || 'Unknown Group'}</p>
                                    </div>
                                    <div className='bg-green-200 p-4 rounded-md'>
                                        <p className='text-sm font-medium text-gray-600'>Opening Balance</p>
                                        <p className='text-xl font-bold text-green-700'>{selectedLedger.openingBalance.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}</p>
                                    </div>
                                    <div className='bg-yellow-200 p-4 rounded-md'>
                                        <p className='text-sm font-medium text-gray-600'>Balance Type</p>
                                        <p className='text-xl font-bold text-yellow-700'>{selectedLedger.balanceType}</p>
                                    </div>
                                </div>

                                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                    <div className="px-4 py-5 sm:px-6">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Additional Details</h3>
                                    </div>
                                    <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                                        <dl className="sm:divide-y sm:divide-gray-200">
                                            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                <dt className="text-sm font-medium text-gray-500">TDS Applicable</dt>
                                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedLedger.isTDSApplicable ? 'Yes' : 'No'}</dd>
                                            </div>
                                            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                <dt className="text-sm font-medium text-gray-500">TCS Applicable</dt>
                                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedLedger.isTCSApplicable ? 'Yes' : 'No'}</dd>
                                            </div>
                                            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                <dt className="text-sm font-medium text-gray-500">GST Applicable</dt>
                                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedLedger.isGSTApplicable ? 'Yes' : 'No'}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>

                                <SignatureAndRemarks signatures={Array.isArray(selectedLedger.signatureAndRemarks) ? selectedLedger.signatureAndRemarks : []}  />

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
                            <div className="flex justify-end space-x-4 mt-6 px-6">
                                <button
                                    className="px-6 py-2 bg-indigo-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    onClick={handleVerify}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Verify'}
                                </button>
                                <button
                                    className="px-6 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
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
    );
}

export default React.memo (VerifyLedger)