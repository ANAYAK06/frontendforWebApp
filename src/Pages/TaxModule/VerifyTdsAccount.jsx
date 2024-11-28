import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FaChevronDown, FaRegEdit, FaTimes, FaPercent } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import SignatureAndRemarks from '../../Components/SignatureAndRemarks';
import {
    fetchVerificationTdsAccounts,
    updateTdsAccount,
    rejectTdsAccountThunk,
    resetRejectSuccess,
    resetUpdateSuccess
} from '../../Slices/tdsAccountSlices';
import { fetchAccountGroups } from '../../Slices/groupSlices';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '../../Components/DailogComponent';
import { showToast } from '../../utilities/toastUtilities';

const defaultProps = {
    checkContent: true,
    onEmpty: () => {},
    onStateChange: () => {}
};

function VerifyTdsAccount(props) {
    const { checkContent, onEmpty, onStateChange } = { ...defaultProps, ...props };
    
    const dispatch = useDispatch();
    const { accountsForVerification, loading, error, updateSuccess, rejectSuccess } = useSelector(state => state.tds);
    const userRoleId = useSelector(state => state.auth.userInfo.roleId);
    const [inboxExpanded, setInboxExpanded] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    const { groups } = useSelector((state) => state.group);

    const hasContent = useMemo(() => accountsForVerification?.length > 0, [accountsForVerification]);

  

    useEffect(() => {
        dispatch(fetchAccountGroups());
        
    }, [dispatch]);

    const getGroupName = useCallback((groupId) => {
        const group = groups.find(g => g._id === groupId);
        return group?.groupName || 'N/A';
    }, [groups]);


   
    useEffect(() => {
        if (userRoleId) {
            dispatch(fetchVerificationTdsAccounts(userRoleId));
        }
    }, [dispatch, userRoleId]);

    useEffect(() => {
        onStateChange(loading, hasContent);
    }, [loading, hasContent, onStateChange]);

    const closeAccountDetails = useCallback(() => {
        setSelectedAccount(null);
        setRemarks('');
    }, []);


    useEffect(() => {
        if (updateSuccess) {
            showToast('success', 'TDS account verified successfully');
            closeAccountDetails();
            dispatch(fetchVerificationTdsAccounts(userRoleId));
            dispatch(resetUpdateSuccess());
        }
        if (rejectSuccess) {
            showToast('error', 'TDS Account Rejected Successfully');
            closeAccountDetails();
            dispatch(fetchVerificationTdsAccounts(userRoleId));
            dispatch(resetRejectSuccess());
        }
    }, [updateSuccess, rejectSuccess, dispatch, userRoleId, closeAccountDetails]);

  
    const openAccountDetails = useCallback((account) => {
        setSelectedAccount(account);
    }, []);

    const handleVerify = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before verifying');
            return;
        }
        try {
            await dispatch(updateTdsAccount({
                id: selectedAccount._id,
                updateData: { remarks: remarks }
            })).unwrap();
        } catch (error) {
            showToast('error', 'Failed to verify TDS account: ' + error.message);
        }
    }, [dispatch, selectedAccount, remarks]);

    const handleReject = useCallback(() => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before rejecting');
            return;
        }
        setShowRejectDialog(true);
    }, [remarks]);

    const handleConfirmedReject = useCallback(async () => {
        try {
            await dispatch(rejectTdsAccountThunk({
                id: selectedAccount._id,
                remarks: remarks
            })).unwrap();
        } catch (error) {
            showToast('error', 'Failed to reject TDS account: ' + error.message);
        }
        setShowRejectDialog(false);
    }, [dispatch, selectedAccount, remarks]);

    if (loading && !accountsForVerification?.length) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error || !hasContent) return null;

  

    return (
        <>
            <div className="w-full bg-white shadow-md rounded-md overflow-hidden mb-4 mt-4">
                <div className="p-4 bg-slate-100 flex justify-between items-center">
                    <div className="px-2 py-2 rounded-full bg-slate-300 cursor-pointer" onClick={() => setInboxExpanded(!inboxExpanded)}>
                        <FaChevronDown className={`text-gray-600 font-bold ${inboxExpanded ? 'rotate-180 duration-300' : ''}`} />
                    </div>
                    <div><h3 className="text-gray-600 font-bold">TDS Account Verification</h3></div>
                    <div className="font-bold text-red-500">({accountsForVerification?.length || 0})</div>
                </div>

                <div className={`transition-max-height duration-500 ease-in-out overflow-hidden ${inboxExpanded ? 'max-h-screen' : 'max-h-0'}`}>
                    {inboxExpanded && (
                        <div className="p-4 bg-white">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="text-gray-700">
                                        <tr>
                                            <th className="border px-4 py-2">Action</th>
                                            <th className="border px-4 py-2">Account Name</th>
                                            <th className="border px-4 py-2">TDS Section</th>
                                            <th className="border px-4 py-2">Individual Rate</th>
                                            <th className="border px-4 py-2">Company Rate</th>
                                            <th className="border px-4 py-2">Opening Balance</th>
                                            <th className="border px-4 py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {accountsForVerification?.map((account) => (
                                            <tr key={account._id} className="hover:bg-gray-50">
                                                <td className="border px-4 py-2">
                                                    <FaRegEdit
                                                        className="text-yellow-600 cursor-pointer text-2xl"
                                                        onClick={() => openAccountDetails(account)}
                                                    />
                                                </td>
                                                <td className="border px-4 py-2">{account.tdsAccountName}</td>
                                                <td className="border px-4 py-2">{account.tdsAccountSec}</td>
                                                <td className="border px-4 py-2">{account.taxRules?.individual}%</td>
                                                <td className="border px-4 py-2">{account.taxRules?.companiesAndFirms}%</td>
                                                <td className="border px-4 py-2">
                                                    {account.openingBalance.toLocaleString('en-IN', {
                                                        style: 'currency',
                                                        currency: 'INR'
                                                    })}
                                                </td>
                                                <td className="border px-4 py-2">
                                                    <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">
                                                        {account.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {selectedAccount && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 fade-in">
                        <div className="relative mx-auto p-6 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
                            <button onClick={closeAccountDetails} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500">
                                <FaTimes className="h-6 w-6" />
                            </button>

                            <div className="mt-4">
                                {/* Header Section */}
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-t-lg">
                                    <div className="flex items-center space-x-4">
                                        <FaPercent className="h-8 w-8" />
                                        <div>
                                            <h3 className="text-2xl font-bold">TDS Account Details</h3>
                                            <p className="text-lg opacity-90">{selectedAccount.tdsAccountName}</p>
                                            <p className="text-lg opacity-90">Section: {selectedAccount.tdsAccountSec}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                        {/* Basic Details Card */}
                                        <div className="bg-white p-6 rounded-lg shadow-md">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Account Overview</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-indigo-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Opening Balance</p>
                                                    <p className="text-lg font-semibold text-indigo-700">
                                                        {selectedAccount.openingBalance.toLocaleString('en-IN', {
                                                            style: 'currency',
                                                            currency: 'INR'
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="bg-purple-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Accounting Group</p>
                                                    <p className="text-lg font-semibold text-purple-700">
                                                        {getGroupName(selectedAccount.accountingGroupId)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-6">
                                        {/* Tax Rules Card */}
                                        <div className="bg-white p-6 rounded-lg shadow-md">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Tax Rules</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-blue-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Individual Rate</p>
                                                    <p className="text-lg font-semibold text-blue-700">
                                                        {selectedAccount.taxRules.individual}%
                                                    </p>
                                                </div>
                                                <div className="bg-green-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">HUF Rate</p>
                                                    <p className="text-lg font-semibold text-green-700">
                                                        {selectedAccount.taxRules.huf}%
                                                    </p>
                                                </div>
                                                <div className="bg-yellow-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Companies & Firms Rate</p>
                                                    <p className="text-lg font-semibold text-yellow-700">
                                                        {selectedAccount.taxRules.companiesAndFirms}%
                                                    </p>
                                                </div>
                                                <div className="bg-red-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Others Rate</p>
                                                    <p className="text-lg font-semibold text-red-700">
                                                        {selectedAccount.taxRules.others}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Signatures and Remarks Section */}
                                <div className="mt-6">
                                    <div className="bg-white p-6 rounded-lg shadow-md">
                                        <SignatureAndRemarks
                                            signatures={selectedAccount.signatureAndRemarks || []}
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
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 flex justify-end space-x-4">
                                    <button
                                        onClick={handleVerify}
                                        disabled={loading}
                                        className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-base font-medium rounded-md shadow-sm hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        {loading ? 'Processing...' : 'Verify'}
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        disabled={loading}
                                        className="px-6 py-2 bg-red-100 text-red-700 text-base font-medium rounded-md shadow-sm hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                    >
                                        {loading ? 'Processing...' : 'Reject'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Reject Confirmation Dialog */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                            Confirm TDS Account Rejection
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-gray-600">
                            Are you sure you want to reject TDS account "{selectedAccount?.tdsAccountName}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmedReject}
                            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md"
                        >
                            Yes, Reject TDS Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-5 rounded-lg flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                        <span className="text-lg font-medium text-gray-700">Processing...</span>
                    </div>
                </div>
            )}
        </>
    );
}

export default React.memo(VerifyTdsAccount);