import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FaChevronDown, FaRegEdit, FaTimes, FaListAlt } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { getHSNForVerificationThunk, verifyHSNCodeThunk, rejectHSNCodeThunk } from '../../Slices/taxModuleSlices/hsnSacCodeSlices';
import SignatureAndRemarks from '../../Components/SignatureAndRemarks';
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

const VerifyHSNCode = () => {
    const dispatch = useDispatch();
    const { hsnForVerification, loading, error } = useSelector(state => state.hsnsac);
    const userRoleId = useSelector(state => state.auth.userInfo.roleId);
    
    const [inboxExpanded, setInboxExpanded] = useState(false);
    const [selectedHSN, setSelectedHSN] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    const hasContent = useMemo(() => hsnForVerification?.length > 0, [hsnForVerification]);

    useEffect(() => {
        if (userRoleId) {
            dispatch(getHSNForVerificationThunk(userRoleId));
        }
    }, [dispatch, userRoleId]);

    const openHSNDetails = useCallback((hsn) => {
        setSelectedHSN(hsn);
    }, []);

    const closeHSNDetails = useCallback(() => {
        setSelectedHSN(null);
        setRemarks('');
    }, []);

    const handleVerify = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before verifying');
            return;
        }
        try {
            await dispatch(verifyHSNCodeThunk({
                id: selectedHSN._id,
                remarks: remarks
            })).unwrap();
            showToast('success', 'HSN Code verified successfully');
            closeHSNDetails();
            dispatch(getHSNForVerificationThunk(userRoleId));
        } catch (error) {
            showToast('error', error.message || 'Failed to verify HSN code');
        }
    }, [dispatch, selectedHSN, remarks, userRoleId, closeHSNDetails]);

    const handleReject = useCallback(() => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before rejecting');
            return;
        }
        setShowRejectDialog(true);
    }, [remarks]);

    const handleConfirmedReject = useCallback(async () => {
        try {
            await dispatch(rejectHSNCodeThunk({
                id: selectedHSN._id,
                remarks: remarks
            })).unwrap();
            showToast('error', 'HSN Code rejected successfully');
            closeHSNDetails();
            dispatch(getHSNForVerificationThunk(userRoleId));
        } catch (error) {
            showToast('error', error.message || 'Failed to reject HSN code');
        }
        setShowRejectDialog(false);
    }, [dispatch, selectedHSN, remarks, userRoleId, closeHSNDetails]);

    if (loading && !hsnForVerification?.length) {
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
                        <FaChevronDown 
                            className={`text-gray-600 font-bold ${inboxExpanded ? 'rotate-180 duration-300' : ''}`} 
                        />
                    </div>
                    <div><h3 className="text-gray-600 font-bold">HSN/SAC Code Verification</h3></div>
                    <div className="font-bold text-red-500">({hsnForVerification?.length || 0})</div>
                </div>

                <div className={`transition-max-height duration-500 ease-in-out overflow-hidden ${inboxExpanded ? 'max-h-screen' : 'max-h-0'}`}>
                    {inboxExpanded && (
                        <div className="p-4 bg-white">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="text-gray-700">
                                        <tr>
                                            <th className="border px-4 py-2">Action</th>
                                            <th className="border px-4 py-2">Code</th>
                                            <th className="border px-4 py-2">Type</th>
                                            <th className="border px-4 py-2">Category</th>
                                            <th className="border px-4 py-2">Description</th>
                                            <th className="border px-4 py-2">Tax Rates</th>
                                            <th className="border px-4 py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {hsnForVerification?.map((hsn) => (
                                            <tr key={hsn._id} className="hover:bg-gray-50">
                                                <td className="border px-4 py-2">
                                                    <FaRegEdit
                                                        className="text-yellow-600 cursor-pointer text-2xl"
                                                        onClick={() => openHSNDetails(hsn)}
                                                    />
                                                </td>
                                                <td className="border px-4 py-2">{hsn.code}</td>
                                                <td className="border px-4 py-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        hsn.type === 'HSN' 
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-blue-100 text-indigo-800'
                                                    }`}>
                                                        {hsn.type}
                                                    </span>
                                                </td>
                                                <td className="border px-4 py-2">{hsn.category}</td>
                                                <td className="border px-4 py-2">{hsn.shortDescription}</td>
                                                <td className="border px-4 py-2">
                                                    {`GST: ${hsn.taxRateHistory[0]?.igst}% `}
                                                </td>
                                                <td className="border px-4 py-2">
                                                    <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">
                                                        {hsn.status}
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

                {selectedHSN && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 fade-in">
                        <div className="relative mx-auto p-6 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
                            <button onClick={closeHSNDetails} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500">
                                <FaTimes className="h-6 w-6" />
                            </button>

                            <div className="mt-4">
                                {/* Header Section */}
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-t-lg">
                                    <div className="flex items-center space-x-4">
                                        <FaListAlt className="h-8 w-8" />
                                        <div>
                                            <h3 className="text-2xl font-bold">HSN/SAC Code Details</h3>
                                            <p className="text-lg opacity-90">
                                                {selectedHSN.code} - {selectedHSN.type}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                        {/* Basic Details */}
                                        <div className="bg-white p-6 rounded-lg shadow-md">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Basic Details</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-green-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">HSN/SAC</p>
                                                    <p className="text-lg font-semibold text-green-700">
                                                        {selectedHSN.code}
                                                    </p>
                                                </div>
                                                <div className="bg-indigo-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Type</p>
                                                    <p className="text-lg font-semibold text-indigo-700">
                                                        {selectedHSN.type}
                                                    </p>
                                                </div>
                                                <div className="bg-purple-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Category</p>
                                                    <p className="text-lg font-semibold text-purple-700">
                                                        {selectedHSN.category}
                                                    </p>
                                                </div>
                                                <div className="bg-red-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Applicable Type</p>
                                                    <p className="text-lg font-semibold text-red-700">
                                                        {selectedHSN.applicableType}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description Details */}
                                        <div className="bg-white p-6 rounded-lg shadow-md">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Description</h4>
                                            <div className="space-y-4">
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Full Description</p>
                                                    <p className="text-base text-gray-800 mt-1">
                                                        {selectedHSN.description}
                                                    </p>
                                                </div>
                                                {selectedHSN.shortDescription && (
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <p className="text-sm text-gray-600">Short Description</p>
                                                        <p className="text-base text-gray-800 mt-1">
                                                            {selectedHSN.shortDescription}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-6">
                                        {/* Tax Details */}
                                        <div className="bg-white p-6 rounded-lg shadow-md">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Tax Details</h4>
                                            <div className="grid grid-cols-1 gap-4">
                                                {selectedHSN.taxRateHistory.map((rate, index) => (
                                                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div>
                                                                <p className="text-sm text-gray-600">CGST</p>
                                                                <p className="text-lg font-semibold text-indigo-700">
                                                                    {rate.cgst}%
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-600">SGST</p>
                                                                <p className="text-lg font-semibold text-purple-700">
                                                                    {rate.sgst}%
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-600">IGST</p>
                                                                <p className="text-lg font-semibold text-blue-700">
                                                                    {rate.igst}%
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2">
                                                            <p className="text-sm text-gray-600">Effective From</p>
                                                            <p className="text-base text-gray-800">
                                                                {new Date(rate.effectiveFrom).toLocaleDateString()}
                                                            </p>
                                                        </div>
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
                                            signatures={selectedHSN.signatureAndRemarks || []}
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
                            Confirm HSN/SAC Code Rejection
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-gray-600">
                            Are you sure you want to reject HSN/SAC code #{selectedHSN?.code}? 
                            This action cannot be undone.
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
                            Yes, Reject HSN/SAC Code
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default React.memo(VerifyHSNCode);