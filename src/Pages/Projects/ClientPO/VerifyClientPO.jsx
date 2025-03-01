import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaChevronDown, FaRegEdit, FaTimes, FaFileAlt, FaFilePdf, FaCheck, FaBoxes, FaTools, FaCogs } from "react-icons/fa";
import SignatureAndRemarks from '../../../Components/SignatureAndRemarks';
import { getPOsForVerification, verifyClientPO, rejectClientPO, clearOperationState } from '../../../Slices/projectModuleSlices/clientPOSlices';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '../../../Components/DailogComponent';
import { showToast } from '../../../utilities/toastUtilities';

const defaultProps = {
    checkContent: true,
    onEmpty: () => { },
    onStateChange: () => { }
};

function VerifyClientPO(props) {
    const { checkContent, onEmpty, onStateChange } = { ...defaultProps, ...props };

    const dispatch = useDispatch();
    const { 
        POsForVerification,
        loading: {
            POVerification: isPOVerificationLoading,
            verifyPO: isVerifyLoading,
            rejectPO: isRejectLoading
        },
        error: {
            POVerification: verificationError,
            verifyPO: verifyError,
            rejectPO: rejectError
        },
        success: {
            verifyPO: verifySuccess,
            rejectPO: rejectSuccess
        }
    } = useSelector(state => state.clientPO);
    
    const userRoleId = useSelector(state => state.auth.userInfo.roleId);
    const [inboxExpanded, setInboxExpanded] = useState(false);
    const [selectedPO, setSelectedPO] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [approvalStatus, setApprovalStatus] = useState({});

    const hasContent = useMemo(() => POsForVerification?.length > 0, [POsForVerification]);

    useEffect(() => {
        onStateChange(isPOVerificationLoading, hasContent);
    }, [isPOVerificationLoading, hasContent, onStateChange]);

    useEffect(() => {
            // Clear states on mount
            dispatch(clearOperationState('verifyPO'));
            dispatch(clearOperationState('rejectPO'));
    
            return () => {
                // Cleanup on unmount
                dispatch(clearOperationState('verifyPO'));
                dispatch(clearOperationState('rejectPO'));
            };
        }, [dispatch]);
    

    useEffect(() => {
        if (userRoleId) {
            dispatch(getPOsForVerification(userRoleId));
        }
    }, [dispatch, userRoleId]);

    // Success handling
    useEffect(() => {
        if (verifySuccess) {
            showToast('success', 'Client PO verified successfully');
            setSelectedPO(null);
            setRemarks('');
        }
    }, [verifySuccess]);

    useEffect(() => {
        if (rejectSuccess) {
            showToast('success', 'Client PO rejected successfully');
            setSelectedPO(null);
            setRemarks('');
            setShowRejectDialog(false);
        }
    }, [rejectSuccess]);

    // Error handling
    useEffect(() => {
        if (verifyError) {
            showToast('error', verifyError || 'Failed to verify Client PO');
        }
    }, [verifyError]);

    useEffect(() => {
        if (rejectError) {
            showToast('error', rejectError || 'Failed to reject Client PO');
            setShowRejectDialog(false);
        }
    }, [rejectError]);

    const renderPOList = useCallback(() => (
        <div className="p-4 bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="text-gray-700">
                        <tr>
                            <th className="border px-4 py-2">Action</th>
                            <th className="border px-4 py-2">PO Number</th>
                            <th className="border px-4 py-2">Client</th>
                            <th className="border px-4 py-2">Date</th>
                            <th className="border px-4 py-2">Total Value</th>
                            <th className="border px-4 py-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {POsForVerification?.map((po) => (
                            <tr key={po._id} className="hover:bg-gray-50">
                                <td className="border px-4 py-2">
                                    {approvalStatus[po._id] ? (
                                        <span className="text-green-600 text-sm font-medium">
                                            Already Processed
                                        </span>
                                    ) : (
                                        <FaRegEdit
                                            className="text-yellow-600 cursor-pointer text-2xl"
                                            onClick={() => setSelectedPO(po)}
                                        />
                                    )}
                                </td>
                                <td className="border px-4 py-2">{po.poNumber}</td>
                                <td className="border px-4 py-2">{po.clientId?.clientName || 'N/A'}</td>
                                <td className="border px-4 py-2">{po.poDate ? formatDate(po.poDate) : 'N/A'}</td>
                                <td className="border px-4 py-2">{formatCurrency(calculateTotalValue(po.items))}</td>
                                <td className="border px-4 py-2">
                                    <span className={`px-2 py-1 rounded-full ${approvalStatus[po._id]
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        } text-xs`}>
                                        {approvalStatus[po._id] ? 'Processed' : po.ClientPOStatus}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    ), [POsForVerification, approvalStatus]);

    const calculateTotalValue = (items) => {
        if (!items || !items.length) return 0;
        return items.reduce((sum, item) => sum + (item.totalValue || 0), 0);
    };

    const openPDF = useCallback((filePath) => {
        window.open(`http://localhost:4000/${filePath}`, '_blank', 'noopener,noreferrer');
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return 'N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(amount);
    };

    const handleVerify = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before verifying');
            return;
        }

        try {
            await dispatch(verifyClientPO({
                id: selectedPO._id,
                remarks: remarks.trim()
            })).unwrap();
            
            // Note: Success toast is handled in the useEffect hook
            dispatch(getPOsForVerification(userRoleId));
        } catch (error) {
            console.error('Verification error:', error);
            if (error.code === 'ALREADY_APPROVED') {
                showToast('warning', 'This PO has already been processed at your role level');
                setApprovalStatus(prev => ({
                    ...prev,
                    [selectedPO._id]: true
                }));
                dispatch(getPOsForVerification(userRoleId));
                setSelectedPO(null);
            }
            // Other errors are handled in the useEffect
        }
    }, [dispatch, selectedPO, remarks, userRoleId]);

    const handleReject = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before rejecting');
            return;
        }
        setShowRejectDialog(true);
    }, [remarks]);

    const handleRejectConfirmation = useCallback(
        async () => {
            try {
                await dispatch(rejectClientPO({
                    id: selectedPO._id,
                    remarks: remarks.trim()
                })).unwrap();

                // Note: Success toast is handled in the useEffect hook
                dispatch(getPOsForVerification(userRoleId));
            } catch (error) {
                console.error('Rejection error:', error);
                // Error is handled in the useEffect
            }
        }, [dispatch, selectedPO, remarks, userRoleId]
    );

    const renderActionButtons = () => (
        <div className="mt-6 flex justify-end space-x-4">
            <button
                onClick={handleVerify}
                disabled={isVerifyLoading || approvalStatus[selectedPO?._id]}
                className={`px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-md 
                    ${approvalStatus[selectedPO?._id]
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:from-indigo-600 hover:to-purple-700'}`}
            >
                {isVerifyLoading ? 'Processing...' :
                    approvalStatus[selectedPO?._id] ? 'Already Processed' : 'Verify'}
            </button>
            <button
                onClick={handleReject}
                disabled={isRejectLoading || approvalStatus[selectedPO?._id]}
                className="px-6 py-2 bg-red-100 text-red-700 font-medium rounded-md hover:bg-red-200 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
                {isRejectLoading ? 'Processing...' : 'Reject'}
            </button>
        </div>
    );

    if (isPOVerificationLoading && !POsForVerification?.length) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (verificationError || !hasContent) return null;

    return (
        <>
            <div className="w-full bg-white shadow-md rounded-md overflow-hidden mb-4 mt-4">
                <div className="p-4 bg-slate-100 flex justify-between items-center">
                    <div className="px-2 py-2 rounded-full bg-slate-300 cursor-pointer"
                        onClick={() => setInboxExpanded(!inboxExpanded)}>
                        <FaChevronDown className={`text-gray-600 font-bold ${inboxExpanded ? 'rotate-180 duration-300' : ''}`} />
                    </div>
                    <div><h3 className="text-gray-600 font-bold">Client PO Verification</h3></div>
                    <div className="font-bold text-red-500">({POsForVerification?.length || 0})</div>
                </div>

                {inboxExpanded && renderPOList()}
                {selectedPO && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                        <div className="relative mx-auto p-6 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setSelectedPO(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                            >
                                <FaTimes className="h-6 w-6" />
                            </button>

                            <div className="mt-4">
                                {/* Header Section */}
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-t-lg">
                                    <div className="flex items-center space-x-4">
                                        <FaFileAlt className="h-8 w-8" />
                                        <div>
                                            <h3 className="text-2xl font-bold">Client PO Details</h3>
                                            <p className="text-lg opacity-90">#{selectedPO.poNumber}</p>
                                            <p className="text-lg opacity-90">{selectedPO.clientId?.clientName}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Client PO Basic Details */}
                                <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">PO Basic Details</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="bg-indigo-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">PO Number</p>
                                            <p className="text-lg font-semibold text-indigo-700">
                                                {selectedPO.poNumber}
                                            </p>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">PO Date</p>
                                            <p className="text-lg font-semibold text-purple-700">
                                                {formatDate(selectedPO.poDate)}
                                            </p>
                                        </div>
                                        <div className="bg-indigo-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Client</p>
                                            <p className="text-lg font-semibold text-indigo-700">
                                                {selectedPO.clientId?.clientName} ({selectedPO.clientId?.clientCode})
                                            </p>
                                        </div>
                                        {selectedPO.subClientId && (
                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">Subclient</p>
                                                <p className="text-lg font-semibold text-green-700">
                                                    {selectedPO.subClientId?.subClientCode || "N/A"}
                                                </p>
                                            </div>
                                        )}
                                        <div className="bg-yellow-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Cost Centre</p>
                                            <p className="text-lg font-semibold text-yellow-700">
                                                {selectedPO.costCentreId?.ccName} ({selectedPO.costCentreId?.ccNo})
                                            </p>
                                        </div>
                                        <div className="bg-orange-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">BOQ</p>
                                            <p className="text-lg font-semibold text-orange-700">
                                                {selectedPO.boqId?.offerNumber || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Rest of the component remains the same */}
                                {/* ... other sections ... */}

                                {/* PO Items */}
                                <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">PO Items</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="px-4 py-2 border">Sl No</th>
                                                    <th className="px-4 py-2 border">Description</th>
                                                    <th className="px-4 py-2 border">Quantity</th>
                                                    <th className="px-4 py-2 border">Rate</th>
                                                    <th className="px-4 py-2 border">Total Value</th>
                                                    <th className="px-4 py-2 border">Types</th>
                                                    <th className="px-4 py-2 border">Sublet</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedPO.items?.map((item, index) => (
                                                    <tr key={item._id || index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 border">{index + 1}</td>
                                                        <td className="px-4 py-2 border">{item.description}</td>
                                                        <td className="px-4 py-2 border text-right">{item.quantity}</td>
                                                        <td className="px-4 py-2 border text-right">{formatCurrency(item.rate)}</td>
                                                        <td className="px-4 py-2 border text-right font-medium">
                                                            <div className="bg-gray-50 px-3 py-1 rounded-md inline-block min-w-[120px] text-right">
                                                                {formatCurrency(item.totalValue)}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2 border">
                                                            <div className="flex flex-wrap justify-center gap-1">
                                                                {item.itemTypes?.includes('Supply') && (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                                                        <FaBoxes className="mr-1" /> Supply
                                                                    </span>
                                                                )}
                                                                {item.itemTypes?.includes('Service') && (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                                        <FaTools className="mr-1" /> Service
                                                                    </span>
                                                                )}
                                                                {item.itemTypes?.includes('Manufacturing') && (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                                        <FaCogs className="mr-1" /> Manufacturing
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2 border text-center">
                                                            {item.isSublet ? (
                                                                <FaCheck className="text-green-500 inline-block" />
                                                            ) : (
                                                                <FaTimes className="text-gray-300 inline-block" />
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-indigo-50 border-t-2 border-indigo-200">
                                                    <td colSpan="4" className="px-4 py-3 border text-right font-medium text-gray-700">
                                                        Total Value:
                                                    </td>
                                                    <td className="px-4 py-3 border whitespace-nowrap text-right font-bold text-gray-900">
                                                        <div className="bg-white px-3 py-2 rounded-md border border-indigo-200 inline-block min-w-[120px] text-right">
                                                            {formatCurrency(calculateTotalValue(selectedPO.items))}
                                                        </div>
                                                    </td>
                                                    <td colSpan="2" className="border"></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Billing & Budget Information */}
                                <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Billing & Budget Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-indigo-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Billing Plan</p>
                                            <p className="text-lg font-semibold text-indigo-700">
                                                {selectedPO.billingPlan?.replace('_', ' ') || "N/A"}
                                            </p>
                                        </div>
                                        
                                        {selectedPO.advanceApplicable?.isApplicable && (
                                            <div className="bg-purple-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">Advance Payment</p>
                                                <p className="text-lg font-semibold text-purple-700">
                                                    {selectedPO.advanceApplicable.percentage}%
                                                </p>
                                            </div>
                                        )}
                                        
                                        <div className="bg-indigo-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Budget Allocation Method</p>
                                            <p className="text-lg font-semibold text-indigo-700">
                                                {selectedPO.budgetAllocation?.method?.replace('_', ' ') || "N/A"}
                                            </p>
                                        </div>
                                        
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Budget Allocation Percentage</p>
                                            <p className="text-lg font-semibold text-green-700">
                                                {selectedPO.budgetAllocation?.percentage || 0}%
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Attachments */}
                                {selectedPO.attachments && selectedPO.attachments.length > 0 && (
                                    <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Attachments</h4>
                                        <div className="grid grid-cols-1 gap-4">
                                            {selectedPO.attachments.map((attachment) => (
                                                <div key={attachment.id}
                                                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                                    <span>{attachment.name}</span>
                                                    <button
                                                        onClick={() => openPDF(attachment.filePath)}
                                                        className="text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        <FaFilePdf className="text-xl text-red-500" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Previous Signatures and Remarks */}
                                <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                                    <SignatureAndRemarks
                                        signatures={selectedPO.signatureAndRemarks || []}
                                    />
                                    <div className="mt-4">
                                        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
                                            Remarks
                                        </label>
                                        <textarea
                                            id="remarks"
                                            rows="3"
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            placeholder="Enter your remarks here"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {renderActionButtons()}
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
                            Confirm PO Rejection
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-gray-600">
                            Are you sure you want to reject Client PO #{selectedPO?.poNumber}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleRejectConfirmation} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md">
                            Yes, Reject PO
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default React.memo(VerifyClientPO);