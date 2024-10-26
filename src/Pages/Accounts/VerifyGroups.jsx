import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { FaChevronDown } from "react-icons/fa6";
import { FaRegEdit, FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import SignatureAndRemarks from '../../Components/SignatureAndRemarks';
import { 
    fetchGroupsForVerificationThunk, 
    verifyGroupThunk, 
    rejectGroupThunk,
    resetVerificationStatus
} from '../../Slices/groupSlices'
import { showToast } from '../../utilities/toastUtilities';

const defaultProps = {
    checkContent: true,
    onEmpty: () => {},
    onStateChange: () => {}
};


function VerifyGroups(props) {

    const {  onStateChange } = { ...defaultProps, ...props };
    const dispatch = useDispatch();
    const { groupsForVerification, verificationLoading, verificationError, verificationSuccess, rejectionSuccess } = useSelector(state => state.group);
    const userRoleId = useSelector(state => state.auth.userInfo.roleId)
    const [inboxExpanded, setInboxExpanded] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [remarks, setRemarks] = useState('');

    const hasContent = useMemo(() => groupsForVerification.length > 0, [groupsForVerification])

    useEffect(() => {
        if (userRoleId) {
            dispatch(fetchGroupsForVerificationThunk(userRoleId))
        }
    }, [dispatch, userRoleId])

    useEffect(() => {
        onStateChange(verificationLoading, hasContent);
    }, [verificationLoading, hasContent, onStateChange]);
    useEffect(() => {
        if (verificationSuccess) {
            showToast('success', 'Group verified successfully')
            closeGroupDetails()
            dispatch(fetchGroupsForVerificationThunk(userRoleId))
            dispatch(resetVerificationStatus())
        }
        if (rejectionSuccess) {
            showToast('error', 'Group Rejected Successfully')
            closeGroupDetails()
            dispatch(fetchGroupsForVerificationThunk(userRoleId))
            dispatch(resetVerificationStatus())
        }
    }, [verificationSuccess, rejectionSuccess, dispatch, userRoleId])

    const toggleInbox = () => setInboxExpanded(!inboxExpanded);

    const openGroupDetails = (group) => setSelectedGroup(group);

    const closeGroupDetails = () => {
        setSelectedGroup(null);
        setRemarks('');
    };

    const handleVerify = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before verifying')
            return
        }
        if (!selectedGroup || !selectedGroup._id) {
            showToast('error', 'No group selected or invalid group ID')
            return
        }
        try {
            await dispatch(verifyGroupThunk({
                id: selectedGroup._id,
                remarks: remarks
            })).unwrap()
        } catch (error) {
            showToast('error', 'Failed to verify Group: ' + error.message)
        }
    }, [dispatch, selectedGroup, remarks]);

    const handleReject = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before rejecting')
            return
        }
        try {
            await dispatch(rejectGroupThunk({
                id: selectedGroup._id,
                remarks: remarks
            })).unwrap()
        } catch (error) {
            showToast('error', 'Failed To Reject Group: ' + error.message)
        }
    }, [dispatch, selectedGroup, remarks]);

    if (verificationLoading && !groupsForVerification.length) return <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
    </div>;

    if (verificationError) return null

    if (!hasContent) return null;


    const getNatureDescription = (natureId) => {
        switch (natureId) {
            case 1:
                return 'Expenses';
            case 2:
                return 'Income';
            case 3:
                return 'Asset';
            case 4:
                return 'Liability';
            default:
                return 'Unknown';
        }
    };


    return (
        <div className='w-full bg-white shadow-md rounded-md overflow-hidden mb-4 mt-4'>
            <div className='p-4 bg-slate-100 flex justify-between items-center'>
                <div className='px-2 py-2 rounded-full bg-slate-300 cursor-pointer' onClick={toggleInbox}>
                    <FaChevronDown className={`text-gray-600 font-bold ${inboxExpanded ? 'rotate-180 duration-300' : ''}`} />
                </div>
                <div><h3 className='text-gray-600 font-bold'>Group Verification</h3></div>
                <div className='font-bold text-red-500'>({groupsForVerification.length})</div>
            </div>
            
            <div className={`transition-max-height duration-500 ease-in-out overflow-hidden ${inboxExpanded ? 'max-h-screen' : 'max-h-0'}`}>
                {inboxExpanded && (
                    <div className='p-4 bg-white'>
                        <div className='overflow-x-auto'>
                            <table className='min-w-full'>
                                <thead className='text-gray-700'>
                                    <tr>
                                        <th className='border px-4 py-2'>Action</th>
                                        <th className='border px-4 py-2'>Group Name</th>
                                        <th className='border px-4 py-2'>Parent Group</th>
                                        <th className='border px-4 py-2'>Nature</th>
                                        <th className='border px-4 py-2'>Affects Gross Profit</th>
                                    </tr>
                                </thead>
                                <tbody className='item-centre justify-center'>
                                    {groupsForVerification.map((group) => (
                                        <tr key={group._id}>   
                                            <td className='border px-4 py-2'>
                                                <FaRegEdit className='text-yellow-600 cursor-pointer text-2xl' onClick={() => openGroupDetails(group)} />
                                            </td>
                                            <td className='border px-4 py-2'>{group.groupName}</td>
                                            <td className='border px-4 py-2'>{group.groupUnder}</td>
                                            <td className='border px-4 py-2'>{getNatureDescription(group.natureId)}</td>
                                            <td className='border px-4 py-2'>{group.affectsGrossProfit ? 'Yes' : 'No'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {selectedGroup && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white fade-in">
                        <div className='absolute top-0 right-0 mt-4 mr-4'>
                            <button onClick={closeGroupDetails} className='text-gray-400 hover:text-gray-500'>
                                <FaTimes className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="mt-3">
                            <div className='mt-8 bg-gray-200 text-gray-500 px-6 py-4'>
                                <h3 className='text-2xl font-bold leading-tight'>Group Details</h3>
                                <p className='text-lg mt-1 font-medium text-indigo-800'>
                                    <span className='font-bold'>Group Name:</span> {selectedGroup.groupName}
                                </p>
                            </div>

                            <div className="mt-2 px-7 py-3">
                                <div className='grid grid-cols-3 gap-4 mb-4'>
                                    <div className='bg-indigo-400 p-4 rounded-md'>
                                        <p className='text-sm font-medium text-gray-600'>Parent Group</p>
                                        <p className='text-xl font-bold text-indigo-800'>{selectedGroup.groupUnder}</p>
                                    </div>
                                    <div className='bg-green-200 p-4 rounded-md'>
                                        <p className='text-sm font-medium text-gray-600'>Nature</p>
                                        <p className='text-xl font-bold text-green-700'>{getNatureDescription(selectedGroup.natureId)}</p>
                                    </div>
                                    <div className='bg-yellow-200 p-4 rounded-md'>
                                        <p className='text-sm font-medium text-gray-600'>Affects Gross Profit</p>
                                        <p className='text-xl font-bold text-yellow-700'>{selectedGroup.affectsGrossProfit ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>

                                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                    <div className="px-4 py-5 sm:px-6">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Additional Details</h3>
                                    </div>
                                    <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                                        <dl className="sm:divide-y sm:divide-gray-200">
                                            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                <dt className="text-sm font-medium text-gray-500">Report Type</dt>
                                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedGroup.reportType}</dd>
                                            </div>
                                            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                <dt className="text-sm font-medium text-gray-500">Report Index</dt>
                                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedGroup.reportIndex}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>

                                <SignatureAndRemarks signatures={Array.isArray(selectedGroup.signatureAndRemarks)? selectedGroup.signatureAndRemarks :[] } />

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
                                    disabled={verificationLoading}
                                >
                                    {verificationLoading ? 'Processing...' : 'Verify'}
                                </button>
                                <button
                                    className="px-6 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    onClick={handleReject}
                                    disabled={verificationLoading}
                                >
                                    {verificationLoading ? 'Processing' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default React.memo (VerifyGroups)