import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    FaChevronDown,
    FaRegEdit,
    FaTimes,

    FaFilePdf,


    FaArrowDown,
    FaArrowUp
} from "react-icons/fa";
import SignatureAndRemarks from '../../Components/SignatureAndRemarks';
import {
    fetchBOQsForRevisionVerificationThunk,
    verifyBOQRevisionThunk,
    rejectBOQRevisionThunk,
    fetchPreviousRatesThunk,
    fetchRateHistoryThunk
} from '../../Slices/boqRevisionSlices';
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
import { RateHistoryIcon } from '../../Components/RateHistory';

function VerifyRevision() {
    const dispatch = useDispatch();
    const {
        boqsForRevisionVerification,
        previousRates,
        loading,
        error,
        rateHistory,
        rateHistoryLoading
    } = useSelector(state => state.boqRevision);
    const userRoleId = useSelector(state => state.auth.userInfo.roleId);

    // State declarations
    const [inboxExpanded, setInboxExpanded] = useState(false);
    const [selectedBOQ, setSelectedBOQ] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    const hasContent = useMemo(() => boqsForRevisionVerification?.length > 0, [boqsForRevisionVerification]);

    // Effect for fetching BOQs
    useEffect(() => {
        if (userRoleId) {
            dispatch(fetchBOQsForRevisionVerificationThunk(userRoleId));
        }
    }, [dispatch, userRoleId]);

    // Effect for fetching rate history
    useEffect(() => {
        if (selectedBOQ?._id) {
            dispatch(fetchPreviousRatesThunk(selectedBOQ._id));
        }
    }, [dispatch, selectedBOQ]);

    useEffect(() => {
        if (selectedBOQ?._id) {
            dispatch(fetchRateHistoryThunk(selectedBOQ._id));
        }
    }, [dispatch, selectedBOQ]);



    // Utility functions
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };


    const calculateRateDifference = (currentRate, previousRate) => {
        if (!previousRate) return 0;
        return ((currentRate - previousRate) / previousRate) * 100;
    };

    // PDF opener
    const openPDF = useCallback((filePath) => {
        window.open(`http://localhost:4000/${filePath}`, '_blank', 'noopener,noreferrer');
    }, []);

    // BOQ List rendering
    const renderBOQList = useCallback(() => (
        <div className="p-4 bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="text-gray-700">
                        <tr>
                            <th className="border px-4 py-2">Action</th>
                            <th className="border px-4 py-2">BOQ Number</th>
                            <th className="border px-4 py-2">Client</th>
                            <th className="border px-4 py-2">Original Amount</th>
                            <th className="border px-4 py-2">Revised Amount</th>
                            <th className="border px-4 py-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {boqsForRevisionVerification?.map((boq) => (
                            <tr key={boq._id} className="hover:bg-gray-50">
                                <td className="border px-4 py-2">
                                    <button
                                        onClick={() => setSelectedBOQ(boq)}
                                        className="text-indigo-600 hover:text-indigo-800"
                                    >
                                        <FaRegEdit className="text-xl" />
                                    </button>
                                </td>
                                <td className="border px-4 py-2">{boq.offerNumber}</td>
                                <td className="border px-4 py-2">{boq.businessOpportunity?.client?.name}</td>
                                <td className="border px-4 py-2">{formatCurrency(boq.originalAmount)}</td>
                                <td className="border px-4 py-2">
                                    <div className="flex items-center space-x-2">
                                        {formatCurrency(boq.totalAmount)}
                                        {boq.totalAmount > boq.originalAmount ? (
                                            <FaArrowUp className="text-green-500" />
                                        ) : (
                                            <FaArrowDown className="text-red-500" />
                                        )}
                                    </div>
                                </td>
                                <td className="border px-4 py-2">
                                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                                        Revision Pending
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    ), [boqsForRevisionVerification]);

    // Render BOQ Items with rate history
    const renderBOQItems = useCallback(() => {
        if (!selectedBOQ || !previousRates) return null;

        return (
            <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Revised BOQ Items</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-2 border">Sl No</th>
                                <th className="px-4 py-2 border">Description</th>
                                <th className="px-4 py-2 border">Unit</th>
                                <th className="px-4 py-2 border">Qty</th>
                                <th className="px-4 py-2 border">Previous Rate</th>
                                <th className="px-4 py-2 border">Revised Rate</th>
                                <th className="px-4 py-2 border">Variation</th>
                                <th className="px-4 py-2 border">Amount</th>
                                <th className="px-4 py-2 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedBOQ.items.map((item) => {
                                const previousRate = previousRates.find(
                                    rate => rate.itemId === item._id
                                );
                                const rateDifference = calculateRateDifference(
                                    item.unitRate,
                                    previousRate?.previousRate
                                );

                                return (
                                    <tr key={item._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border">{item.slNo}</td>
                                        <td className="px-4 py-2 border">{item.description}</td>
                                        <td className="px-4 py-2 border">{item.unit}</td>
                                        <td className="px-4 py-2 border">{item.qty}</td>
                                        <td className="px-4 py-2 border">
                                            <div className="flex items-center space-x-2">
                                                {formatCurrency(previousRate?.previousRate)}
                                                <RateHistoryIcon
                                                    history={rateHistory
                                                        ?.find(history => history.itemCode === item.itemCode)
                                                        ?.revisions?.map(revision => ({
                                                            rate: revision.rate,
                                                            date: revision.timestamp,
                                                            remarks: revision.remarks || 'Rate revised',
                                                            changePercentage: revision.changePercentage,
                                                            revisionNumber: revision.revisionNumber
                                                        })) || []}
                                                    currentRate={item.unitRate}
                                                    title={`Rate History - ${item.description}`}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 border">
                                            {formatCurrency(item.unitRate)}
                                        </td>
                                        <td className={`px-4 py-2 border font-medium ${rateDifference > 0
                                            ? 'text-green-500'
                                            : rateDifference < 0
                                                ? 'text-red-500'
                                                : 'text-gray-500'
                                            }`}>
                                            {Math.abs(rateDifference).toFixed(2)}%
                                            {rateDifference > 0 ? <FaArrowUp className="inline ml-1" /> :
                                                rateDifference < 0 ? <FaArrowDown className="inline ml-1" /> : null}
                                        </td>
                                        <td className="px-4 py-2 border">{formatCurrency(item.amount)}</td>
                                        <td className="px-4 py-2 border">
                                            {item.attachment && (
                                                <button
                                                    onClick={() => openPDF(item.attachment.filePath)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <FaFilePdf className="text-xl" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            <tr className="bg-gray-100 font-semibold">
                                <td colSpan="7" className="px-4 py-2 border text-right">
                                    Total Amount:
                                </td>
                                <td colSpan="2" className="px-4 py-2 border">
                                    {formatCurrency(selectedBOQ.totalAmount)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }, [selectedBOQ, previousRates, openPDF, rateHistory]);

    // Handle verification
    const handleVerify = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before verifying');
            return;
        }

        try {
            await dispatch(verifyBOQRevisionThunk({
                id: selectedBOQ._id,
                remarks: remarks.trim()
            })).unwrap();

            showToast('success', 'BOQ revision verified successfully');
            setSelectedBOQ(null);
            setRemarks('');
            dispatch(fetchBOQsForRevisionVerificationThunk(userRoleId));
        } catch (error) {
            showToast('error', error.message || 'Failed to verify BOQ revision');
        }
    }, [dispatch, selectedBOQ, remarks, userRoleId]);

    // Handle rejection
    const handleReject = useCallback(() => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before rejecting');
            return;
        }
        setShowRejectDialog(true);
    }, [remarks]);

    const handleRejectConfirmation = useCallback(async () => {
        try {
            await dispatch(rejectBOQRevisionThunk({
                id: selectedBOQ._id,
                remarks: remarks.trim()
            })).unwrap();

            showToast('success', 'BOQ revision rejected successfully');
            setSelectedBOQ(null);
            setRemarks('');
            setShowRejectDialog(false);
            dispatch(fetchBOQsForRevisionVerificationThunk(userRoleId));
        } catch (error) {
            showToast('error', error.message || 'Failed to reject BOQ revision');
            setShowRejectDialog(false);
        }
    }, [dispatch, selectedBOQ, remarks, userRoleId]);

    if (loading && !boqsForRevisionVerification?.length) {
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
                        <FaChevronDown className={`text-gray-600 font-bold ${inboxExpanded ? 'rotate-180 duration-300' : ''
                            }`} />
                    </div>
                    <div>
                        <h3 className="text-gray-600 font-bold">BOQ Revision Verification</h3>
                    </div>
                    <div className="font-bold text-red-500">
                        ({boqsForRevisionVerification?.length || 0})
                    </div>
                </div>

                {inboxExpanded && renderBOQList()}

                {/* BOQ Detail Modal */}
                {selectedBOQ && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 shadow-lg rounded-md bg-white">
                            <div className="flex justify-between items-center border-b pb-4">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    BOQ Revision Details
                                </h3>
                                <button
                                    onClick={() => setSelectedBOQ(null)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <FaTimes className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="mt-4 space-y-6">
                                {/* BOQ Header Info */}
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm opacity-75">Client</p>
                                            <p className="font-semibold">
                                                {selectedBOQ.businessOpportunity?.client?.name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm opacity-75">BOQ Number</p>
                                            <p className="font-semibold">{selectedBOQ.offerNumber}</p>
                                        </div>
                                    </div>
                                </div>


                                {/* Render BOQ Items with rate history */}
                                {renderBOQItems()}

                                {/* Supporting Documents */}
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                        Supporting Documents
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        {selectedBOQ.attachments?.map((attachment) => (
                                            <div
                                                key={attachment._id}
                                                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                                            >
                                                <span className="text-gray-700">{attachment.name}</span>
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

                                {/* Rate Revision Summary */}
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                        Rate Revision Summary
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Original Amount</p>
                                            <p className="text-lg font-semibold text-indigo-700">
                                                {formatCurrency(selectedBOQ.originalAmount)}
                                            </p>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Revised Amount</p>
                                            <p className="text-lg font-semibold text-purple-700">
                                                {formatCurrency(selectedBOQ.totalAmount)}
                                            </p>
                                        </div>
                                        <div className={`p-4 rounded-lg ${selectedBOQ.totalAmount > selectedBOQ.originalAmount
                                            ? 'bg-red-50'
                                            : 'bg-green-50'
                                            }`}>
                                            <p className="text-sm text-gray-600">Variation</p>
                                            <p className={`text-lg font-semibold ${selectedBOQ.totalAmount > selectedBOQ.originalAmount
                                                ? 'text-green-700'
                                                : 'text-red-700'
                                                }`}>
                                                {Math.abs(
                                                    ((selectedBOQ.totalAmount - selectedBOQ.originalAmount) /
                                                        selectedBOQ.originalAmount) * 100
                                                ).toFixed(2)}%
                                                {selectedBOQ.totalAmount > selectedBOQ.originalAmount
                                                    ? <FaArrowUp className="inline ml-1" />
                                                    : <FaArrowDown className="inline ml-1" />
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                               
                                {/* Previous Approvals and Signatures */}
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <SignatureAndRemarks
                                        signatures={selectedBOQ.signatureAndRemarks || []}
                                    />
                                </div>

                                {/* Remarks Section */}
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <label
                                        htmlFor="remarks"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Verification Remarks
                                    </label>
                                    <textarea
                                        id="remarks"
                                        rows="3"
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder="Enter your remarks for this revision verification"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-4 pt-4">
                                    <button
                                        onClick={handleVerify}
                                        disabled={loading}
                                        className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-md 
            hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 
            focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        {loading ? 'Processing...' : 'Verify Revision'}
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        disabled={loading}
                                        className="px-6 py-2 bg-red-100 text-red-700 font-medium rounded-md 
            hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 
            focus:ring-red-500 disabled:opacity-50"
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
                            Confirm Rejection of BOQ Revision
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-gray-600">
                            Are you sure you want to reject this BOQ revision? This will revert all rate changes.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRejectConfirmation}
                            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md"
                        >
                            Reject Revision
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default React.memo(VerifyRevision);