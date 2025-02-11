import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaChevronDown, FaRegEdit, FaTimes, FaFileAlt, FaFilePdf, FaPencilAlt } from "react-icons/fa";
import SignatureAndRemarks from '../../Components/SignatureAndRemarks';
import {
    getClientBOQsForVerificationThunk,
    verifyClientBOQThunk,
    rejectClientBOQThunk,
    resetClientFinalBOQState
} from '../../Slices/projectModuleSlices/clientFinalBoqSlices';
import { fetchBOQById } from '../../Slices/clientBoqSlices'
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

function VerifyClientBOQ(props) {
    const { checkContent, onEmpty, onStateChange } = { ...defaultProps, ...props };
    const dispatch = useDispatch();
    const { finalboqsForVerification: boqsForVerification, loading, error } =
        useSelector(state => state.clientFinalBOQ);
    const userRoleId = useSelector(state => state.auth.userInfo.roleId);
    const { currentBOQ } = useSelector(state => state.boq);

    const [inboxExpanded, setInboxExpanded] = useState(false);
    const [selectedBOQ, setSelectedBOQ] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [approvalStatus, setApprovalStatus] = useState({});

    const hasContent = useMemo(() => boqsForVerification?.length > 0, [boqsForVerification]);

    useEffect(() => {
        onStateChange(loading, hasContent);
    }, [loading, hasContent, onStateChange]);

    useEffect(() => {
        if (userRoleId) {
            dispatch(getClientBOQsForVerificationThunk(userRoleId));

        }
    }, [dispatch, userRoleId]);



    const handleBOQSelection = useCallback(async (boq) => {
        console.log('Initial BOQ Selection:', boq);
        setSelectedBOQ(boq);
        if (boq?.tenderId) {
            try {
                const result = await dispatch(fetchBOQById(boq.tenderId)).unwrap();
                console.log('Fetched BOQ by ID Response:', {
                    completeResponse: result,
                    boqDetails: result.boq,

                });
            } catch (error) {
                console.error('Error fetching BOQ details:', error);
                showToast('error', 'Failed to fetch BOQ details');
            }
        }
    }, [dispatch])


    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleVerify = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before verifying');
            return;
        }
    
        try {
            // We need to use currentBOQ._id instead of selectedBOQ._id
            await dispatch(verifyClientBOQThunk({
                id: selectedBOQ._id,
                remarks: remarks.trim()
            })).unwrap();
    
            showToast('success', 'Client BOQ verified successfully');
            setSelectedBOQ(null);
            setRemarks('');
            // Reset the currentBOQ state
            dispatch( resetClientFinalBOQState());
            dispatch(getClientBOQsForVerificationThunk(userRoleId));
        } catch (error) {
            console.error('Verification error:', error);
            showToast('error', error.message || 'Failed to verify Client BOQ');
        }
    }, [dispatch, selectedBOQ, remarks, userRoleId]);
    const handleRejectConfirmation = useCallback(async () => {
        try {
            await dispatch(rejectClientBOQThunk({
                id: selectedBOQ._id,
                remarks: remarks.trim()
            })).unwrap();

            showToast('success', 'Client BOQ rejected successfully');
            setSelectedBOQ(null);
            setRemarks('');
            setShowRejectDialog(false);
            dispatch(getClientBOQsForVerificationThunk(userRoleId));
        } catch (error) {
            showToast('error', error.message || 'Failed to reject Client BOQ');
            setShowRejectDialog(false);
        }
    }, [dispatch, selectedBOQ, remarks, userRoleId]);

    const openPDF = useCallback((filePath) => {
        window.open(`http://localhost:4000/${filePath}`, '_blank', 'noopener,noreferrer');
    }, []);

    const renderBOQList = useCallback(() => (
        <div className="p-4 bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="text-gray-700">
                        <tr>
                            <th className="border px-4 py-2">Action</th>
                            <th className="border px-4 py-2">BOQ Number</th>
                            <th className="border px-4 py-2">Client</th>
                            <th className="border px-4 py-2">Send Date</th>
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
                                            onClick={() => handleBOQSelection(boq)}
                                        />
                                    )}
                                </td>
                                <td className="border px-4 py-2">{boq.tenderId}</td>
                                <td className="border px-4 py-2">{boq.tenderId?.businessOpportunity?.client?.name}</td>
                                <td className="border px-4 py-2">{formatDate(boq.sendToClientDate)}</td>
                                <td className="border px-4 py-2">
                                    <span className={`px-2 py-1 rounded-full ${approvalStatus[boq._id]
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        } text-xs`}>
                                        {approvalStatus[boq._id] ? 'Processed' : boq.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    ), [boqsForVerification, approvalStatus, handleBOQSelection]);

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
                    <div><h3 className="text-gray-600 font-bold">Client BOQ Verification</h3></div>
                    <div className="font-bold text-red-500">({boqsForVerification?.length || 0})</div>
                </div>

                {inboxExpanded && renderBOQList()}

                {/* BOQ Details Modal */}
                {selectedBOQ && currentBOQ && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative mx-auto p-6 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-lg bg-white mt-10">
                            <button
                                onClick={() => setSelectedBOQ(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                            >
                                <FaTimes className="h-6 w-6" />
                            </button>

                            <div className="mt-4">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-t-lg">
                                    <div className="flex items-center space-x-4">
                                        <FaFileAlt className="h-8 w-8" />
                                        <div>
                                            <h3 className="text-2xl font-bold">BOQ Details</h3>
                                            <p className="text-lg opacity-90">#{currentBOQ.offerNumber}</p>
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
                                                <div className="bg-indigo-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Client Name</p>
                                                    <p className="text-lg font-semibold text-indigo-700">{currentBOQ.businessOpportunity?.client?.name}</p>
                                                </div>
                                                <div className="bg-purple-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Total Amount</p>
                                                    <p className="text-lg font-semibold text-purple-700">
                                                        {currentBOQ.totalAmount?.toLocaleString('en-IN', {
                                                            style: 'currency',
                                                            currency: 'INR'
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="bg-indigo-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Offer Number</p>
                                                    <p className="text-lg font-semibold text-indigo-700">
                                                    #{currentBOQ.offerNumber}
                                                    </p>
                                                </div>
                                                <div className="bg-green-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Status</p>
                                                    <p className="text-lg font-semibold text-green-700">{currentBOQ.status}</p>
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
                                                        {currentBOQ.businessOpportunity?.client?.name}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center border-b pb-2">
                                                    <span className="text-gray-600">Contact Person</span>
                                                    <span className="text-lg font-semibold text-gray-800">
                                                        {currentBOQ.businessOpportunity?.client?.contactPerson}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center border-b pb-2">
                                                    <span className="text-gray-600">Email</span>
                                                    <span className="text-lg font-semibold text-gray-800">
                                                        {currentBOQ.businessOpportunity?.client?.email}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Phone</span>
                                                    <span className="text-lg font-semibold text-gray-800">
                                                        {currentBOQ.businessOpportunity?.client?.phone}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-6">
                                        {/* Business Opportunity Details */}
                                        <div className="bg-white p-6 rounded-lg shadow-md">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Business Opportunity Details</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Category</p>
                                                    <p className="text-base font-semibold text-gray-800">
                                                        {currentBOQ.businessOpportunity?.businessCategory}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Type</p>
                                                    <p className="text-base font-semibold text-gray-800">
                                                        {currentBOQ.businessOpportunity?.type}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Description</p>
                                                    <p className="text-base font-semibold text-gray-800">
                                                        {currentBOQ.businessOpportunity?.descriptionOfWork}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Estimated Value</p>
                                                    <p className="text-base font-semibold text-gray-800">
                                                        {currentBOQ.businessOpportunity?.estimatedValue?.toLocaleString('en-IN', {
                                                            style: 'currency',
                                                            currency: 'INR'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ultimate Customer Details */}
                                        <div className="bg-white p-6 rounded-lg shadow-md">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Ultimate Customer Details</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Name</p>
                                                    <p className="text-base font-semibold text-gray-800">
                                                        {currentBOQ.businessOpportunity?.ultimateCustomer?.name}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Industry</p>
                                                    <p className="text-base font-semibold text-gray-800">
                                                        {currentBOQ.businessOpportunity?.ultimateCustomer?.industry}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                                                    <p className="text-sm text-gray-600">Sector</p>
                                                    <p className="text-base font-semibold text-gray-800">
                                                        {currentBOQ.businessOpportunity?.ultimateCustomer?.sector}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Attachments */}
                                <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                                    <h4 className="text-lg font-semibold mb-4">Attachments</h4>
                                    <div className="grid gap-4">
                                        {selectedBOQ.attachments?.map((attachment, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                                <span className="flex items-center">
                                                    <FaFileAlt className="text-gray-400 mr-2" />
                                                    <span>{attachment.filename}</span>
                                                </span>
                                                <button
                                                    onClick={() => openPDF(attachment.filepath)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <FaFilePdf className="text-xl" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Remarks Section */}
                                <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                                    <SignatureAndRemarks
                                        signatures={selectedBOQ.signatureAndRemarks || []}
                                    />
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Remarks
                                        </label>
                                        <textarea
                                            rows="3"
                                            className="w-full p-2 border rounded-md"
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            placeholder="Enter your remarks..."
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 flex justify-end space-x-4">
                                    <button
                                        onClick={() => setShowRejectDialog(true)}
                                        className="px-6 py-2 bg-red-100 text-red-700 text-base font-medium rounded-md shadow-sm hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                        disabled={loading}
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={handleVerify}
                                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-base font-medium rounded-md shadow-sm hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                        disabled={loading}
                                    >
                                        Verify
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reject Confirmation Dialog */}
                <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <AlertDialogContent >
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Rejection</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to reject this Client BOQ? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRejectConfirmation}>
                                Confirm Reject
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    );
}

export default React.memo(VerifyClientBOQ);