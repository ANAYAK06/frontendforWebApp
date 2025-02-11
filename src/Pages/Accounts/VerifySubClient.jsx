import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FaChevronDown, FaRegEdit, FaTimes } from "react-icons/fa";
import { FaBuildingUser } from "react-icons/fa6";
import { useDispatch, useSelector } from 'react-redux';
import SignatureAndRemarks from '../../Components/SignatureAndRemarks';
import {
    fetchSubClientsForVerification,
    verifySubClientStatus,
    rejectSubClientStatus
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

function VerifySubClient(props) {
    const { checkContent, onEmpty, onStateChange } = { ...defaultProps, ...props };

    const dispatch = useDispatch();
    const { subClientsForVerification, loading:{fetchSubClientsForVerification:loading}, error:{fetchSubClientsForVerification:error} } = useSelector(state => state.client);
    const userRoleId = useSelector(state => state.auth.userInfo.roleId);
    
    const [inboxExpanded, setInboxExpanded] = useState(false);
    const [selectedSubClient, setSelectedSubClient] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const { ccstate } = useSelector((state) => state.ccstate);

    const hasContent = useMemo(() => subClientsForVerification?.length > 0, [subClientsForVerification]);

    useEffect(() => {
        if (userRoleId) {
            dispatch(fetchSubClientsForVerification(userRoleId));
            
        }
    }, [dispatch, userRoleId]);

    const handleVerify = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before verifying');
            return;
        }
        try {
            await dispatch(verifySubClientStatus({
                id: selectedSubClient._id,
                remarks: remarks
            })).unwrap();
            showToast('success', 'Sub-client verified successfully');
            setSelectedSubClient(null);
            setRemarks('');
            dispatch(fetchSubClientsForVerification(userRoleId));
        } catch (error) {
            showToast('error', error.message || 'Failed to verify sub-client');
        }
    }, [dispatch, selectedSubClient, remarks, userRoleId]);

    const handleReject = useCallback(() => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before rejecting');
            return;
        }
        setShowRejectDialog(true);
    }, [remarks]);

    const handleConfirmedReject = useCallback(async () => {
        try {
            await dispatch(rejectSubClientStatus({
                id: selectedSubClient._id,
                remarks: remarks
            })).unwrap();
            showToast('error', 'Sub-client rejected successfully');
            setSelectedSubClient(null);
            setRemarks('');
            setShowRejectDialog(false);
            dispatch(fetchSubClientsForVerification(userRoleId));
        } catch (error) {
            showToast('error', error.message || 'Failed to reject sub-client');
        }
    }, [dispatch, selectedSubClient, remarks, userRoleId]);

    const closeDetails = useCallback(() => {
        setSelectedSubClient(null);
        setRemarks('');
    }, []);
    const getStateName = (stateCode) => {
        const state = ccstate[0]?.states?.find(state => state.code === stateCode);
        return state?.name || stateCode;
    };
    

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    if (loading && !subClientsForVerification?.length) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error || !hasContent) return null;

    return (
        <div className="w-full bg-white shadow-md rounded-md overflow-hidden mb-4 mt-4">
            {/* Header Section */}
            <div className="p-4 bg-slate-100 flex justify-between items-center">
                <div 
                    className="px-2 py-2 rounded-full bg-slate-300 cursor-pointer" 
                    onClick={() => setInboxExpanded(!inboxExpanded)}
                >
                    <FaChevronDown 
                        className={`text-gray-600 font-bold ${inboxExpanded ? 'rotate-180 duration-300' : ''}`} 
                    />
                </div>
                <div>
                    <h3 className="text-gray-600 font-bold">Sub-Client Verification</h3>
                </div>
                <div className="font-bold text-red-500">
                    ({subClientsForVerification?.length || 0})
                </div>
            </div>

            {/* List View Section */}
            <div className={`transition-max-height duration-500 ease-in-out overflow-hidden 
                ${inboxExpanded ? 'max-h-screen' : 'max-h-0'}`}>
                {inboxExpanded && (
                    <div className="p-4 bg-white">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="text-gray-700">
                                    <tr>
                                        <th className="border px-4 py-2">Action</th>
                                        <th className="border px-4 py-2">Sub-Client Code</th>
                                        <th className="border px-4 py-2">Main Client</th>
                                        <th className="border px-4 py-2">GST Number</th>
                                        <th className="border px-4 py-2">State</th>
                                        <th className="border px-4 py-2">Opening Balance</th>
                                        <th className="border px-4 py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subClientsForVerification?.map((subclient) => (
                                        <tr key={subclient._id} className="hover:bg-gray-50">
                                            <td className="border px-4 py-2">
                                                <FaRegEdit
                                                    className="text-yellow-600 cursor-pointer text-2xl"
                                                    onClick={() => setSelectedSubClient(subclient)}
                                                />
                                            </td>
                                            <td className="border px-4 py-2">{subclient.subClientCode}</td>
                                            <td className="border px-4 py-2">{subclient.mainClientId?.clientName}</td>
                                            <td className="border px-4 py-2">{subclient.gstNumber}</td>
                                            <td className="border px-4 py-2">{subclient.registeredAddress?.state}</td>
                                            <td className="border px-4 py-2">
                                                {subclient.hasOpeningBalance ? (
                                                    <span className="text-green-600">Yes</span>
                                                ) : (
                                                    <span className="text-gray-500">No</span>
                                                )}
                                            </td>
                                            <td className="border px-4 py-2">
                                                <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">
                                                    {subclient.status}
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

            {/* Detail Modal Section */}
          {/* Detail Modal Section */}
{selectedSubClient && (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div className="relative mx-auto p-6 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button onClick={closeDetails} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500">
                <FaTimes className="h-6 w-6" />
            </button>

            {/* Header Section */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-t-lg -mx-6 -mt-6">
                <div className="flex items-center space-x-4">
                    <FaBuildingUser className="h-8 w-8" />
                    <div>
                        <h3 className="text-2xl font-bold">Sub-Client Verification</h3>
                        <p className="text-lg opacity-90">
                            {selectedSubClient.subClientCode} - {selectedSubClient.mainClientId?.clientName}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mt-6">
                {/* Top Grid - Basic Details and Address */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Basic Details */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Basic Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-indigo-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Main Client</p>
                                <p className="text-lg font-semibold text-indigo-700">
                                    {selectedSubClient.mainClientId?.clientName}
                                </p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">GST Number</p>
                                <p className="text-lg font-semibold text-purple-700">
                                    {selectedSubClient.gstNumber}
                                </p>
                            </div>
                            <div className="bg-indigo-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">State</p>
                                <p className="text-lg font-semibold text-indigo-700">
                                    {getStateName(selectedSubClient.stateCode)}
                                </p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Status</p>
                                <p className="text-lg font-semibold text-green-700">
                                    {selectedSubClient.status}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Address */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Address Details</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-600">
                                {selectedSubClient.registeredAddress?.street}<br />
                                {selectedSubClient.registeredAddress?.city},
                                {getStateName(selectedSubClient.registeredAddress?.state)}<br />
                                {selectedSubClient.registeredAddress?.pincode}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Full Width Sections */}
                {/* Opening Balance Section */}
                {selectedSubClient.hasOpeningBalance && (
                    <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-semibold text-gray-800">Opening Balance</h4>
                            <div className="bg-amber-50 px-4 py-2 rounded-lg">
                                <p className="text-sm text-gray-600">Balance As On</p>
                                <p className="text-lg font-semibold text-amber-700">
                                    {new Date(selectedSubClient.balanceAsOn).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {selectedSubClient.costCenterBalances?.map((balance, index) => (
                                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                    <h5 className="font-medium text-gray-800 mb-3">
                                        {balance.ccName} ({balance.ccCode})
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                                        <div className="bg-white p-3 rounded-lg">
                                            <p className="text-sm text-gray-600">Basic Amount</p>
                                            <p className="font-medium text-gray-800">
                                                {formatCurrency(balance.basicAmount)}
                                            </p>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg">
                                            <p className="text-sm text-gray-600">CGST</p>
                                            <p className="font-medium text-gray-800">
                                                {formatCurrency(balance.cgst)}
                                            </p>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg">
                                            <p className="text-sm text-gray-600">SGST</p>
                                            <p className="font-medium text-gray-800">
                                                {formatCurrency(balance.sgst)}
                                            </p>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg">
                                            <p className="text-sm text-gray-600">IGST</p>
                                            <p className="font-medium text-gray-800">
                                                {formatCurrency(balance.igst)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t">
                                        <div className="flex justify-end">
                                            <div className="bg-indigo-50 px-4 py-2 rounded-lg">
                                                <p className="text-sm text-gray-600">Total Amount</p>
                                                <p className="text-lg font-semibold text-indigo-600">
                                                    {formatCurrency(balance.total)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Verification Section */}
                <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Verification History</h4>
                    <SignatureAndRemarks 
                        signatures={selectedSubClient.signatureAndRemarks || []} 
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

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={handleVerify}
                        disabled={loading}
                        className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md shadow-sm hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Verify'}
                    </button>
                    <button
                        onClick={handleReject}
                        disabled={loading}
                        className="px-6 py-2 bg-red-100 text-red-700 rounded-md shadow-sm hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Reject'}
                    </button>
                </div>
            </div>
        </div>
    </div>
)}
            {/* Reject Confirmation Dialog */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                            Confirm Sub-Client Rejection
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-gray-600">
                            Are you sure you want to reject sub-client {selectedSubClient?.subClientCode}? This action cannot be undone.
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
                            Yes, Reject Sub-Client
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default React.memo(VerifySubClient);