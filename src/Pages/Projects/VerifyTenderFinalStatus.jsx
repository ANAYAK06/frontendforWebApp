import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FaChevronDown, FaRegEdit, FaTimes, FaTrophy, FaMoneyBill, FaArrowCircleDown } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import SignatureAndRemarks from '../../Components/SignatureAndRemarks';
import { fetchTenderStatusForVerification, updateTenderStatus, rejectTenderStatus, clearErrors } from '../../Slices/projectModuleSlices/tenderFinalStatus';
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

// Utility Functions
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount || 0);
};
const defaultProps = {
    checkContent: true,
    onEmpty: () => { },
    onStateChange: () => { }
};

// Financial Details Section Component
const FinancialDetailsSection = ({ wonDetails }) => {
    return (
        <div className="space-y-6">
            {/* Amount Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-50 rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">Original BOQ Amount</h3>
                        <div className="p-2 bg-blue-100 rounded-full">
                            <FaMoneyBill className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(wonDetails.originalBOQAmount)}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm p-6">
    <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">Maximum Allowable Reduction</h3>
        <div className="p-2 bg-purple-100 rounded-full">
            <FaArrowCircleDown className="w-4 h-4 text-red-600" />
        </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">
        {formatCurrency(wonDetails.originalBOQAmount - (wonDetails.originalBOQAmount * wonDetails.originalVariationPercentage / 100))}
    </p>
    <p className="text-sm text-gray-500 mt-2">
        Max Variation: {wonDetails.originalVariationPercentage}%
    </p>
</div>

<div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm p-6">
    <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">Final Negotiated Amount</h3>
        <div className="p-2 bg-green-100 rounded-full">
            <FaTrophy className="w-4 h-4 text-green-600" />
        </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">
        {formatCurrency(wonDetails.originalBOQAmount - (wonDetails.originalBOQAmount * wonDetails.finalVariationPercentage / 100))}
    </p>
    <p className="text-sm text-gray-500 mt-2">
        Applied Variation: {wonDetails.finalVariationPercentage}%
    </p>
</div>            </div>

           {/* Summary Card */}
<div className="bg-gradient-to-r from-indigo-50 to-indigo-50 rounded-xl p-6 shadow-sm">
    <h4 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h4>
    <div className="space-y-3">
        <div className="flex justify-between items-center">
            <span className="text-gray-600">Maximum Allowable Variation</span>
            <span className="font-medium">{wonDetails.originalVariationPercentage}%</span>
        </div>
        <div className="flex justify-between items-center">
            <span className="text-gray-600">Final Accepted Variation</span>
            <span className="font-medium">{wonDetails.finalVariationPercentage}%</span>
        </div>
        <div className="flex justify-between items-center">
            <span className="text-gray-600">Variation Amount</span>
            <span className="font-medium">
                {formatCurrency(wonDetails.originalBOQAmount * wonDetails.finalVariationPercentage / 100)}
                {/* For example: 671000 * 2 / 100 = 13420 */}
            </span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t">
            <span className="text-lg font-semibold text-gray-900">Final Accepted Amount</span>
            <span className="text-lg font-bold text-indigo-600">
                {formatCurrency(wonDetails.originalBOQAmount - (wonDetails.originalBOQAmount * wonDetails.finalVariationPercentage / 100))}
                {/* For example: 671000 - (671000 * 2 / 100) = 657580 */}
            </span>
        </div>
    </div>
</div>        </div>
    );
};
// Won Tender Details Component
const WonTenderDetails = ({ wonDetails, boqDetails }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Won Tender Details</h4>
            
            {/* Basic Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Client Name</p>
                    <p className="text-lg font-semibold text-indigo-700">
                        {boqDetails?.businessOpportunity?.client?.name}
                    </p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Offer Number</p>
                    <p className="text-lg font-semibold text-indigo-700">
                        {boqDetails?.offerNumber}
                    </p>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Tender Number</p>
                    <p className="text-lg font-semibold text-indigo-700">
                        {wonDetails.tenderNumber}
                    </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">PO Number</p>
                    <p className="text-lg font-semibold text-purple-700">
                        {wonDetails.poNumber || 'N/A'}
                    </p>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Client PO Date</p>
                    <p className="text-lg font-semibold text-indigo-700">
                        {wonDetails.clientPODate ? new Date(wonDetails.clientPODate).toLocaleDateString() : 'N/A'}
                    </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Expected Start Date</p>
                    <p className="text-lg font-semibold text-green-700">
                        {new Date(wonDetails.expectedStartDate).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Work Location</p>
                <p className="text-lg font-semibold text-orange-700">
                    {wonDetails.workLocation}
                </p>
            </div>

            {/* Financial Details Section */}
            <div className="mt-6">
                <FinancialDetailsSection wonDetails={wonDetails} />
            </div>
        </div>
    );
};

