import React, { useEffect, useState, useCallback, useMemo, isValidElement } from 'react';
import { FaChevronDown, FaRegEdit, FaTimes, FaBoxes, FaTools } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import SignatureAndRemarks from '../../../Components/SignatureAndRemarks';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../../../Components/DailogComponent';
import { showToast } from '../../../utilities/toastUtilities';
import{getBaseCodesForVerification, verifyBaseCode, rejectBaseCode, getDCAForItemCode, getSubDCAForItemCode} from '../../../Slices/inventoryModuleSlices/itemCodeSlices';


const defaultProps = {
    checkContent: true,
    onEmpty: () => { },
    onStateChange: () => { }
};


function VerifyBaseCode(props) {
    const { checkContent, onEmpty, onStateChange } = { ...defaultProps, ...props };
    const dispatch = useDispatch();
    const [inboxExpanded, setInboxExpanded] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [verificationMode, setVerificationMode] = useState('single'); // 'single' or 'bulk'
    const [remarks, setRemarks] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const userRoleId = useSelector(state => state.auth.userInfo.roleId);

    const { 
        baseCodesForVerification,
        dcaCodes,
        subDcaCodes,
        loading: {
            baseCodeVerification: isVerificationLoading,
            verifyBaseCode: isVerifyLoading,
            rejectBaseCode: isRejectLoading,
            getDCACodes: dcaLoading,
            getSubDcaCodes: subDCALoading 
        },
        error: {
            baseCodeVerification: verificationError,
            verifyBaseCode: verifyError,
            rejectBaseCode: rejectError,
            getDCACodes: dcaError,
            getSubDcaCodes: subDcaError
        },
        success: {
            verifyBaseCode: verifySuccess,
            rejectBaseCode: rejectSuccess
        }
    } = useSelector(state => state.itemCode);
    
    const hasContent = useMemo(() => baseCodesForVerification?.length > 0, [baseCodesForVerification]);

    useEffect(() => {
        if (userRoleId) {
            
            dispatch(getBaseCodesForVerification({ userRoleId, type: verificationMode }));
            console.log('Fetching base codes for verification', baseCodesForVerification);
        }
    }, [dispatch, userRoleId, verificationMode]);

    const closeDetails = useCallback(() => {
        setSelectedItem(null);
        setRemarks('');
    }, []);

    // Add these to your existing useEffect or create a new one
useEffect(() => {
    if (selectedItem) {
        dispatch(getDCAForItemCode(selectedItem.type));
        if (selectedItem.dcaCode) {
            dispatch(getSubDCAForItemCode(selectedItem.dcaCode));
        }
    }
}, [dispatch, selectedItem]);

   
useEffect(() => {
    if (verifySuccess) {
        showToast('success', 'Base code verified successfully');
        closeDetails();
    }
    if (rejectSuccess) {
        showToast('success', 'Base code rejected successfully');
        closeDetails();
    }
}, [verifySuccess, rejectSuccess, closeDetails]);

  
    const handleVerify = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before verifying');
            return;
        }

        try {
            if (verificationMode === 'bulk') {
                await dispatch(verifyBaseCode({
                    batchId: selectedItem.uploadBatch,
                    remarks
                })).unwrap();
            } else {
                await dispatch(verifyBaseCode({
                    id: selectedItem._id,
                    remarks
                })).unwrap();
            }
            
           
            dispatch(getBaseCodesForVerification({ userRoleId, type: verificationMode }));
        } catch (error) {
            error.message ('error', error.message);
        }
    }, [dispatch, selectedItem, remarks, verificationMode, userRoleId]);

    const handleReject = useCallback(() => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before rejecting');
            return;
        }
        setShowRejectDialog(true);
    }, [remarks]);

    const handleConfirmedReject = useCallback(async () => {
        try {
            if (verificationMode === 'bulk') {
                await dispatch(rejectBaseCode({
                    batchId: selectedItem.uploadBatch,
                    remarks
                })).unwrap();
            } else {
                await dispatch(rejectBaseCode({
                    id: selectedItem._id,
                    remarks
                })).unwrap();
            }
            
            showToast('success', 'Base code rejected successfully');
            closeDetails();
            dispatch(getBaseCodesForVerification({ userRoleId, type: verificationMode }));
        } catch (error) {
            showToast('error', error.message || 'Failed to reject base code');
        }
        setShowRejectDialog(false);
    }, [dispatch, selectedItem, remarks, verificationMode, userRoleId, closeDetails]);

    const renderVerificationTable = () => (
        <div className="overflow-x-auto">
            <div className="mb-4 flex justify-end space-x-2">
                <button
                    onClick={() => setVerificationMode('single')}
                    className={`px-4 py-2 rounded-md ${
                        verificationMode === 'single' 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-gray-100 text-gray-700'
                    }`}
                >
                    Single Entries
                </button>
                <button
                    onClick={() => setVerificationMode('bulk')}
                    className={`px-4 py-2 rounded-md ${
                        verificationMode === 'bulk' 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-gray-100 text-gray-700'
                    }`}
                >
                    Bulk Entries
                </button>
            </div>
            
            <table className="min-w-full">
                <thead className="text-gray-700">
                    <tr>
                        <th className="border px-4 py-2">Action</th>
                        <th className="border px-4 py-2">Base Code</th>
                        <th className="border px-4 py-2">Item Name</th>
                        <th className="border px-4 py-2">Type</th>
                        <th className="border px-4 py-2">Category</th>
                        <th className="border px-4 py-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {baseCodesForVerification?.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                            <td className="border px-4 py-2">
                                <FaRegEdit
                                    className="text-yellow-600 cursor-pointer text-2xl"
                                    onClick={() => {
                                        setSelectedItem(item);
                                        setVerificationMode(item.uploadBatch ? 'bulk' : 'single');
                                    }}
                                />
                            </td>
                            <td className="border px-4 py-2">{item.baseCode}</td>
                            <td className="border px-4 py-2">{item.itemName}</td>
                            <td className="border px-4 py-2">
                                <span className="flex items-center space-x-1">
                                    {item.type === 'MATERIAL' ? 
                                        <FaBoxes className="text-indigo-600" /> : 
                                        <FaTools className="text-green-600" />
                                    }
                                    <span>{item.type}</span>
                                </span>
                            </td>
                            <td className="border px-4 py-2">{item.categoryCode}</td>
                            <td className="border px-4 py-2">
                                <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">
                                    {item.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderDetailsModal = () => {
        if (!selectedItem) return null;
        
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                <div className="relative mx-auto p-6 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
                    <button onClick={closeDetails} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500">
                        <FaTimes className="h-6 w-6" />
                    </button>

                    <div className="mt-4">
                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-t-lg">
                            <div className="flex items-center space-x-4">
                                {selectedItem.type === 'MATERIAL' ? 
                                    <FaBoxes className="h-8 w-8" /> : 
                                    <FaTools className="h-8 w-8" />
                                }
                                <div>
                                    <h3 className="text-2xl font-bold">Base Code Details</h3>
                                    <p className="text-lg opacity-90">
                                        {selectedItem.baseCode} - {selectedItem.itemName}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-indigo-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Type</p>
                                            <p className="text-lg font-semibold text-indigo-700">
                                                {selectedItem.type}
                                            </p>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Category</p>
                                            <p className="text-lg font-semibold text-purple-700">
                                                {selectedItem.categoryCode}
                                            </p>
                                        </div>
                                        <div className="bg-indigo-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Major Group</p>
                                            <p className="text-lg font-semibold text-indigo-700">
                                                {selectedItem.majorGroupCode}
                                            </p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Primary Unit</p>
                                            <p className="text-lg font-semibold text-green-700">
                                                {selectedItem.primaryUnit}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Asset Information</h4>
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Is Asset</p>
                                            <p className="text-lg font-semibold text-gray-700">
                                                {selectedItem.isAsset ? 'Yes' : 'No'}
                                            </p>
                                            {selectedItem.isAsset && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    Asset Category: {selectedItem.assetCategory}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Item Information</h4>
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Base Code</p>
                                            <p className="text-lg font-semibold text-gray-700">
                                                {selectedItem.baseCode}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Material Name</p>
                                            <p className="text-lg font-semibold text-gray-700">
                                                {selectedItem.itemName}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Account Head</h4>
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">DCA Code</p>
                                            <p className="text-lg font-semibold text-gray-700">
                                                {selectedItem.dcaCode} - {dcaCodes?.find(dca => dca.code === selectedItem.dcaCode)?.name}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Sub DCA</p>
                                            <p className="text-lg font-semibold text-gray-700">
                                                {selectedItem.subDcaCode} - {subDcaCodes?.find(subDca => subDca.subDcaCode === selectedItem.subDCaCode)?.subdcaName}
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
                                    signatures={selectedItem.signatureAndRemarks || []}
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
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                onClick={handleVerify}
                                disabled={isVerifyLoading}
                                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {isVerifyLoading ? 'Processing...' : 'Verify'}
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={isRejectLoading}
                                className="px-6 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                                {isRejectLoading ? 'Processing...' : 'Reject'}
                            </button>

                            {verificationMode === 'bulk' && (
                                <div className="mt-4 bg-yellow-50 p-4 rounded-md">
                                    <p className="text-sm text-yellow-700">
                                        <span className="font-medium">Note:</span> This will verify all base codes in the current batch.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Render bulk verification summary if in bulk mode
    const renderBulkSummary = useCallback(() => {
        if (!selectedItem?.uploadBatch) return null;

        const batchItems = baseCodesForVerification.filter(
            item => item.uploadBatch === selectedItem.uploadBatch
        );

        return (
            <div className="mt-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Batch Summary</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-indigo-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Total Items in Batch</p>
                            <p className="text-2xl font-semibold text-indigo-700">
                                {batchItems.length}
                            </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Batch Upload Date</p>
                            <p className="text-lg font-semibold text-green-700">
                                {new Date(selectedItem.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 overflow-auto max-h-60">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Base Code
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Item Name
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Type
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {batchItems.map((item) => (
                                    <tr key={item._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                            {item.baseCode}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                            {item.itemName}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                            <span className="flex items-center space-x-1">
                                                {item.type === 'MATERIAL' ? 
                                                    <FaBoxes className="text-indigo-600" /> : 
                                                    <FaTools className="text-green-600" />
                                                }
                                                <span>{item.type}</span>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }, [selectedItem, baseCodesForVerification]);

    if (isVerificationLoading && !baseCodesForVerification?.length) {
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
                    <div 
                        className="px-2 py-2 rounded-full bg-slate-300 cursor-pointer" 
                        onClick={() => setInboxExpanded(!inboxExpanded)}
                    >
                        <FaChevronDown className={`text-gray-600 font-bold ${inboxExpanded ? 'rotate-180 duration-300' : ''}`} />
                    </div>
                    <div>
                        <h3 className="text-gray-600 font-bold">Base Code Verification</h3>
                    </div>
                    <div className="font-bold text-red-500">({baseCodesForVerification?.length || 0})</div>
                </div>

                <div className={`transition-max-height duration-500 ease-in-out overflow-hidden ${inboxExpanded ? 'max-h-screen' : 'max-h-0'}`}>
                    {inboxExpanded && (
                        <div className="p-4 bg-white">
                            {renderVerificationTable()}
                        </div>
                    )}
                </div>

                {/* Details Modal */}
                {selectedItem && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                        <div className="relative mx-auto p-6 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
                            {renderDetailsModal()}
                            {verificationMode === 'bulk' && renderBulkSummary()}
                        </div>
                    </div>
                )}

                {/* Reject Confirmation Dialog */}
                <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Confirm Base Code Rejection
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to reject {verificationMode === 'bulk' ? 'this batch of base codes' : `base code ${selectedItem?.baseCode}`}? 
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleConfirmedReject}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                Yes, Reject {verificationMode === 'bulk' ? 'Batch' : 'Base Code'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    );
};

export default React.memo(VerifyBaseCode);