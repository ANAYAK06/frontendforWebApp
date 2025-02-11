import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FaChevronDown, FaRegEdit, FaTimes, FaBuilding } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import SignatureAndRemarks from '../../Components/SignatureAndRemarks';
import {
    fetchClientsForVerification,
    verifyClientStatus,
    rejectClientStatus
} from '../../Slices/accountsModuleSlices/clientSlices';
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
    onEmpty: () => { },
    onStateChange: () => { }
};

function VerifyClient(props)  {
    const { checkContent, onEmpty, onStateChange } = { ...defaultProps, ...props };
    const dispatch = useDispatch();
    const { clientsForVerification, loading:{fetchClientsForVerification:loading}, error:{fetchClientsForVerification:error} } = useSelector(state => state.client);
    const userRoleId = useSelector(state => state.auth.userInfo.roleId);
    
    const [inboxExpanded, setInboxExpanded] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    const hasContent = useMemo(() => clientsForVerification?.length > 0, [clientsForVerification]);

    useEffect(() => {
        if (userRoleId) {
            dispatch(fetchClientsForVerification(userRoleId));
        }
    }, [dispatch, userRoleId]);

    const closeDetails = useCallback(() => {
        setSelectedClient(null);
        setRemarks('');
    }, []);

    const handleVerify = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before verifying');
            return;
        }
        try {
            await dispatch(verifyClientStatus({
                id: selectedClient._id,
                remarks: remarks
            })).unwrap();
            showToast('success', 'Client verified successfully');
            closeDetails();
            dispatch(fetchClientsForVerification(userRoleId));
        } catch (error) {
            showToast('error', error.message || 'Failed to verify client');
        }
    }, [dispatch, selectedClient, remarks, userRoleId, closeDetails]);

    const handleReject = useCallback(() => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before rejecting');
            return;
        }
        setShowRejectDialog(true);
    }, [remarks]);

    const handleConfirmedReject = useCallback(async () => {
        try {
            await dispatch(rejectClientStatus({
                id: selectedClient._id,
                remarks: remarks
            })).unwrap();
            showToast('error', 'Client rejected successfully');
            closeDetails();
            dispatch(fetchClientsForVerification(userRoleId));
        } catch (error) {
            showToast('error', error.message || 'Failed to reject client');
        }
        setShowRejectDialog(false);
    }, [dispatch, selectedClient, remarks, userRoleId, closeDetails]);

   

    if (loading && !clientsForVerification?.length) {
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
                    <div 
                        className="px-2 py-2 rounded-full bg-slate-300 cursor-pointer" 
                        onClick={() => setInboxExpanded(!inboxExpanded)}
                    >
                        <FaChevronDown className={`text-gray-600 font-bold ${inboxExpanded ? 'rotate-180 duration-300' : ''}`} />
                    </div>
                    <div><h3 className="text-gray-600 font-bold">Client Verification</h3></div>
                    <div className="font-bold text-red-500">({clientsForVerification?.length || 0})</div>
                </div>

                <div className={`transition-max-height duration-500 ease-in-out overflow-hidden ${inboxExpanded ? 'max-h-screen' : 'max-h-0'}`}>
                    {inboxExpanded && (
                        <div className="p-4 bg-white">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="text-gray-700">
                                        <tr>
                                            <th className="border px-4 py-2">Action</th>
                                            <th className="border px-4 py-2">Client Code</th>
                                            <th className="border px-4 py-2">Client Name</th>
                                            <th className="border px-4 py-2">GST Number</th>
                                            <th className="border px-4 py-2">Client Type</th>
                                            <th className="border px-4 py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clientsForVerification?.map((client) => (
                                            <tr key={client._id} className="hover:bg-gray-50">
                                                <td className="border px-4 py-2">
                                                    <FaRegEdit
                                                        className="text-yellow-600 cursor-pointer text-2xl"
                                                        onClick={() => setSelectedClient(client)}
                                                    />
                                                </td>
                                                <td className="border px-4 py-2">{client.clientCode}</td>
                                                <td className="border px-4 py-2">{client.clientName}</td>
                                                <td className="border px-4 py-2">{client.mainGstNumber}</td>
                                                <td className="border px-4 py-2">
                                                    <span className="px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                                                        {client.clientType}
                                                    </span>
                                                </td>
                                                <td className="border px-4 py-2">
                                                    <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">
                                                        {client.status}
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

                {/* Client Details Modal */}
                {selectedClient && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                        <div className="relative mx-auto p-6 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
                            <button onClick={closeDetails} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500">
                                <FaTimes className="h-6 w-6" />
                            </button>

                            <div className="mt-4">
                                {/* Header Section */}
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-t-lg">
                                    <div className="flex items-center space-x-4">
                                        <FaBuilding className="h-8 w-8" />
                                        <div>
                                            <h3 className="text-2xl font-bold">Client Details</h3>
                                            <p className="text-lg opacity-90">
                                                {selectedClient.clientCode} - {selectedClient.clientName}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                        {/* Basic Information */}
                                        <div className="bg-white p-6 rounded-lg shadow-md">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-indigo-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Client Type</p>
                                                    <p className="text-lg font-semibold text-indigo-700 capitalize">
                                                        {selectedClient.clientType}
                                                    </p>
                                                </div>
                                                <div className="bg-purple-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">GST Type</p>
                                                    <p className="text-lg font-semibold text-purple-700">
                                                        {selectedClient.gstType}
                                                    </p>
                                                </div>
                                                <div className="bg-indigo-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">PAN</p>
                                                    <p className="text-lg font-semibold text-indigo-700">
                                                        {selectedClient.pan || 'N/A'}
                                                    </p>
                                                </div>
                                                <div className="bg-green-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">GST Number</p>
                                                    <p className="text-lg font-semibold text-green-700">
                                                        {selectedClient.mainGstNumber || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address Information */}
                                        <div className="bg-white p-6 rounded-lg shadow-md">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h4>
                                            <div className="space-y-4">
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h5 className="font-medium text-gray-700 mb-2">Registered Address</h5>
                                                    <p className="text-gray-600">
                                                        {selectedClient.registeredAddress?.street}<br />
                                                        {selectedClient.registeredAddress?.city}, 
                                                        {selectedClient.registeredAddress?.state}<br />
                                                        {selectedClient.registeredAddress?.pincode}
                                                    </p>
                                                </div>
                                                {selectedClient.corporateAddress && (
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <h5 className="font-medium text-gray-700 mb-2">Corporate Address</h5>
                                                        <p className="text-gray-600">
                                                            {selectedClient.corporateAddress?.street}<br />
                                                            {selectedClient.corporateAddress?.city}, 
                                                            {selectedClient.corporateAddress?.state}<br />
                                                            {selectedClient.corporateAddress?.pincode}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-6">
                                        {/* Contact Information */}
                                        <div className="bg-white p-6 rounded-lg shadow-md">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h4>
                                            <div className="space-y-4">
                                                {selectedClient.contactPersons?.map((contact, index) => (
                                                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                                        <p className="font-medium text-gray-700">{contact.name}</p>
                                                        <p className="text-gray-600">{contact.designation}</p>
                                                        <p className="text-gray-600">{contact.email}</p>
                                                        <p className="text-gray-600">{contact.phone}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Bank Account Information */}
                                        <div className="bg-white p-6 rounded-lg shadow-md">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Bank Accounts</h4>
                                            <div className="space-y-4">
                                                {selectedClient.bankAccounts?.map((account, index) => (
                                                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                                        <p className="font-medium text-gray-700">{account.accountName}</p>
                                                        <p className="text-gray-600">Bank: {account.bankName}</p>
                                                        <p className="text-gray-600">Account: {account.accountNumber}</p>
                                                        <p className="text-gray-600">IFSC: {account.ifscCode}</p>
                                                        {account.isDefault && (
                                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                                Default Account
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Signatures and Remarks Section */}
                                <div className="mt-6">
                                    <div className="bg-white p-6 rounded-lg shadow-md">
                                        <SignatureAndRemarks
                                            signatures={selectedClient.signatureAndRemarks || []}
                                        />

                                        <div className="mt-4">
                                            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
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
                            Confirm Client Rejection
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-gray-600">
                            Are you sure you want to reject client {selectedClient?.clientCode}? This action cannot be undone.
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
                            Yes, Reject Client
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default React.memo(VerifyClient)