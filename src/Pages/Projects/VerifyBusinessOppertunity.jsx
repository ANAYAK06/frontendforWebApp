import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FaChevronDown, FaRegEdit, FaTimes, FaHandshake } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import SignatureAndRemarks from '../../Components/SignatureAndRemarks';
import {
    fetchVerificationOpportunities,
    updateOpportunityThunk,
    rejectOpportunityThunk,
} from '../../Slices/businessOppertunitySlices';

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

function VerifyBusinessOpportunity(props) {
    const { checkContent, onEmpty, onStateChange } = { ...defaultProps, ...props };

    const dispatch = useDispatch();
    const { opportunitiesForVerification, loading, error } = useSelector(state => state.businessOpportunity);
    const userRoleId = useSelector(state => state.auth.userInfo.roleId);
    const [inboxExpanded, setInboxExpanded] = useState(false);
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false)

    const hasContent = useMemo(() => opportunitiesForVerification?.length > 0, [opportunitiesForVerification]);

    useEffect(() => {
        if (userRoleId) {
            dispatch(fetchVerificationOpportunities(userRoleId));
        }
    }, [dispatch, userRoleId]);



    useEffect(() => {
        onStateChange(loading, hasContent);
    }, [loading, hasContent, onStateChange]);

    const openOpportunityDetails = useCallback((opportunity) => {
        setSelectedOpportunity(opportunity);
    }, []);

    const closeOpportunityDetails = useCallback(() => {
        setSelectedOpportunity(null);
        setRemarks('');
    }, []);

    const handleVerify = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before verifying');
            return;
        }
        try {
            await dispatch(updateOpportunityThunk({
                id: selectedOpportunity._id,
                updateData: { remarks: remarks }
            })).unwrap();
            showToast('success', 'Opportunity verified successfully');
            closeOpportunityDetails();
            dispatch(fetchVerificationOpportunities(userRoleId));
        } catch (error) {
            showToast('error', error.message || 'Failed to verify opportunity');
        }
    }, [dispatch, selectedOpportunity, remarks, userRoleId, closeOpportunityDetails]);

    const handleReject = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before rejecting');
            return;
        }
        setShowRejectDialog(true);
    }, [remarks]);

    const handleConfirmedReject = useCallback(async () => {
        try {
            await dispatch(rejectOpportunityThunk({
                id: selectedOpportunity._id,
                remarks: remarks
            })).unwrap();
            showToast('error', 'Opportunity rejected successfully');
            closeOpportunityDetails();
            dispatch(fetchVerificationOpportunities(userRoleId));
        } catch (error) {
            showToast('error', error.message || 'Failed to reject opportunity');
        }
        setShowRejectDialog(false);
    }, [dispatch, selectedOpportunity, remarks, userRoleId, closeOpportunityDetails]);

    if (loading && !opportunitiesForVerification?.length) {
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
                    <div><h3 className="text-gray-600 font-bold">Business Opportunity Verification</h3></div>
                    <div className="font-bold text-red-500">({opportunitiesForVerification?.length || 0})</div>
                </div>

                <div className={`transition-max-height duration-500 ease-in-out overflow-hidden ${inboxExpanded ? 'max-h-screen' : 'max-h-0'}`}>
                    {inboxExpanded && (
                        <div className="p-4 bg-white">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="text-gray-700">
                                        <tr>
                                            <th className="border px-4 py-2">Action</th>
                                            <th className="border px-4 py-2">Opportunity Number</th>
                                            <th className="border px-4 py-2">Type</th>
                                            <th className="border px-4 py-2">Client</th>
                                            <th className="border px-4 py-2">Business Category</th>
                                            <th className="border px-4 py-2">Estimated Value</th>
                                            <th className="border px-4 py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {opportunitiesForVerification?.map((opportunity) => (
                                            <tr key={opportunity._id} className="hover:bg-gray-50">
                                                <td className="border px-4 py-2">
                                                    <FaRegEdit
                                                        className="text-yellow-600 cursor-pointer text-2xl"
                                                        onClick={() => openOpportunityDetails(opportunity)}
                                                    />
                                                </td>
                                                <td className="border px-4 py-2">{opportunity.opportunityNumber}</td>
                                                <td className="border px-4 py-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${opportunity.type === 'TENDER'
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {opportunity.type}
                                                    </span>
                                                </td>
                                                <td className="border px-4 py-2">{opportunity.client.name}</td>
                                                <td className="border px-4 py-2">{opportunity.businessCategory}</td>
                                                <td className="border px-4 py-2">
                                                    {opportunity.estimatedValue.toLocaleString('en-IN', {
                                                        style: 'currency',
                                                        currency: 'INR'
                                                    })}
                                                </td>
                                                <td className="border px-4 py-2">
                                                    <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">
                                                        {opportunity.status}
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

                {selectedOpportunity && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                        <div className="relative mx-auto p-6 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
                            <button onClick={closeOpportunityDetails} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500">
                                <FaTimes className="h-6 w-6" />
                            </button>

                            <div className="mt-4">
                                {/* Header Section */}
                                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-4 rounded-t-lg">
                                    <div className="flex items-center space-x-4">
                                        <FaHandshake className="h-8 w-8" />
                                        <div>
                                            <h3 className="text-2xl font-bold">Business Opportunity Details</h3>
                                            <p className="text-lg opacity-90">#{selectedOpportunity.opportunityNumber}</p>
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
                                                <div className="bg-purple-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Type</p>
                                                    <p className="text-lg font-semibold text-purple-700">{selectedOpportunity.type}</p>
                                                </div>
                                                <div className="bg-indigo-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Business Category</p>
                                                    <p className="text-lg font-semibold text-indigo-700">{selectedOpportunity.businessCategory}</p>
                                                </div>
                                                <div className="bg-blue-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Opportunity Type</p>
                                                    <p className="text-lg font-semibold text-blue-700">{selectedOpportunity.opportunityType}</p>
                                                </div>
                                                <div className="bg-green-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Estimated Value</p>
                                                    <p className="text-lg font-semibold text-green-700">
                                                        {selectedOpportunity.estimatedValue.toLocaleString('en-IN', {
                                                            style: 'currency',
                                                            currency: 'INR'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Client Details */}
                                        <div className="bg-white p-6 rounded-lg shadow-md">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Client Information</h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center border-b pb-2">
                                                    <span className="text-gray-600">Client Name</span>
                                                    <span className="text-lg font-semibold text-gray-800">
                                                        {selectedOpportunity.client.name}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center border-b pb-2">
                                                    <span className="text-gray-600">Contact Person</span>
                                                    <span className="text-lg font-semibold text-gray-800">
                                                        {selectedOpportunity.client.contactPerson}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center border-b pb-2">
                                                    <span className="text-gray-600">Email</span>
                                                    <span className="text-lg font-semibold text-gray-800">
                                                        {selectedOpportunity.client.email}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Phone</span>
                                                    <span className="text-lg font-semibold text-gray-800">
                                                        {selectedOpportunity.client.phone}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-6">
                                        {/* Description */}
                                        <div className="bg-white p-6 rounded-lg shadow-md">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Work Description</h4>
                                            <p className="text-gray-700 whitespace-pre-wrap">
                                                {selectedOpportunity.descriptionOfWork}
                                            </p>
                                        </div>

                                        {/* Tender Details */}
                                        {selectedOpportunity.type === 'TENDER' && (
                                            <div className="bg-white p-6 rounded-lg shadow-md">
                                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Tender Details</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <p className="text-sm text-gray-600">Tender Number</p>
                                                        <p className="text-base font-semibold text-gray-800">
                                                            {selectedOpportunity.tenderDetails?.tenderNumber}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <p className="text-sm text-gray-600">Tender Date</p>
                                                        <p className="text-base font-semibold text-gray-800">
                                                            {new Date(selectedOpportunity.tenderDetails?.tenderDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                {selectedOpportunity.tenderDetails?.emdRequired && (
                                                    <div className="mt-4">
                                                        <h5 className="text-md font-semibold text-gray-700 mb-2">EMD Details</h5>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="bg-yellow-50 p-4 rounded-lg">
                                                                <p className="text-sm text-gray-600">EMD Amount</p>
                                                                <p className="text-base font-semibold text-yellow-800">
                                                                    {selectedOpportunity.tenderDetails.emdDetails?.amount?.toLocaleString('en-IN', {
                                                                        style: 'currency',
                                                                        currency: 'INR'
                                                                    })}
                                                                </p>
                                                            </div>
                                                            <div className="bg-yellow-50 p-4 rounded-lg">
                                                                <p className="text-sm text-gray-600">EMD Type</p>
                                                                <p className="text-base font-semibold text-yellow-800">
                                                                    {selectedOpportunity.tenderDetails.emdDetails?.type === 'BG' ? 'Bank Guarantee' : 'Demand Draft'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Ultimate Customer Details for Tender */}
                                        {selectedOpportunity.type === 'TENDER' && (
                                            <div className="bg-white p-6 rounded-lg shadow-md">
                                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Ultimate Customer Details</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <p className="text-sm text-gray-600">Customer Name</p>
                                                        <p className="text-base font-semibold text-gray-800">
                                                            {selectedOpportunity.ultimateCustomer?.name}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <p className="text-sm text-gray-600">Industry</p>
                                                        <p className="text-base font-semibold text-gray-800">
                                                            {selectedOpportunity.ultimateCustomer?.industry || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                                                        <p className="text-sm text-gray-600">Sector</p>
                                                        <p className="text-base font-semibold text-gray-800">
                                                            {selectedOpportunity.ultimateCustomer?.sector}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Joint Venture Details */}
                                        {/* Joint Venture Details */}
                                        {selectedOpportunity.jointVentureAcceptable && (
                                            <div className="bg-white p-6 rounded-lg shadow-md">
                                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Joint Venture Details</h4>
                                                {Array.isArray(selectedOpportunity.jointVentureDetails) ? (
                                                    <div className="space-y-6">
                                                        {selectedOpportunity.jointVentureDetails.map((venture, index) => (
                                                            <div key={index} className={`border ${venture.isFrontParty ? 'border-indigo-500' : 'border-gray-200'} rounded-lg p-4`}>
                                                                <div className="flex justify-between items-center mb-4">
                                                                    <h5 className="text-md font-semibold text-gray-800">
                                                                        Partner {index + 1}
                                                                        {venture.isFrontParty && (
                                                                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                                                Front Party
                                                                            </span>
                                                                        )}
                                                                    </h5>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                                        <p className="text-sm text-gray-600">Company Name</p>
                                                                        <p className="text-base font-semibold text-gray-800">
                                                                            {venture.companyName}
                                                                        </p>
                                                                    </div>
                                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                                        <p className="text-sm text-gray-600">Registration Number</p>
                                                                        <p className="text-base font-semibold text-gray-800">
                                                                            {venture.registrationNumber}
                                                                        </p>
                                                                    </div>
                                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                                        <p className="text-sm text-gray-600">Share Percentage</p>
                                                                        <p className="text-base font-semibold text-gray-800">
                                                                            {venture.sharePercentage}%
                                                                        </p>
                                                                    </div>
                                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                                        <p className="text-sm text-gray-600">Contact Person</p>
                                                                        <p className="text-base font-semibold text-gray-800">
                                                                            {venture.contactPerson}
                                                                        </p>
                                                                    </div>
                                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                                        <p className="text-sm text-gray-600">Contact Email</p>
                                                                        <p className="text-base font-semibold text-gray-800">
                                                                            {venture.contactEmail}
                                                                        </p>
                                                                    </div>
                                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                                        <p className="text-sm text-gray-600">Contact Phone</p>
                                                                        <p className="text-base font-semibold text-gray-800">
                                                                            {venture.contactPhone}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {/* Total Share Percentage Summary */}
                                                        <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                                                            <p className="text-sm text-gray-600">Total Share Percentage</p>
                                                            <p className="text-lg font-semibold text-indigo-800">
                                                                {selectedOpportunity.jointVentureDetails.reduce((sum, venture) =>
                                                                    sum + parseFloat(venture.sharePercentage), 0
                                                                )}%
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500 italic">No joint venture details available</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Signatures and Remarks Section */}
                                <div className="mt-6">
                                    <div className="bg-white p-6 rounded-lg shadow-md">
                                        <SignatureAndRemarks
                                            signatures={selectedOpportunity.signatureAndRemarks || []}
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
                                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-base font-medium rounded-md shadow-sm hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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
                            Confirm Rejection
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-gray-600">
                            Are you sure you want to reject opportunity #{selectedOpportunity?.opportunityNumber}? This action cannot be undone.
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
                            Yes, Reject Opportunity
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default React.memo(VerifyBusinessOpportunity);