import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FaChevronDown, FaRegEdit, FaTimes, FaBoxes, FaTools, FaInfoCircle } from "react-icons/fa";
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
import {
    getSpecificationsForVerification,
    verifySpecification,
    rejectSpecification
} from '../../../Slices/inventoryModuleSlices/itemCodeSlices';

const defaultProps = {
    checkContent: true,
    onEmpty: () => { },
    onStateChange: () => { }
};

function VerifySpecification(props) {
    const { checkContent, onEmpty, onStateChange } = { ...defaultProps, ...props };
    const dispatch = useDispatch();
    const [inboxExpanded, setInboxExpanded] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [verificationMode, setVerificationMode] = useState('single'); // 'single' or 'bulk'
    const [remarks, setRemarks] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const userRoleId = useSelector(state => state.auth.userInfo.roleId);

    const {
        specificationsForVerification,
        loading: {
            specificationVerification: isVerificationLoading,
            verifySpecification: isVerifyLoading,
            rejectSpecification: isRejectLoading
        },
        error: {
            specificationVerification: verificationError,
            verifySpecification: verifyError,
            rejectSpecification: rejectError
        },
        success: {
            verifySpecification: verifySuccess,
            rejectSpecification: rejectSuccess
        }
    } = useSelector(state => state.itemCode);

    const hasContent = useMemo(() => 
        specificationsForVerification?.length > 0, 
        [specificationsForVerification]
    );

    useEffect(() => {
        if (userRoleId) {
            dispatch(getSpecificationsForVerification({ userRoleId, type: verificationMode }));
           
        }
    }, [dispatch, userRoleId, verificationMode]);

    const closeDetails = useCallback(() => {
        setSelectedItem(null);
        setRemarks('');
    }, []);

    useEffect(() => {
        
        if (verifySuccess && selectedItem ) {
            showToast('success', 'Specification verified successfully');
            closeDetails();
            dispatch(getSpecificationsForVerification({ userRoleId, type: verificationMode }));
        }
        if (rejectSuccess) {
            showToast('success', 'Specification rejected successfully');
            closeDetails();
            dispatch(getSpecificationsForVerification({ userRoleId, type: verificationMode }));
        }
    }, [verifySuccess, rejectSuccess, closeDetails, dispatch, userRoleId, verificationMode, selectedItem]);

    useEffect(() => {
        if (verifyError) {
            showToast('error', verifyError);
        }
        if (rejectError) {
            showToast('error', rejectError);
        }
    }, [verifyError, rejectError]);

    const handleVerify = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before verifying');
            return;
        }

        try {
            if (verificationMode === 'bulk') {
                const specificationsToVerify = specificationsForVerification
                    .filter(spec => spec.baseCode === selectedItem.baseCode)
                    .map(spec => ({
                        itemCodeId: spec.itemCodeId,
                        specificationId: spec.specification._id
                    }));

                await dispatch(verifySpecification({
                    bulk: true,
                    specifications: specificationsToVerify,
                    remarks
                })).unwrap();
            } else {
                await dispatch(verifySpecification({
                    itemCodeId: selectedItem.itemCodeId,
                    specificationId: selectedItem.specification._id,
                    remarks
                })).unwrap();
            }
        } catch (error) {
            console.error('Verification failed:', error);
        }
    }, [dispatch, selectedItem, remarks, verificationMode, specificationsForVerification]);

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
                const specificationsToReject = specificationsForVerification
                    .filter(spec => spec.baseCode === selectedItem.baseCode)
                    .map(spec => ({
                        itemCodeId: spec.itemCodeId,
                        specificationId: spec.specification._id
                    }));

                await dispatch(rejectSpecification({
                    bulk: true,
                    specifications: specificationsToReject,
                    remarks
                })).unwrap();
            } else {
                await dispatch(rejectSpecification({
                    itemCodeId: selectedItem.itemCodeId,
                    specificationId: selectedItem.specification._id,
                    remarks
                })).unwrap();
            }
        } catch (error) {
            console.error('Rejection failed:', error);
        }
        setShowRejectDialog(false);
    }, [dispatch, selectedItem, remarks, verificationMode, specificationsForVerification]);

    // Helper to organize data for bulk/single view
    const organizeSpecificationData = useCallback((specifications) => {
        // Group items by baseCode for bulk operations
        const groupedByBaseCode = specifications.reduce((acc, spec) => {
            const { baseCode } = spec;
            if (!acc[baseCode]) {
                acc[baseCode] = [];
            }
            acc[baseCode].push(spec);
            return acc;
        }, {});

        // Convert to array format
        const bulkEntries = Object.entries(groupedByBaseCode).map(([baseCode, items]) => ({
            baseCode,
            itemName: items[0].itemName, // All items in a group have same itemName
            specifications: items.map(item => item.specification),
            count: items.length
        }));

        return {
            bulkEntries,
            singleEntries: specifications
        };
    }, []);

    const renderVerificationTable = useCallback(() => {
        const { bulkEntries, singleEntries } = organizeSpecificationData(specificationsForVerification || []);

        return (
            <div className="space-y-6">
                {/* Mode Selection */}
                <div className="mb-4 flex justify-end space-x-2">
                    <button
                        onClick={() => setVerificationMode('single')}
                        className={`px-4 py-2 rounded-md ${
                            verificationMode === 'single'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        Single Entries ({singleEntries.length})
                    </button>
                    <button
                        onClick={() => setVerificationMode('bulk')}
                        className={`px-4 py-2 rounded-md ${
                            verificationMode === 'bulk'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        Bulk by Base Code ({bulkEntries.length})
                    </button>
                </div>

                {verificationMode === 'single' ? (
                    // Single Entries Table
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2">Action</th>
                                <th className="px-4 py-2">Base Code</th>
                                <th className="px-4 py-2">Item Name</th>
                                <th className="px-4 py-2">Full Code</th>
                                <th className="px-4 py-2">Make</th>
                                <th className="px-4 py-2">Specification</th>
                                <th className="px-4 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {singleEntries.map((item) => (
                                <tr key={item.specification._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2">
                                        <FaRegEdit
                                            className="text-yellow-600 cursor-pointer"
                                            onClick={() => {
                                                setSelectedItem(item);
                                                setVerificationMode('single');
                                            }}
                                        />
                                    </td>
                                    <td className="px-4 py-2">{item.baseCode}</td>
                                    <td className="px-4 py-2">{item.itemName}</td>
                                    <td className="px-4 py-2">{item.specification.fullCode}</td>
                                    <td className="px-4 py-2">{item.specification.make}</td>
                                    <td className="px-4 py-2">
                                        {item.specification.specification || "N/A"}
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                                            {item.specification.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    // Bulk Entries Cards
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bulkEntries.map((group) => (
                            <div key={group.baseCode}
                                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => {
                                    const firstItem = specificationsForVerification.find(
                                        spec => spec.baseCode === group.baseCode
                                    );
                                    setSelectedItem(firstItem);
                                    setVerificationMode('bulk');
                                }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">{group.baseCode}</h3>
                                        <p className="text-sm text-gray-500">{group.itemName}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                                        {group.count} specifications
                                    </span>
                                </div>

                                <div className="mt-2">
                                    <p className="text-sm font-medium text-gray-700">Makes:</p>
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        {group.specifications.slice(0, 3).map((spec, index) => (
                                            <span key={index} className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                                                {spec.make}
                                            </span>
                                        ))}
                                        {group.specifications.length > 3 && (
                                            <span className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                                                +{group.specifications.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex items-center text-sm text-indigo-600">
                                        <FaInfoCircle className="mr-1" />
                                        Click to view and verify all specifications
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }, [specificationsForVerification, verificationMode, organizeSpecificationData]);

    const renderSingleDetailsModal = () => {
        if (!selectedItem) return null;
        const spec = selectedItem.specification;

        return (
            <div className="mt-4">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-t-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <FaTools className="h-8 w-8" />
                            <div>
                                <h3 className="text-2xl font-bold">Specification Details</h3>
                                <p className="text-lg opacity-90">
                                    {spec.fullCode} - {selectedItem.itemName}
                                </p>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-white bg-opacity-20 rounded-md">
                            {spec.make}
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
                                    <p className="text-sm text-gray-600">Item Name</p>
                                    <p className="text-lg font-semibold text-indigo-700">
                                        {selectedItem.itemName}
                                    </p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Full Code</p>
                                    <p className="text-lg font-semibold text-purple-700">
                                        {spec.fullCode}
                                    </p>
                                </div>
                                <div className="bg-indigo-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Make</p>
                                    <p className="text-lg font-semibold text-indigo-700">
                                        {spec.make}
                                    </p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Base Code</p>
                                    <p className="text-lg font-semibold text-green-700">
                                        {spec.baseCode}
                                    </p>
                                </div>
                            </div>

                            {spec.specification && (
                                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Technical Specification</p>
                                    <p className="text-md font-medium text-gray-700 mt-1">
                                        {spec.specification}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Pricing & Units</h4>
                            <div className="space-y-4">
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Standard Price</p>
                                    <p className="text-xl font-semibold text-yellow-700">
                                        ₹{spec.standardPrice.toLocaleString('en-IN')}
                                    </p>
                                </div>
                                <div className="bg-indigo-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Primary Unit</p>
                                    <p className="text-lg font-semibold text-indigo-700">
                                        {spec.primaryUnit?.symbol || spec.primaryUnit}-{spec.primaryUnit?.name}
                                    </p>
                                </div>

                                {spec.allowedUnits && spec.allowedUnits.length > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-2">Allowed Units</p>
                                        <div className="flex flex-wrap gap-2">
                                            {spec.allowedUnits.map((unitData, index) => (
                                                <span
                                                    key={index}
                                                    className={`px-2 py-1 text-xs rounded-md ${
                                                        unitData.isDefault 
                                                            ? 'bg-indigo-100 text-indigo-700' 
                                                            : 'bg-gray-200 text-gray-700'
                                                    }`}
                                                >
                                                   {unitData.unit?.name}- ({unitData.unit?.symbol || unitData.unit})
                                                    {unitData.isDefault && ' (Default)'}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {spec.priceReferences && spec.priceReferences.length > 0 && (
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Price References</h4>
                                <div className="space-y-3">
                                    {spec.priceReferences.map((ref, index) => (
                                        <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
                                            <div className="flex justify-between">
                                                <p className="font-medium">{ref.partyName}</p>
                                                <p className="font-semibold text-indigo-600">₹{ref.price.toLocaleString('en-IN')}</p>
                                            </div>
                                            <div className="mt-1 text-sm text-gray-600">
                                                <p>{ref.email} | {ref.phone}</p>
                                                {ref.websiteUrl && <p className="mt-1">{ref.websiteUrl}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Signatures and Remarks Section */}
                <div className="mt-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <SignatureAndRemarks
                            signatures={selectedItem.specification.signatureAndRemarks || []}
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
                </div>
            </div>
        );
    };

    const renderBulkDetailsModal = () => {
        if (!selectedItem) return null;

        // Get all specifications for the selected base code
        const batchSpecifications = specificationsForVerification.filter(
            item => item.baseCode === selectedItem.baseCode
        );

        return (
            <div className="mt-4">
                {/* Batch Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-t-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold">
                                Specifications for {selectedItem.baseCode}
                            </h3>
                            <p className="text-lg opacity-90">{selectedItem.itemName}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold">{batchSpecifications.length}</p>
                            <p className="text-sm opacity-90">Specifications</p>
                        </div>
                    </div>
                </div>

                {/* Specifications Table */}
                <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Make</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specification</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Unit</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Standard Price</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {batchSpecifications.map((item) => (
                                    <tr key={item.specification._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap font-medium">{item.specification.fullCode}</td>
                                        <td className="px-4 py-3">{item.specification.make}</td>
                                        <td className="px-4 py-3">{item.specification.specification || "N/A"}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {item.specification.primaryUnit?.symbol || item.specification.primaryUnit}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            ₹{item.specification.standardPrice.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                                                {item.specification.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Remarks Section */}
                <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                    <SignatureAndRemarks
                        signatures={selectedItem.specification.signatureAndRemarks || []}
                    />
                    <div className="mt-4">
                        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
                            Verification Remarks
                        </label>
                        <textarea
                            id="remarks"
                            rows="3"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Enter verification remarks for all specifications..."
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={handleVerify}
                        disabled={isVerifyLoading}
                        className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {isVerifyLoading ? 'Processing...' : 'Verify All Specifications'}
                    </button>
                    <button
                        onClick={handleReject}
                        disabled={isRejectLoading}
                        className="px-6 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                        {isRejectLoading ? 'Processing...' : 'Reject All Specifications'}
                    </button>
                </div>

                <div className="mt-4 bg-yellow-50 p-4 rounded-md">
                    <p className="text-sm text-yellow-700">
                        <span className="font-medium">Note:</span> This will process all specifications for the base code at once.
                    </p>
                </div>
            </div>
        );
    };

    const renderDetailsModal = () => {
        if (!selectedItem) return null;

        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                <div className="relative mx-auto p-6 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
                    <button onClick={closeDetails} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500">
                        <FaTimes className="h-6 w-6" />
                    </button>
                    {verificationMode === 'bulk' ? renderBulkDetailsModal() : renderSingleDetailsModal()}
                </div>
            </div>
        );
    };

    if (isVerificationLoading && !specificationsForVerification?.length) {
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
                        <h3 className="text-gray-600 font-bold">Specification Verification</h3>
                    </div>
                    <div className="font-bold text-red-500">({specificationsForVerification?.length || 0})</div>
                </div>

                <div className={`transition-max-height duration-500 ease-in-out overflow-hidden ${inboxExpanded ? 'max-h-screen' : 'max-h-0'}`}>
                    {inboxExpanded && (
                        <div className="p-4 bg-white">
                            {renderVerificationTable()}
                        </div>
                    )}
                </div>

                {/* Details Modal */}
                {selectedItem && renderDetailsModal()}

                {/* Reject Confirmation Dialog */}
                <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Confirm Specification Rejection
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to reject {verificationMode === 'bulk' ? 'all specifications' : `specification ${selectedItem?.specification?.fullCode}`}? 
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
                                Yes, Reject {verificationMode === 'bulk' ? 'All Specifications' : 'Specification'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>              
        </>             
    );
}       

export default React.memo(VerifySpecification);