// Lost Tender Details Component
const LostTenderDetails = ({ lostDetails }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Lost Tender Details</h4>
            <div className="space-y-4">
                {/* L1 Details */}
                <div className="bg-red-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-red-800 mb-2">L1 Company Details</h5>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Company Name</p>
                            <p className="font-medium">{lostDetails.L1.companyName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Price</p>
                            <p className="font-medium">{formatCurrency(lostDetails.L1.price)}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm text-gray-600">Price Difference</p>
                            <p className="font-medium">{formatCurrency(lostDetails.L1.difference)}</p>
                        </div>
                    </div>
                </div>

                {/* L2 Details if available */}
                {lostDetails.L2?.companyName && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-orange-800 mb-2">L2 Company Details</h5>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Company Name</p>
                                <p className="font-medium">{lostDetails.L2.companyName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Price</p>
                                <p className="font-medium">{formatCurrency(lostDetails.L2.price)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reason and Precautions */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-yellow-800 mb-2">Reason for Loss</h5>
                    <p className="text-sm text-gray-700">{lostDetails.reasonForLoss}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-green-800 mb-2">Future Precautions</h5>
                    <p className="text-sm text-gray-700">{lostDetails.futurePrecautions}</p>
                </div>
            </div>
        </div>
    );
};



// Main Component
const VerifyTenderFinalStatus = (props) => {
    const { checkContent, onEmpty, onStateChange } = { ...defaultProps, ...props };
    const dispatch = useDispatch();
    const { tenderStatusesForVerification, 
        loading:{update:isUpdating, reject:isRejecting, fetchVerification:loading}, error:{fetchVerification:error}
    } = useSelector(state => state.tenderStatus);
    const userRoleId = useSelector(state => state.auth.userInfo.roleId);
    const [inboxExpanded, setInboxExpanded] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    const hasContent = useMemo(() => tenderStatusesForVerification?.length > 0, [tenderStatusesForVerification]);

    useEffect(() => {
        onStateChange(loading, hasContent);
    }, [ loading, hasContent, onStateChange]);

    const openStatusDetails = useCallback((status) => {
        setSelectedStatus(status);
    }, []);

    const closeStatusDetails = useCallback(() => {
        setSelectedStatus(null);
        setRemarks('');
    }, []);


    useEffect(() => {
        const fetchData = async () => {
            if (userRoleId) {
                try {
                    const result = await dispatch(fetchTenderStatusForVerification(userRoleId)).unwrap();
                    console.log("Tender status for verification:", result);
                    
                    // The data should already be processed in the Redux slice
                    // No need for additional transformation here unless specifically required
                    if (!result) {
                        showToast('error', 'No data received from server');
                        return;
                    }
                    
                    // If you need to validate the response
                    if (!Array.isArray(result)) {
                        showToast('error', 'Invalid data format received');
                        return;
                    }
                    
                   
                } catch (error) {
                    console.error("Error fetching tender status:", error);
                    showToast('error', error.message || 'Failed to fetch tender status data');
                }
            }
        };
    
        fetchData();
    }, [dispatch, userRoleId]);

useEffect(() => {
    console.log('Current state:', {
        loading,
        hasContent,
        tenderStatusesForVerification,
        error
    });}, [loading, hasContent, tenderStatusesForVerification, error]);
   

    // Event Handlers
    const handleVerify = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before verifying');
            return;
        }

        try {
            await dispatch(updateTenderStatus({
                id: selectedStatus._id,
                remarks: remarks.trim()
            })).unwrap();
            
            showToast('success', 'Tender status verified successfully');
            closeStatusDetails();
            dispatch(fetchTenderStatusForVerification(userRoleId));
        } catch (error) {
            showToast('error', error.message || 'Failed to verify tender status');
        }
    }, [dispatch, selectedStatus, remarks, userRoleId, closeStatusDetails]);

    const handleReject = useCallback(() => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before rejecting');
            return;
        }
        setShowRejectDialog(true);
    }, [remarks]);

    const handleConfirmedReject = useCallback(async () => {
        try {
            await dispatch(rejectTenderStatus({
                id: selectedStatus._id,
                remarks: remarks.trim()
            })).unwrap();
            
            showToast('error', 'Tender status rejected');
            closeStatusDetails();
            setShowRejectDialog(false);
            dispatch(fetchTenderStatusForVerification(userRoleId));
        } catch (error) {
            showToast('error', error.message || 'Failed to reject tender status');
            setShowRejectDialog(false);
        }
    }, [dispatch, selectedStatus, remarks, userRoleId, closeStatusDetails]);

    if (loading && !tenderStatusesForVerification?.length) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }
    
    if (error||!hasContent) return null;

    // Render Methods
    return (
        <>
            <div className="w-full bg-white shadow-md rounded-md overflow-hidden mb-4 mt-4">
                {/* Header Section */}
                <div className="p-4 bg-slate-100 flex justify-between items-center">
                    <div className="px-2 py-2 rounded-full bg-slate-300 cursor-pointer" 
                         onClick={() => setInboxExpanded(!inboxExpanded)}>
                        <FaChevronDown className={`text-gray-600 font-bold ${
                            inboxExpanded ? 'rotate-180 duration-300' : ''
                        }`} />
                    </div>
                    <div>
                        <h3 className="text-gray-600 font-bold">Tender Final Status Verification</h3>
                    </div>
                    <div className="font-bold text-red-500">
                        ({tenderStatusesForVerification?.length || 0})
                    </div>
                </div>

                {/* Table Section */}
                <div className={`transition-max-height duration-500 ease-in-out overflow-hidden ${
                    inboxExpanded ? 'max-h-screen' : 'max-h-0'
                }`}>
                    {inboxExpanded && (
                        <div className="p-4 bg-white">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="text-gray-700">
                                    <tr>
                                        <th className="border px-4 py-2">Action</th>
                                        <th className="border px-4 py-2">Tender No.</th>
                                        <th className="border px-4 py-2">BOQ Ref.</th>
                                        <th className="border px-4 py-2">Status</th>
                                        <th className="border px-4 py-2">Original Amount</th>
                                        <th className="border px-4 py-2">Final Amount</th>
                                        <th className="border px-4 py-2">Variation %</th>
                                        <th className="border px-4 py-2">Location</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tenderStatusesForVerification?.map((status) => (
                                        <tr key={status._id} className="hover:bg-gray-50">
                                            <td className="border px-4 py-2">
                                                <FaRegEdit
                                                    className="text-yellow-600 cursor-pointer text-2xl"
                                                    onClick={() => openStatusDetails(status)}
                                                />
                                            </td>
                                            <td className="border px-4 py-2">
                                                {status.tenderStatus === 'won' 
                                                    ? status.wonDetails?.tenderNumber 
                                                    : 'N/A'}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {status.boq?.offerNumber || 'N/A'}
                                            </td>
                                            <td className="border px-4 py-2">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    status.tenderStatus === 'won'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {status.tenderStatus.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="border px-4 py-2">
                                                {status.tenderStatus === 'won' 
                                                    ? formatCurrency(status.wonDetails?.originalBOQAmount)
                                                    : formatCurrency(status.boq?.totalAmount)}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {status.tenderStatus === 'won'
                                                    ? formatCurrency(status.wonDetails?.finalAcceptedAmount)
                                                    : 'N/A'}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {status.tenderStatus === 'won'
                                                    ? `${status.wonDetails?.finalVariationPercentage || 0}%`
                                                    : 'N/A'}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {status.tenderStatus === 'won'
                                                    ? status.wonDetails?.workLocation
                                                    : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Details Modal */}
        {selectedStatus && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                <div className="relative mx-auto p-6 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
                    <button 
                        onClick={closeStatusDetails} 
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                    >
                        <FaTimes className="h-6 w-6" />
                    </button>

                    <div className="mt-4">
                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-4 rounded-t-lg">
                            <div className="flex items-center space-x-4">
                                <FaTrophy className="h-8 w-8" />
                                <div>
                                    <h3 className="text-2xl font-bold">
                                        Tender Final Status Details
                                    </h3>
                                    <p className="text-lg opacity-90">
                                        BOQ #{selectedStatus.boq?.offerNumber || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="grid grid-cols-1 gap-6 mt-6">
                            {selectedStatus.tenderStatus === 'won' ? (
                                <WonTenderDetails wonDetails={selectedStatus.wonDetails} boqDetails={selectedStatus.boq} />
                            ) : (
                                <LostTenderDetails lostDetails={selectedStatus.lostDetails} />
                            )}

                            {/* Signatures and Remarks */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <SignatureAndRemarks 
                                    signatures={selectedStatus.signatureAndRemarks || []} 
                                />

                                <div className="mt-4">
                                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
                                        Remarks *
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

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={handleVerify}
                                    disabled={isUpdating || !remarks.trim()}
                                    className={`px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-base font-medium rounded-md shadow-sm hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                        isUpdating || !remarks.trim() ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isUpdating ? 'Processing...' : 'Verify'}
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={isRejecting || !remarks.trim()}
                                    className={`px-6 py-2 bg-red-100 text-red-700 text-base font-medium rounded-md shadow-sm hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                                        isRejecting || !remarks.trim() ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isRejecting ? 'Processing...' : 'Reject'}
                                </button>
                            </div>
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
                        Confirm Rejection
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-gray-600">
                        Are you sure you want to reject tender status for BOQ #{selectedStatus?.boq?.offerNumber}? 
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
                        Yes, Reject Status
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
);
};

export default React.memo(VerifyTenderFinalStatus);