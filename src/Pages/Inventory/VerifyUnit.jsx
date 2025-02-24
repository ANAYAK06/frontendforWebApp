import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FaChevronDown, FaRegEdit, FaTimes, FaCube } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import SignatureAndRemarks from '../../Components/SignatureAndRemarks';
import {
    getUnitsForVerificationThunk,
    verifyUnitThunk,
    verifyBatchUnitsThunk,
    rejectUnitThunk,
    rejectBatchUnitsThunk,
    clearOperationState
} from '../../Slices/inventoryModuleSlices/itemCodeUnitSlices';

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

function VerifyUnit(props) {
    const { checkContent, onEmpty, onStateChange } = { ...defaultProps, ...props };

    const dispatch = useDispatch();
    const { unitsForVerification,
        loading: {
            verification: isVerificationLoading,
            verify: isVerifying,
            reject: isRejecting
        },
        errors: {
            verification: verificationError,
            verify: verifyError,
            reject: rejectError
        },
        success: {
            verify: verifySuccess,
            reject: rejectSuccess
        }
    } = useSelector(state => state.unit);
    const userRoleId = useSelector(state => state.auth.userInfo.roleId);
    const [inboxExpanded, setInboxExpanded] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    const hasContent = useMemo(() => unitsForVerification?.length > 0, [unitsForVerification]);

    // Group units by batch for bulk verification
    const groupedUnits = useMemo(() => {
        if (!unitsForVerification) return [];

        const grouped = unitsForVerification.reduce((acc, unit) => {
            if (unit.creationType === 'BULK') {
                const batchGroup = acc.find(g => g.batchId === unit.batchId);
                if (batchGroup) {
                    batchGroup.units.push(unit);
                } else {
                    acc.push({
                        batchId: unit.batchId,
                        creationType: 'BULK',
                        createdAt: unit.createdAt,
                        units: [unit]
                    });
                }
            } else {
                acc.push(unit);
            }
            return acc;
        }, []);

        return grouped;
    }, [unitsForVerification]);

    useEffect(() => {
        // Clear states on mount
        dispatch(clearOperationState('verify'));
        dispatch(clearOperationState('reject'));

        return () => {
            // Cleanup on unmount
            dispatch(clearOperationState('verify'));
            dispatch(clearOperationState('reject'));
        };
    }, [dispatch]);



    useEffect(() => {
        if (userRoleId) {
            dispatch(getUnitsForVerificationThunk(userRoleId));

        }
    }, [dispatch, userRoleId]);

    useEffect(() => {
        onStateChange(hasContent);
    }, [hasContent, onStateChange]);

    useEffect(() => {
        if (verifyError) {
            showToast('error', verifyError);
        }
        if (rejectError) {
            showToast('error', rejectError);
        }
    }, [verifyError, rejectError]);

    const closeUnitDetails = useCallback(() => {
        setSelectedUnit(null);
        setRemarks('');
        dispatch(clearOperationState('verify'));
        dispatch(clearOperationState('reject'));
    }, [dispatch]);

    useEffect(() => {
        if (verifySuccess) {
            showToast('success', 'Unit verified successfully');
            closeUnitDetails();
            dispatch(getUnitsForVerificationThunk(userRoleId));
            dispatch(clearOperationState('verify'));
        }
        if (rejectSuccess) {
            showToast('success', 'Unit rejected successfully');
            closeUnitDetails();
            dispatch(getUnitsForVerificationThunk(userRoleId));
            dispatch(clearOperationState('reject'));
        }
    }, [verifySuccess, rejectSuccess, dispatch, userRoleId, closeUnitDetails]);

    const openUnitDetails = useCallback((unit) => {
        setSelectedUnit(unit);
    }, []);


    const handleVerify = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before verifying');
            return;
        }

        try {
            if (selectedUnit.creationType === 'BULK') {
                await dispatch(verifyBatchUnitsThunk({
                    batchId: selectedUnit.batchId,
                    remarks: remarks
                })).unwrap();
            } else {
                await dispatch(verifyUnitThunk({
                    id: selectedUnit._id,
                    remarks: remarks
                })).unwrap();
            }
        } catch (error) {
            showToast('error', error?.message || 'Failed to verify unit');
            dispatch(clearOperationState('verify'));
        }
    }, [dispatch, selectedUnit, remarks]);

    const handleReject = useCallback(() => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before rejecting');
            return;
        }
        setShowRejectDialog(true);
    }, [remarks]);

    const handleConfirmedReject = useCallback(async () => {
        try {

            console.log('Rejecting unit:', selectedUnit);
            console.log('Remarks:', remarks);
            if (selectedUnit.creationType === 'BULK') {
                await dispatch(rejectBatchUnitsThunk({
                    batchId: selectedUnit.batchId,
                    remarks: remarks
                })).unwrap();
            } else {
                console.log('Attempting single unit rejection');
                await dispatch(rejectUnitThunk({
                    id: selectedUnit._id,
                    remarks: remarks
                })).unwrap();
            }
        } catch (error) {
            showToast('error', error?.message || 'Failed to reject unit');
            dispatch(clearOperationState('reject'));
        } finally {
            setShowRejectDialog(false);
        }
    }, [dispatch, selectedUnit, remarks]);

    if (isVerificationLoading && !unitsForVerification?.length) {
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
                    <div><h3 className="text-gray-600 font-bold">Unit Verification</h3></div>
                    <div className="font-bold text-red-500">({unitsForVerification?.length || 0})</div>
                </div>

                <div className={`transition-max-height duration-500 ease-in-out overflow-hidden ${inboxExpanded ? 'max-h-screen' : 'max-h-0'}`}>
                    {inboxExpanded && (
                        <div className="p-4 bg-white">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="text-gray-700">
                                        <tr>
                                            <th className="border px-4 py-2">Action</th>
                                            <th className="border px-4 py-2">Creation Type</th>
                                            <th className="border px-4 py-2">Name</th>
                                            <th className="border px-4 py-2">Symbol</th>
                                            <th className="border px-4 py-2">Type</th>
                                            <th className="border px-4 py-2">Base Unit</th>
                                            <th className="border px-4 py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groupedUnits.map((item) => {
                                            if (item.creationType === 'BULK') {
                                                // Render bulk unit group
                                                return (
                                                    <tr key={item.batchId} className="hover:bg-gray-50">
                                                        <td className="border px-4 py-2">
                                                            <FaRegEdit
                                                                className="text-yellow-600 cursor-pointer text-2xl"
                                                                onClick={() => openUnitDetails(item)}
                                                            />
                                                        </td>
                                                        <td className="border px-4 py-2">
                                                            <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs">
                                                                Bulk Upload
                                                            </span>
                                                        </td>
                                                        <td className="border px-4 py-2" colSpan="4">
                                                            Batch Upload ({item.units.length} units)
                                                        </td>
                                                        <td className="border px-4 py-2">
                                                            <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">
                                                                Verification
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            } else {
                                                // Render single unit
                                                return (
                                                    <tr key={item._id} className="hover:bg-gray-50">
                                                        <td className="border px-4 py-2">
                                                            <FaRegEdit
                                                                className="text-yellow-600 cursor-pointer text-2xl"
                                                                onClick={() => openUnitDetails(item)}
                                                            />
                                                        </td>
                                                        <td className="border px-4 py-2">
                                                            <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs">
                                                                Single
                                                            </span>
                                                        </td>
                                                        <td className="border px-4 py-2">{item.name}</td>
                                                        <td className="border px-4 py-2">{item.symbol}</td>
                                                        <td className="border px-4 py-2">{item.type}</td>
                                                        <td className="border px-4 py-2">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${item.baseUnit
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {item.baseUnit ? 'Yes' : 'No'}
                                                            </span>
                                                        </td>
                                                        <td className="border px-4 py-2">
                                                            <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Unit Details Modal */}
            {selectedUnit && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="relative mx-auto p-6 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
                        <button onClick={closeUnitDetails} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500">
                            <FaTimes className="h-6 w-6" />
                        </button>

                        <div className="mt-4">
                            {/* Header Section */}
                            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-4 rounded-t-lg">
                                <div className="flex items-center space-x-4">
                                    <FaCube className="h-8 w-8" />
                                    <div>
                                        <h3 className="text-2xl font-bold">
                                            {selectedUnit.creationType === 'BULK' ? 'Bulk Units Verification' : 'Unit Verification'}
                                        </h3>
                                        {selectedUnit.creationType === 'BULK' ? (
                                            <p className="text-lg opacity-90">Batch ID: {selectedUnit.batchId}</p>
                                        ) : (
                                            <p className="text-lg opacity-90">Symbol: {selectedUnit.symbol}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Unit Details */}
                            {selectedUnit.creationType === 'BULK' ? (
                                // Bulk Units View
                                <div className="mt-6">
                                    <div className="bg-white p-6 rounded-lg shadow-md">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Batch Units</h4>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead>
                                                    <tr>
                                                        <th className="px-4 py-2 border">Name</th>
                                                        <th className="px-4 py-2 border">Symbol</th>
                                                        <th className="px-4 py-2 border">Type</th>
                                                        <th className="px-4 py-2 border">Base Unit</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedUnit.units.map((unit) => (
                                                        <tr key={unit._id}>
                                                            <td className="px-4 py-2 border">{unit.name}</td>
                                                            <td className="px-4 py-2 border">{unit.symbol}</td>
                                                            <td className="px-4 py-2 border">{unit.type}</td>
                                                            <td className="px-4 py-2 border text-center">
                                                                <span className={`px-2 py-1 rounded-full text-xs ${unit.baseUnit
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                    {unit.baseUnit ? 'Yes' : 'No'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Single Unit View
                                // Single Unit View
                                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Basic Details */}
                                    <div className="bg-white p-6 rounded-lg shadow-md">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Basic Details</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-purple-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">Name</p>
                                                <p className="text-lg font-semibold text-purple-700">{selectedUnit.name}</p>
                                            </div>
                                            <div className="bg-indigo-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">Symbol</p>
                                                <p className="text-lg font-semibold text-indigo-700">{selectedUnit.symbol}</p>
                                            </div>
                                            <div className="bg-indigo-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">Type</p>
                                                <p className="text-lg font-semibold text-indigo-700">{selectedUnit.type}</p>
                                            </div>
                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">Base Unit</p>
                                                <p className="text-lg font-semibold text-green-700">
                                                    {selectedUnit.baseUnit ? 'Yes' : 'No'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Applicable Types and Categories */}
                                    <div className="bg-white p-6 rounded-lg shadow-md">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Application Details</h4>
                                        <div className="space-y-4">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">Applicable Types</p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {selectedUnit.applicableTypes.map((type, index) => (
                                                        <span key={index} className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm">
                                                            {type}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            {selectedUnit.serviceCategory && selectedUnit.serviceCategory.length > 0 && (
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Service Categories</p>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {selectedUnit.serviceCategory.map((category, index) => (
                                                            <span key={index} className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm">
                                                                {category}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Conversions */}
                                    {selectedUnit.conversions && selectedUnit.conversions.length > 0 && (
                                        <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Unit Conversions</h4>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full">
                                                    <thead>
                                                        <tr>
                                                            <th className="px-4 py-2 border">To Unit</th>
                                                            <th className="px-4 py-2 border">Conversion Factor</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedUnit.conversions.map((conversion, index) => (
                                                            <tr key={index}>
                                                                <td className="px-4 py-2 border">{conversion.toUnitSymbol}</td>
                                                                <td className="px-4 py-2 border">{conversion.factor}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Signatures and Remarks Section */}
                            <div className="mt-6">
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <SignatureAndRemarks
                                        signatures={selectedUnit.signatureAndRemarks || []}
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
                                    disabled={isVerifying}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-base font-medium rounded-md shadow-sm hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {isVerifying ? 'Processing...' : 'Verify'}
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={isRejecting}
                                    className="px-6 py-2 bg-red-100 text-red-700 text-base font-medium rounded-md shadow-sm hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                >
                                    {isRejecting ? 'Processing...' : 'Reject'}
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
                            Confirm Rejection
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-gray-600">
                            {selectedUnit?.creationType === 'BULK'
                                ? `Are you sure you want to reject all units in batch ${selectedUnit.batchId}?`
                                : `Are you sure you want to reject unit ${selectedUnit?.symbol}?`
                            } This action cannot be undone.
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
                            {selectedUnit?.creationType === 'BULK'
                                ? 'Yes, Reject All Units'
                                : 'Yes, Reject Unit'
                            }
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default React.memo(VerifyUnit);