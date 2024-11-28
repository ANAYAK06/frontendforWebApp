import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaChevronDown, FaRegEdit, FaTimes, FaFileAlt, FaFilePdf, FaCheck, FaPencilAlt } from "react-icons/fa";
import SignatureAndRemarks from '../../Components/SignatureAndRemarks';
import { fetchVerificationBOQs, updateBOQThunk, rejectBOQThunk, fetchChecklistById } from '../../Slices/clientBoqSlices';
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

function VerifyBOQ(props) {
    const { checkContent, onEmpty, onStateChange } = { ...defaultProps, ...props };

    const dispatch = useDispatch();
    const { boqsForVerification, loading, error } = useSelector(state => state.boq);
    const userRoleId = useSelector(state => state.auth.userInfo.roleId);
    const [inboxExpanded, setInboxExpanded] = useState(false);
    const [selectedBOQ, setSelectedBOQ] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [editableItems, setEditableItems] = useState({});
    const [modifiedBOQ, setModifiedBOQ] = useState(null);
    const [approvalStatus, setApprovalStatus] = useState({});
    const [selectedChecklistData, setSelectedChecklistData] = useState(null);
    const [isChecklistLoading, setIsChecklistLoading] = useState(false);
    const [checklistError, setChecklistError] = useState(null);

    const hasContent = useMemo(() => boqsForVerification?.length > 0, [boqsForVerification]);

    useEffect(() => {
        onStateChange(loading, hasContent);
    }, [loading, hasContent, onStateChange]);

    useEffect(() => {
        if (userRoleId) {
            dispatch(fetchVerificationBOQs(userRoleId));
        }
    }, [dispatch, userRoleId]);
    useEffect(() => {
        const fetchSelectedChecklist = async () => {
            if (selectedBOQ?.checklist && selectedBOQ.checklist.length > 0) {
                setIsChecklistLoading(true);
                try {
                    const checklistId = selectedBOQ.checklist[0].checklistId;
                    console.log('Fetching checklist with ID:', checklistId);

                    const response = await dispatch(fetchChecklistById(checklistId)).unwrap();
                    console.log('Raw API response:', response);

                    // If response is directly the data we need
                    setSelectedChecklistData(response);

                    console.log('Set checklist data:', response);
                } catch (error) {
                    console.error('Error fetching checklist:', error);
                    setChecklistError(error.message);
                } finally {
                    setIsChecklistLoading(false);
                }
            }
        };

        fetchSelectedChecklist();
    }, [selectedBOQ, dispatch]);


    const renderChecklistSection = useCallback(() => {
        if (!selectedBOQ?.checklist || !selectedChecklistData) return null;

        return (
            <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                {isChecklistLoading ? (
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-20 bg-gray-100 rounded"></div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Checklist Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-lg font-semibold text-gray-800">
                                {selectedChecklistData.name}
                                <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                    {selectedBOQ.checklist.length} items
                                </span>
                            </h4>
                        </div>

                        {/* Checklist Items Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {selectedBOQ.checklist.map((item, index) => {
                                const checklistItem = selectedChecklistData.items?.find(
                                    i => i._id === item.checklistItemId
                                );
                                const isYes = item.comments?.toLowerCase() === 'yes';

                                return (
                                    <div
                                        key={item._id}
                                        className={`p-3 rounded-lg border ${isYes ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                            } hover:shadow-md transition-all`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className={`flex-shrink-0 p-1 rounded-full ${'bg-green-200'
                                                }`}>
                                                <FaCheck className={`w-3 h-3 ${'text-green-700'
                                                    }`} />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <p className="text-sm text-gray-700 leading-snug mb-1">
                                                    {checklistItem?.description || 'Loading description...'}
                                                </p>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block ${isYes
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                    {item.comments}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        );
    }, [selectedBOQ, selectedChecklistData, isChecklistLoading]);




    const renderBOQList = useCallback(() => (
        <div className="p-4 bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="text-gray-700">
                        <tr>
                            <th className="border px-4 py-2">Action</th>
                            <th className="border px-4 py-2">BOQ Number</th>
                            <th className="border px-4 py-2">Client</th>
                            <th className="border px-4 py-2">Total Amount</th>
                            <th className="border px-4 py-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {boqsForVerification?.map((boq) => (
                            <tr key={boq._id} className="hover:bg-gray-50">
                                <td className="border px-4 py-2">
                                    {approvalStatus[boq._id] ? (
                                        <span className="text-green-600 text-sm font-medium">
                                            Already Processed
                                        </span>
                                    ) : (
                                        <FaRegEdit
                                            className="text-yellow-600 cursor-pointer text-2xl"
                                            onClick={() => setSelectedBOQ(boq)}
                                        />
                                    )}
                                </td>
                                <td className="border px-4 py-2">{boq.offerNumber}</td>
                                <td className="border px-4 py-2">{boq.businessOpportunity?.client?.name}</td>
                                <td className="border px-4 py-2">{formatCurrency(boq.totalAmount)}</td>
                                <td className="border px-4 py-2">
                                    <span className={`px-2 py-1 rounded-full ${approvalStatus[boq._id]
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        } text-xs`}>
                                        {approvalStatus[boq._id] ? 'Processed' : boq.boqStatus}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    ), [boqsForVerification, approvalStatus]);

    const openPDF = useCallback((filePath) => {
        window.open(`http://localhost:4000/${filePath}`, '_blank', 'noopener,noreferrer');
    }, []);

    const calculateAmount = (qty, unitRate) => {
        return qty * unitRate;
    };

    const handleEditClick = (itemId) => {
        setEditableItems(prev => ({
            ...prev,
            [itemId]: true
        }));
    };

    const handleUnitRateChange = (itemId, newRate) => {
        const numericRate = parseFloat(newRate);
        if (isNaN(numericRate)) return;

        const updatedItems = modifiedBOQ ? modifiedBOQ.items : selectedBOQ.items;
        const newItems = updatedItems.map(item => {
            if (item._id === itemId) {
                const newAmount = calculateAmount(item.qty, numericRate);
                return {
                    ...item,
                    unitRate: numericRate,
                    amount: newAmount
                };
            }
            return item;
        });
        const newTotal = newItems.reduce((sum, item) => sum + item.amount, 0);

        setModifiedBOQ({
            ...selectedBOQ,
            items: newItems,
            totalAmount: newTotal
        });
    };

    const handleSaveRate = (itemId) => {
        setEditableItems(prev => ({
            ...prev,
            [itemId]: false
        }));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return amount.toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR'
        });
    };

    const getRateColor = (unitRate, minRate) => {
        if (!unitRate || !minRate) return '';
        if (unitRate > minRate) return 'text-green-500';
        if (unitRate < minRate) return 'text-red-500';
        return 'text-orange-500';
    };

    const handleVerify = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before verifying');
            return;
        }

        try {
            // Get the current items (either modified or original)
            const currentItems = modifiedBOQ ? modifiedBOQ.items : selectedBOQ.items;

            // Create the update data as a plain object
            const updateData = {
                remarks: remarks.trim(),
                items: currentItems.map(item => ({
                    _id: item._id,
                    unitRate: Number(item.unitRate),
                    amount: Number(item.amount)
                })),
                totalAmount: Number(modifiedBOQ ? modifiedBOQ.totalAmount : selectedBOQ.totalAmount)
            };

            console.log('Sending update data:', updateData);

            const result = await dispatch(updateBOQThunk({
                id: selectedBOQ._id,
                formData: updateData  // Send as plain object
            })).unwrap();

            console.log('Update result:', result);

            showToast('success', 'BOQ verified successfully');
            setSelectedBOQ(null);
            setRemarks('');
            setModifiedBOQ(null);
            setEditableItems({});
            dispatch(fetchVerificationBOQs(userRoleId));
        } catch (error) {
            console.error('Update error:', error);
            if (error.code === 'ALREADY_APPROVED') {
                showToast('warning', 'This BOQ has already been processed at your role level');
                setApprovalStatus(prev => ({
                    ...prev,
                    [selectedBOQ._id]: true
                }));
                dispatch(fetchVerificationBOQs(userRoleId));
                setSelectedBOQ(null);
            } else {
                showToast('error', error.message || 'Failed to verify BOQ');
            }
        }
    }, [dispatch, selectedBOQ, remarks, userRoleId, modifiedBOQ]);


    // In the rejectBOQ function in the frontend component, fix the parameter structure
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
                await dispatch(rejectBOQThunk({
                    id: selectedBOQ._id,
                    remarks: remarks.trim()
                })).unwrap();
    
                showToast('success', 'BOQ rejected successfully');
                setSelectedBOQ(null);
                setRemarks('');
                setShowRejectDialog(false);
                dispatch(fetchVerificationBOQs(userRoleId));
            } catch (error) {
                console.error('Rejection error:', error);
                showToast('error', error.message || 'Failed to reject BOQ');
                setShowRejectDialog(false);
            }
        },[dispatch,selectedBOQ, remarks, userRoleId]
    ) 

    const renderActionButtons = () => (
        <div className="mt-6 flex justify-end space-x-4">
            <button
                onClick={handleVerify}
                disabled={loading || approvalStatus[selectedBOQ?._id]}
                className={`px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-md 
                    ${approvalStatus[selectedBOQ?._id]
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:from-indigo-600 hover:to-purple-700'}`}
            >
                {loading ? 'Processing...' :
                    approvalStatus[selectedBOQ?._id] ? 'Already Processed' : 'Verify'}
            </button>
            <button
                onClick={handleReject}
                disabled={loading || approvalStatus[selectedBOQ?._id]}
                className="px-6 py-2 bg-red-100 text-red-700 font-medium rounded-md hover:bg-red-200 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
                {loading ? 'Processing...' : 'Reject'}
            </button>
        </div>
    );

    if (loading && !boqsForVerification?.length) {
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
                    <div className="px-2 py-2 rounded-full bg-slate-300 cursor-pointer"
                        onClick={() => setInboxExpanded(!inboxExpanded)}>
                        <FaChevronDown className={`text-gray-600 font-bold ${inboxExpanded ? 'rotate-180 duration-300' : ''}`} />
                    </div>
                    <div><h3 className="text-gray-600 font-bold">BOQ Verification</h3></div>
                    <div className="font-bold text-red-500">({boqsForVerification?.length || 0})</div>
                </div>

                {inboxExpanded && renderBOQList()}
                {selectedBOQ && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                        <div className="relative mx-auto p-6 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setSelectedBOQ(null)}
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
                                            <h3 className="text-2xl font-bold">BOQ Details</h3>
                                            <p className="text-lg opacity-90">#{selectedBOQ.offerNumber}</p>
                                            <p className="text-lg opacity-90">{selectedBOQ.businessOpportunity?.client?.name}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Business Opportunity Details */}
                                <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Business Opportunity Details</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-indigo-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Opportunity Number</p>
                                            <p className="text-lg font-semibold text-indigo-700">
                                                {selectedBOQ.businessOpportunity?.opportunityNumber}
                                            </p>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Opportunity Type</p>
                                            <p className="text-lg font-semibold text-purple-700">
                                                {selectedBOQ.businessOpportunity?.opportunityType}
                                            </p>
                                        </div>
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Business Category</p>
                                            <p className="text-lg font-semibold text-blue-700">
                                                {selectedBOQ.businessOpportunity?.businessCategory}
                                            </p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Estimated Value</p>
                                            <p className="text-lg font-semibold text-green-700">
                                                {formatCurrency(selectedBOQ.businessOpportunity?.estimatedValue)}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Tender Details Section */}
                                    {selectedBOQ.businessOpportunity?.tenderDetails && (
                                        <div className="mt-4">
                                            <h5 className="text-md font-semibold text-gray-800 mb-3">Tender Details</h5>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-yellow-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Tender Number</p>
                                                    <p className="text-lg font-semibold text-yellow-700">
                                                        {selectedBOQ.businessOpportunity?.tenderDetails.tenderNumber}
                                                    </p>
                                                </div>
                                                <div className="bg-orange-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Tender Date</p>
                                                    <p className="text-lg font-semibold text-orange-700">
                                                        {formatDate(selectedBOQ.businessOpportunity?.tenderDetails.tenderDate)}
                                                    </p>
                                                </div>
                                                {selectedBOQ.businessOpportunity?.tenderDetails.emdRequired && (
                                                    <div className="bg-red-50 p-4 rounded-lg">
                                                        <p className="text-sm text-gray-600">EMD Details</p>
                                                        <p className="text-lg font-semibold text-red-700">
                                                            {formatCurrency(selectedBOQ.businessOpportunity?.tenderDetails.emdDetails.amount)}
                                                            <span className="text-sm ml-2">
                                                                ({selectedBOQ.businessOpportunity?.tenderDetails.emdDetails.type})
                                                            </span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Checklist Section */}
                                {renderChecklistSection()}

                                {/* BOQ Items */}
                                <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-lg font-semibold text-gray-800">BOQ Items</h4>
                                        {modifiedBOQ && (
                                            <div className="text-sm text-yellow-600 font-medium">
                                                * Changes pending save
                                            </div>
                                        )}
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="px-4 py-2 border">Sl No</th>
                                                    <th className="px-4 py-2 border">Description</th>
                                                    <th className="px-4 py-2 border">Unit</th>
                                                    <th className="px-4 py-2 border">Qty</th>
                                                    <th className="px-4 py-2 border">Minimum Rate</th>
                                                    <th className="px-4 py-2 border">Unit Rate</th>
                                                    <th className="px-4 py-2 border">Amount</th>
                                                    <th className="px-4 py-2 border">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(modifiedBOQ || selectedBOQ).items.map((item) => (
                                                    <tr key={item._id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 border">{item.slNo}</td>
                                                        <td className="px-4 py-2 border">{item.description}</td>
                                                        <td className="px-4 py-2 border">{item.unit}</td>
                                                        <td className="px-4 py-2 border">{item.qty}</td>
                                                        <td className="px-4 py-2 border">{formatCurrency(item.minimumRate)}</td>
                                                        <td className={`px-4 py-2 border ${getRateColor(item.unitRate, item.minimumRate)}`}>
                                                            <div className="flex items-center space-x-2">
                                                                {editableItems[item._id] ? (
                                                                    <input
                                                                        type="number"
                                                                        value={item.unitRate}
                                                                        onChange={(e) => handleUnitRateChange(item._id, e.target.value)}
                                                                        className="w-24 p-1 border rounded"
                                                                        min="0"
                                                                        step="0.01"
                                                                    />
                                                                ) : (
                                                                    formatCurrency(item.unitRate)
                                                                )}
                                                                {editableItems[item._id] ? (
                                                                    <FaCheck
                                                                        className="text-green-600 cursor-pointer"
                                                                        onClick={() => handleSaveRate(item._id)}
                                                                    />
                                                                ) : (
                                                                    <FaPencilAlt
                                                                        className="text-blue-600 cursor-pointer"
                                                                        onClick={() => handleEditClick(item._id)}
                                                                    />
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2 border">{formatCurrency(item.amount)}</td>
                                                        <td className="px-4 py-2 border">
                                                            <div className="flex space-x-2">
                                                                {item.attachmentRequired && item.attachment && (
                                                                    <button
                                                                        onClick={() => openPDF(item.attachment.filePath)}
                                                                        className="text-blue-600 hover:text-blue-800"
                                                                    >
                                                                        <FaFilePdf className="text-xl text-red-500" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-gray-100 font-semibold">
                                                    <td colSpan="6" className="px-4 py-2 border text-right">Total Amount:</td>
                                                    <td colSpan="2" className="px-4 py-2 border">
                                                        {formatCurrency((modifiedBOQ || selectedBOQ).totalAmount)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Supporting Documents */}
                                <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Supporting Documents</h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        {selectedBOQ.attachments.map((attachment) => (
                                            <div key={attachment._id}
                                                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                                <span>{attachment.name}</span>
                                                <button
                                                    onClick={() => openPDF(attachment.filePath)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <FaFilePdf className="text-xl text-red-500" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Signatures and Remarks */}
                                <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                                    <SignatureAndRemarks
                                        signatures={selectedBOQ.signatureAndRemarks || []}
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
                            Confirm BOQ Rejection
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-gray-600">
                            Are you sure you want to reject BOQ #{selectedBOQ?.offerNumber}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleRejectConfirmation} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md">
                            Yes, Reject BOQ
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default React.memo(VerifyBOQ);