import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../Components/Card';
import { FaFileUpload, FaPencilAlt, FaDownload, FaInfoCircle, FaPlus, FaTrash } from "react-icons/fa";
import {
    createUnitThunk,
    bulkUploadUnitsThunk,
    getUnitsByTypeThunk
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
import { UNIT_TYPES } from '../../constents/unitConstants';
import * as XLSX from 'xlsx';
import ConversionHelper from './ConversionHelper';

const UnitCreation = () => {
    const dispatch = useDispatch();
    const { loading, error, createSuccess, bulkUploadSuccess, unitsByType } = useSelector((state) => state.unit);

    const [mode, setMode] = useState(null);
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [excelFile, setExcelFile] = useState(null);

    const initialFormState = useMemo(() => ({
        name: '',
        symbol: '',
        type: '',
        baseUnit: false,
        applicableTypes: ['MATERIAL'],
        serviceCategory: [],
        conversions: [],
        creationType: 'SINGLE',
        remarks: ''

    }), []);

    const [formData, setFormData] = useState(initialFormState);
    const [isFormDirty, setIsFormDirty] = useState(false);


    const handleResetForm = useCallback(() => {
        setFormData(initialFormState);
        setExcelFile(null);
        setIsFormDirty(false);
        setShowResetDialog(false);
        setMode(null);
    }, [initialFormState]);


    // Effects
    useEffect(() => {
        if (error) {
            showToast('error', error);
        }
    }, [error]);

    useEffect(() => {
        if (formData.type) {
            dispatch(getUnitsByTypeThunk({ 
                type: formData.type,
                excludeUnit: formData.symbol 
            }));
        }
    }, [formData.type, formData.symbol, dispatch]);

    useEffect(() => {
        if (createSuccess) {
            showToast('success', 'Unit created successfully');
            handleResetForm();
        }
    }, [createSuccess, handleResetForm]);

    useEffect(() => {
        if (bulkUploadSuccess) {
            showToast('success', 'Units uploaded successfully');
            handleResetForm();
        }
    }, [bulkUploadSuccess, handleResetForm]);

    // Handlers

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setIsFormDirty(true);
    }, []);

    const handleConversionChange = useCallback((index, field, value) => {
        setFormData(prev => ({
            ...prev,
            conversions: prev.conversions.map((conv, i) =>
                i === index ? { ...conv, [field]: value } : conv
            )
        }));
        setIsFormDirty(true);
    }, []);

    const handleExcelUpload = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const bstr = evt.target.result;
                    const wb = XLSX.read(bstr, { type: 'binary' });
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    const data = XLSX.utils.sheet_to_json(ws);
                    dispatch(bulkUploadUnitsThunk({ units: data }));
                } catch (error) {
                    showToast('error', 'Invalid Excel file format');
                }
            };
            reader.readAsBinaryString(file);
            setExcelFile(file);
        }
    }, [dispatch]);

    const downloadTemplate = useCallback(() => {
        const template = [
            {
                name: 'Kilogram',
                symbol: 'KG',
                type: 'WEIGHT',
                baseUnit: true,
                remarks: 'Example unit'
            }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Units');
        XLSX.writeFile(wb, 'unit_template.xlsx');
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        const formattedData = {
            name: formData.name.toUpperCase(),
            symbol: formData.symbol.toUpperCase(),
            type: formData.type,
            baseUnit: formData.baseUnit,
            applicableTypes: formData.applicableTypes || ['MATERIAL'],
            serviceCategory: formData.serviceCategory || [],
            conversions: formData.conversions.map(conv => ({
                toUnitSymbol: conv.toUnitSymbol.toUpperCase(),
                factor: parseFloat(conv.factor)
            })),
            remarks: formData.remarks || 'Unit Created'
        };

        console.log('Formatted data for submission:', formattedData);
        try {
            await dispatch(createUnitThunk(formattedData)).unwrap();
        } catch (err) {
            console.error('Failed to create unit:', err);
        }
    }, [dispatch, formData]);

    return (
        <div className="container mx-auto p-4 space-y-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Unit Management</h2>

            {/* Creation Mode Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Creation Mode</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                            onClick={() => setMode('single')}
                            className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${mode === 'single'
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-indigo-200'
                                }`}
                        >
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-indigo-100 rounded-full">
                                    <FaPencilAlt className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Single Unit</h3>
                                    <p className="text-sm text-gray-500">Create a single unit with detailed specifications</p>
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => setMode('bulk')}
                            className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${mode === 'bulk'
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-indigo-200'
                                }`}
                        >
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-indigo-100 rounded-full">
                                    <FaFileUpload className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Bulk Upload</h3>
                                    <p className="text-sm text-gray-500">Upload multiple units via Excel template</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {mode === 'single' && (
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Unit Configuration</CardTitle>
                                <div className="text-sm text-gray-500 flex items-center">
                                    <FaInfoCircle className="mr-2" />
                                    Base units are standard measurement units
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Add this after the Type selector */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Applicable Types</label>
                                        <select
                                            name="applicableTypes"
                                            value={formData.applicableTypes[0]}
                                            onChange={(e) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    applicableTypes: [e.target.value]
                                                }));
                                            }}
                                            className="w-full p-2 border rounded"
                                            required
                                        >
                                            <option value="MATERIAL">Material</option>
                                            <option value="SERVICE">Service</option>
                                            <option value="BOTH">Both</option>
                                        </select>
                                    </div>

                                    {/* Conditional Service Category */}
                                    {(formData.applicableTypes[0] === 'SERVICE' || formData.applicableTypes[0] === 'BOTH') && (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Service Category</label>
                                            <select
                                                name="serviceCategory"
                                                value={formData.serviceCategory[0] || ''}
                                                onChange={(e) => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        serviceCategory: e.target.value ? [e.target.value] : []
                                                    }));
                                                }}
                                                className="w-full p-2 border rounded"
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                <option value="TIME_BASED">Time Based</option>
                                                <option value="QUANTITY_BASED">Quantity Based</option>
                                                <option value="DISTANCE_BASED">Distance Based</option>
                                                <option value="AREA_BASED">Area Based</option>
                                                <option value="VOLUME_BASED">Volume Based</option>
                                                <option value="LUMPSUM">Lumpsum</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Unit Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="e.g., Kilogram"
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Enter the full name of the unit (will be converted to uppercase) </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Symbol</label>
                                        <input
                                            type="text"
                                            name="symbol"
                                            value={formData.symbol}
                                            onChange={handleChange}
                                            placeholder="e.g., KG"
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Standard abbreviation (2-5 characters, will be converted to uppercase)</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Type</label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded"
                                            required
                                        >
                                            <option value="">Select Type</option>
                                            {Object.entries(UNIT_TYPES).map(([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="baseUnit"
                                            name="baseUnit"
                                            checked={formData.baseUnit}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-indigo-600 rounded"
                                        />
                                        <label htmlFor="baseUnit" className="ml-2">Base Unit</label>
                                        <p className="text-xs text-gray-500">
                                            Mark as base unit if this is the standard unit for its type (e.g., KG for weight)
                                        </p>
                                    </div>
                                </div>

                                {/* Conversions */}
                                {/* Inside your form's conversion section */}
                                <div className="border-t pt-4">
                                    <h3 className="font-medium mb-4">Unit Conversions</h3>
                                    <div className="space-y-4">
                                        {formData.conversions.map((conv, idx) => (
                                            <div key={idx} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg bg-white relative group">
                                                {/* To Unit Symbol */}
                                                <div className="col-span-5">
                                                    <label className="block text-sm font-medium mb-1">
                                                        To Unit 
                                                        <span className="text-xs text-gray-500 ml-1">(Select Target unit)</span>
                                                    </label>
                                                    <select
                                value={conv.toUnitSymbol}
                                onChange={(e) => handleConversionChange(idx, 'toUnitSymbol', e.target.value)}
                                className="w-full p-2 border rounded"
                                required
                                disabled={!formData.type}
                            >
                                <option value="">Select Unit</option>
                                {unitsByType.map(unit => (
                                    <option 
                                        key={unit._id} 
                                        value={unit.symbol}
                                        disabled={unit.symbol === formData.symbol}
                                    >
                                        {unit.name} ({unit.symbol}) {unit.baseUnit ? '- Base Unit' : ''}
                                    </option>
                                ))}
                            </select>
                            {!formData.type && (
                                <p className="text-xs text-amber-600 mt-1">
                                    Please select a unit type first
                                </p>
                            )}
                                                </div>

                                                {/* Conversion Factor */}
                                                <div className="col-span-5">
                                                    <label className="block text-sm font-medium mb-1">
                                                        Conversion Factor
                                                        <span className="text-xs text-gray-500 ml-1">(e.g., 0.001 for KG to MT)</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.000001"
                                                        value={conv.factor}
                                                        onChange={(e) => handleConversionChange(idx, 'factor', e.target.value)}
                                                        className="w-full p-2 border rounded"
                                                        required
                                                    />
                                                </div>

                                                {/* Delete Icon */}
                                                <div className="col-span-2 flex justify-center">
                                                    <div
                                                        onClick={() => {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                conversions: prev.conversions.filter((_, i) => i !== idx)
                                                            }));
                                                        }}
                                                        className="cursor-pointer p-2 text-gray-400 hover:text-red-600 transition-colors duration-200 h-10 w-10 flex items-center justify-center rounded-full hover:bg-red-50"
                                                        title="Delete conversion"
                                                    >
                                                        <FaTrash />
                                                    </div>
                                                </div>

                                                {/* Optional: Preview Component */}
                                                <div className="col-span-12">
                                                    <ConversionHelper
                                                        baseUnit={formData.symbol}
                                                        targetUnit={conv.toUnitSymbol}
                                                        factor={parseFloat(conv.factor)}
                                                    >
                                                        <div className="text-xs text-indigo-600 mt-1">
                                                            <span className="font-medium">Note:</span> For {formData.symbol} to {conv.toUnitSymbol},
                                                            use {parseFloat(conv.factor)} as the factor.
                                                            (Example: 1000 {formData.symbol} = {1000 * parseFloat(conv.factor)} {conv.toUnitSymbol})
                                                        </div>
                                                    </ConversionHelper>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add Conversion Button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    conversions: [...prev.conversions, { toUnitSymbol: '', factor: '' }]
                                                }));
                                            }}
                                            className="w-full p-3 border-2 border-dashed rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-500 flex items-center justify-center"
                                        >
                                            <FaPlus className="mr-2" /> Add Conversion
                                        </button>
                                    </div>
                                </div>
                                {/* Remarks */}
                                <div className="border-t pt-4">
                                    <label className="block text-sm font-medium mb-1">Remarks</label>
                                    <textarea
                                        name="remarks"
                                        value={formData.remarks}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full p-2 border rounded"
                                        placeholder="Enter any additional remarks..."
                                    />
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-4 border-t pt-4">
                                    <button
                                        type="button"
                                        onClick={() => isFormDirty && setShowResetDialog(true)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                        disabled={loading}
                                    >
                                        Reset
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                        disabled={loading}
                                    >
                                        {loading ? 'Creating...' : 'Create Unit'}
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            )}

            {mode === 'bulk' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Bulk Upload Units</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Continuing from the bulk upload Card component */}
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="font-medium">Upload Excel File</h3>
                                    <p className="text-sm text-gray-500">Follow the template format for successful upload</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={downloadTemplate}
                                    className="px-4 py-2 flex items-center text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50"
                                >
                                    <FaDownload className="mr-2" /> Download Template
                                </button>
                            </div>

                            <div className="border-2 border-dashed rounded-lg p-8 text-center">
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleExcelUpload}
                                    className="hidden"
                                    id="excel-upload"
                                />
                                <label
                                    htmlFor="excel-upload"
                                    className="cursor-pointer block"
                                >
                                    <FaFileUpload className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">
                                        {excelFile ? excelFile.name : 'Click to upload or drag and drop'}
                                    </p>
                                    <p className="text-xs text-gray-500">Excel files only (.xlsx, .xls)</p>
                                </label>
                            </div>

                            {/* Upload Actions */}
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    onClick={handleResetForm}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    disabled={loading}
                                >
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (excelFile) {
                                            // Upload logic is handled in handleExcelUpload
                                            showToast('info', 'Processing file...');
                                        } else {
                                            showToast('error', 'Please select a file first');
                                        }
                                    }}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                    disabled={loading || !excelFile}
                                >
                                    {loading ? 'Uploading...' : 'Upload Units'}
                                </button>
                            </div>

                            {/* Help Text */}
                            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="text-lg font-medium text-blue-900 mb-2">Excel Upload Instructions</h3>
                                <ul className="space-y-2 text-sm text-blue-800">
                                    <li className="flex items-center">
                                        <FaInfoCircle className="mr-2" />
                                        Download the template first to see the required format
                                    </li>
                                    <li className="flex items-center">
                                        <FaInfoCircle className="mr-2" />
                                        Each unit must have a name, symbol, and type
                                    </li>
                                    <li className="flex items-center">
                                        <FaInfoCircle className="mr-2" />
                                        Valid types are: {Object.values(UNIT_TYPES).join(', ')}
                                    </li>
                                    <li className="flex items-center">
                                        <FaInfoCircle className="mr-2" />
                                        Symbols must be unique and in capital letters
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Reset Confirmation Dialog */}
            <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reset Form?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will clear all entered data. Are you sure you want to continue?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetForm}>
                            Yes, Reset Form
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-5 rounded-lg flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                        <span>Processing...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnitCreation;