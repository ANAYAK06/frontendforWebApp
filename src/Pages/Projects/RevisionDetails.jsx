// components/BOQRevision/RevisionDetail.jsx

import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaArrowLeft, FaCheck, FaPencilAlt, FaFilePdf, FaFileAlt } from 'react-icons/fa';
import { updateBOQRatesThunk} from '../../Slices/boqRevisionSlices'; 
import { showToast } from '../../utilities/toastUtilities';
import SignatureAndRemarks from '../../Components/SignatureAndRemarks';

const RevisionDetail = ({ boq, onBack }) => {
    const dispatch = useDispatch();
    const [editableItems, setEditableItems] = useState({});
    const [modifiedBOQ, setModifiedBOQ] = useState(null);
    const [remarks, setRemarks] = useState('');

    const { loading, error, updateSuccess } = useSelector(state => state.boqRevision);


    useEffect(() => {
        if (updateSuccess) {
            onBack();
        }
    }, [updateSuccess, onBack]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateAmount = (qty, unitRate) => {
        return qty * unitRate;
    };

    const handleEditClick = (itemId) => {
        setEditableItems(prev => ({
            ...prev,
            [itemId]: true
        }));
    };

    const handleSubmit = async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before submitting revision');
            return;
        }

        if (!modifiedBOQ) {
            showToast('error', 'No changes have been made to the BOQ');
            return;
        }

        try {
            const currentItems = modifiedBOQ.items;

            // Validate items before submission
            const invalidItems = currentItems.filter(item => 
                !item.unitRate || 
                item.unitRate <= 0 || 
                !item.amount || 
                item.amount <= 0
            );

            if (invalidItems.length > 0) {
                showToast('error', 'All items must have valid rates and amounts');
                return;
            }

            const updateData = {
                items: currentItems.map(item => ({
                    _id: item._id,
                    unitRate: Number(item.unitRate),
                    amount: Number(item.amount)
                })),
                remarks: remarks.trim(),
                totalAmount: Number(modifiedBOQ.totalAmount)
            };

            await dispatch(updateBOQRatesThunk({
                id: boq._id,
                updateData
            })).unwrap();

            showToast('success', 'BOQ rates updated successfully');
            onBack();
        } catch (error) {
            console.error('Error updating BOQ rates:', error);
            showToast('error', error.message || 'Failed to update BOQ rates');
        }
    };

    const handleUnitRateChange = (itemId, newRate) => {
        const numericRate = parseFloat(newRate);
        if (isNaN(numericRate) || numericRate < 0) return;

        const updatedItems = modifiedBOQ ? modifiedBOQ.items : boq.items;
        const newItems = updatedItems.map(item => {
            if (item._id === itemId) {
                const newAmount = calculateAmount(item.qty, numericRate);
                const isValidRate = numericRate > 0;
                
                return {
                    ...item,
                    unitRate: numericRate,
                    amount: isValidRate ? newAmount : 0,
                    isRateValid: isValidRate
                };
            }
            return item;
        });

        const newTotal = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);

        setModifiedBOQ({
            ...boq,
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

    const openPDF = useCallback((filePath) => {
        window.open(`http://localhost:4000/${filePath}`, '_blank', 'noopener,noreferrer');
    }, []);

    const getRateColor = (unitRate, minRate) => {
        if (!unitRate || !minRate) return '';
        if (unitRate > minRate) return 'text-green-500';
        if (unitRate < minRate) return 'text-red-500';
        return 'text-orange-500';
    };

    const isSubmitDisabled = () => {
        if (!modifiedBOQ || !remarks.trim()) return true;
        
        return modifiedBOQ.items.some(item => 
            !item.unitRate || 
            item.unitRate <= 0 || 
            !item.amount || 
            item.amount <= 0
        );
    };



  

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                >
                    <FaArrowLeft className="mr-2" />
                    Back to List
                </button>
                <h2 className="text-2xl font-bold text-gray-900">BOQ Revision</h2>
            </div>

            {/* BOQ Header Info */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-t-lg">
                <div className="flex items-center space-x-4">
                    <FaFileAlt className="h-8 w-8" />
                    <div>
                        <h3 className="text-2xl font-bold">BOQ #{boq.offerNumber}</h3>
                        <p className="text-lg opacity-90">{boq.businessOpportunity?.client?.name}</p>
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
                            {boq.businessOpportunity?.opportunityNumber}
                        </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Business Category</p>
                        <p className="text-lg font-semibold text-purple-700">
                            {boq.businessOpportunity?.businessCategory}
                        </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-lg font-semibold text-blue-700">
                            {formatCurrency(boq.totalAmount)}
                        </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Created Date</p>
                        <p className="text-lg font-semibold text-green-700">
                            {formatDate(boq.createdAt)}
                        </p>
                    </div>
                </div>
            </div>

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
                                <th className="px-4 py-2 border">Existing Unit Rate</th>
                                <th className="px-4 py-2 border">Revised Unit Rate</th>
                                <th className="px-4 py-2 border">Amount</th>
                                <th className="px-4 py-2 border">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(modifiedBOQ || boq).items.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 border">{item.slNo}</td>
                                    <td className="px-4 py-2 border">{item.description}</td>
                                    <td className="px-4 py-2 border">{item.unit}</td>
                                    <td className="px-4 py-2 border">{item.qty}</td>
                                    <td className="px-4 py-2 border">{formatCurrency(item.minimumRate)}</td>
                                    <td className="px-4 py-2 border">{formatCurrency(item.unitRate)} </td>
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
                                        {item.attachmentRequired && item.attachment && (
                                            <button
                                                onClick={() => openPDF(item.attachment.filePath)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <FaFilePdf className="text-xl text-red-500" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-gray-100 font-semibold">
                                <td colSpan="6" className="px-4 py-2 border text-right">Total Amount:</td>
                                <td colSpan="2" className="px-4 py-2 border">
                                    {formatCurrency((modifiedBOQ || boq).totalAmount)}
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
                    {boq.attachments.map((attachment) => (
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
                    signatures={boq.signatureAndRemarks || []}
                />
                <div className="mt-4">
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
                        Revision Remarks
                    </label>
                    <textarea
                        id="remarks"
                        rows="3"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Enter your remarks for this revision"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled()}
                    className={`px-6 py-2 rounded-md font-medium ${
                        isSubmitDisabled()
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                    } text-white`}
                >
                    Submit Revision
                </button>
            </div>
        </div>
    );
};

export default RevisionDetail;