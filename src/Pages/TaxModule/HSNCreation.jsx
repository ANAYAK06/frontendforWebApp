import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from '../../Components/Card';
import { createHSNCodeThunk, resetHSNState } from '../../Slices/taxModuleSlices/hsnSacCodeSlices';
import { showToast } from '../../utilities/toastUtilities';
import CustomDatePicker from '../../Components/CustomDatePicker';
import { FaPercentage, FaBarcode, FaInfo, FaTag } from "react-icons/fa";

const HSNCreation = () => {
    const dispatch = useDispatch();
    const { loading, error, createSuccess } = useSelector((state) => state.hsnsac);

    const initialFormState = useMemo(() => ({
        code: '',
        type: 'HSN',
        description: '',
        shortDescription: '',
        category: '',
        applicableType: 'MATERIAL',
        taxRateHistory: {
            cgst: '',
            sgst: '',
            igst: '',
            effectiveFrom: new Date()
        },
        remarks: ''
    }), []);

    const [formData, setFormData] = useState(initialFormState);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [touchedFields, setTouchedFields] = useState({
        code: false
    });

    const handleReset = useCallback(() => {
        if (isFormDirty && window.confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
            setFormData(initialFormState);
            setIsFormDirty(false);
            setTouchedFields({ code: false });
            dispatch(resetHSNState());
            showToast('info', 'Form has been reset');
        }
    }, [initialFormState, isFormDirty, dispatch]);

    useEffect(() => {
        if (createSuccess) {
            showToast('success', 'HSN/SAC Code created successfully');
            setFormData(initialFormState);
            setIsFormDirty(false);
            setTouchedFields({ code: false });
            dispatch(resetHSNState());
        }
    }, [createSuccess, dispatch, initialFormState]);

    useEffect(() => {
        if (error) {
            showToast('error', error.message || 'An error occurred while creating the HSN code');
            dispatch(resetHSNState());
        }
    }, [error, dispatch]);

    const validateForm = useCallback(() => {
        const requiredFields = ['code', 'type', 'description', 'category', 'applicableType'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            showToast('error', `Please fill all required fields: ${missingFields.join(', ')}`);
            return false;
        }

        const { cgst, sgst, igst } = formData.taxRateHistory;
        if (!cgst || !sgst || !igst || 
            parseFloat(cgst) < 0 || parseFloat(sgst) < 0 || parseFloat(igst) < 0 ||
            parseFloat(cgst) > 100 || parseFloat(sgst) > 100 || parseFloat(igst) > 100) {
            showToast('error', 'Please enter valid tax rates (0-100)');
            return false;
        }

        if (parseFloat(cgst) + parseFloat(sgst) !== parseFloat(igst)) {
            showToast('error', 'IGST should equal CGST + SGST');
            return false;
        }

        return true;
    }, [formData]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                await dispatch(createHSNCodeThunk(formData)).unwrap();
            } catch (err) {
                showToast('error', err.message || 'Failed to create HSN code');
            }
        }
    }, [dispatch, formData, validateForm]);

    const handleChange = useCallback((e) => {
        const { name, value, type } = e.target;
        setIsFormDirty(true);

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'number' ? parseFloat(value) || 0 : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    }, []);

    const handleDateChange = useCallback((date) => {
        setIsFormDirty(true);
        setFormData(prev => ({
            ...prev,
            taxRateHistory: {
                ...prev.taxRateHistory,
                effectiveFrom: date
            }
        }));
    }, []);

    return (
        <div className="container mx-auto p-4 py-8 bg-white rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Create HSN/SAC Code</h2>
    
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    HSN/SAC Code <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                        <FaBarcode className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2 border rounded-md"
                                        required
                                    />
                                </div>
                            </div>
    
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Type <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                        <FaTag className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2 bg-white border rounded-md"
                                        required
                                    >
                                        <option value="HSN">HSN</option>
                                        <option value="SAC">SAC</option>
                                    </select>
                                </div>
                            </div>
    
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Applicable Type <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                        <FaInfo className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select
                                        name="applicableType"
                                        value={formData.applicableType}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2 bg-white border rounded-md"
                                        required
                                    >
                                        <option value="MATERIAL">Material</option>
                                        <option value="SERVICE">Service</option>
                                        <option value="BOTH">Both</option>
                                    </select>
                                </div>
                            </div>
    
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                        <FaTag className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2 border rounded-md"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
    
                {/* Description Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Description Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute top-3 left-3">
                                        <FaInfo className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        className="block w-full pl-10 pr-3 py-2 bg-white border rounded-md"
                                        required
                                    ></textarea>
                                </div>
                            </div>
    
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Short Description
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                        <FaInfo className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="shortDescription"
                                        value={formData.shortDescription}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2 bg-white border rounded-md"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
    
                {/* Tax Rates */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tax Rates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="p-4 border rounded-lg bg-white shadow-sm">
                                <div className="flex items-center mb-3">
                                    <FaPercentage className="w-5 h-5 text-blue-600 mr-2" />
                                    <label className="block text-sm font-medium text-gray-700">
                                        CGST (%) <span className="text-red-500">*</span>
                                    </label>
                                </div>
                                <input
                                    type="number"
                                    name="taxRateHistory.cgst"
                                    value={formData.taxRateHistory.cgst}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 border rounded-md"
                                    min="0"
                                    max="100"
                                    required
                                />
                            </div>
    
                            <div className="p-4 border rounded-lg bg-white shadow-sm">
                                <div className="flex items-center mb-3">
                                    <FaPercentage className="w-5 h-5 text-green-600 mr-2" />
                                    <label className="block text-sm font-medium text-gray-700">
                                        SGST (%) <span className="text-red-500">*</span>
                                    </label>
                                </div>
                                <input
                                    type="number"
                                    name="taxRateHistory.sgst"
                                    value={formData.taxRateHistory.sgst}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 border rounded-md"
                                    min="0"
                                    max="100"
                                    required
                                />
                            </div>
    
                            <div className="p-4 border rounded-lg bg-white shadow-sm">
                                <div className="flex items-center mb-3">
                                    <FaPercentage className="w-5 h-5 text-purple-600 mr-2" />
                                    <label className="block text-sm font-medium text-gray-700">
                                        IGST (%) <span className="text-red-500">*</span>
                                    </label>
                                </div>
                                <input
                                    type="number"
                                    name="taxRateHistory.igst"
                                    value={formData.taxRateHistory.igst}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 border rounded-md"
                                    min="0"
                                    max="100"
                                    required
                                />
                            </div>
    
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Effective From <span className="text-red-500">*</span>
                                </label>
                                <CustomDatePicker
                                    selectedDate={formData.taxRateHistory.effectiveFrom}
                                    onChange={handleDateChange}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
    
                {/* Remarks */}
                <Card>
                    <CardHeader>
                        <CardTitle>Remarks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <div className="absolute top-3 left-3">
                                <FaInfo className="h-5 w-5 text-gray-400" />
                            </div>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                rows="3"
                                className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border rounded-md"
                                placeholder="Add your remarks here"
                            ></textarea>
                        </div>
                    </CardContent>
                </Card>
    
                {/* Form Actions */}
                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Creating...' : 'Create HSN/SAC Code'}
                    </button>
                </div>
            </form>
    
            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-5 rounded-lg flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                        <span className="text-lg font-medium text-gray-700">Processing...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HSNCreation;