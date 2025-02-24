// SpecificationForm.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../../Components/Card';
import { FaTools, FaMoneyBill, FaExchangeAlt, FaSearch } from "react-icons/fa";
import {
    createSpecification,
    getAllBaseCodes,

} from '../../../Slices/inventoryModuleSlices/itemCodeSlices';
import { showToast } from '../../../utilities/toastUtilities';
import { MdChangeCircle } from "react-icons/md";
import Select from 'react-select'
import { getAllowedUnitsByPrimaryUnitThunk } from '../../../Slices/inventoryModuleSlices/itemCodeUnitSlices'
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






const SpecificationForm = ({ baseCodeId, onBack }) => {
    const dispatch = useDispatch();
    const {
        baseCodes,
        loading: { createSpecification: loading },
        error: { createSpecification: error },
        success: { createSpecification: createSuccess }
    } = useSelector(state => state.itemCode);

    const {
        allowedUnits,
        loading: { fetchAllowedUnits: unitLoading },
        errors: { fetchAllowedUnits: unitError }
    } = useSelector((state) => state.unit);

    const [showResetDialog, setShowResetDialog] = useState(false);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [selectedBaseCode, setSelectedBaseCode] = useState(null);
    const [showBaseCodeSearch, setShowBaseCodeSearch] = useState(true);


    const initialFormState = useMemo(() => ({
        make: '',
        specification: '',
        primaryUnit: '',
        standardPrice: '',
        allowedUnits: [],
        priceReferences: [{
            partyName: '',
            email: '',
            phone: '',
            price: '',
            websiteUrl: ''
        }],
        remarks: ''
    }), []);

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (selectedBaseCode?.primaryUnit) {
            dispatch(getAllowedUnitsByPrimaryUnitThunk(selectedBaseCode.primaryUnit));
            setFormData(prev => {
                
                const newAllowedUnits = prev.allowedUnits.includes(selectedBaseCode.primaryUnit) 
                    ? prev.allowedUnits 
                    : [...prev.allowedUnits, selectedBaseCode.primaryUnit];
                
                return {
                    ...prev,
                    primaryUnit: selectedBaseCode.primaryUnit,
                    allowedUnits: newAllowedUnits
                };
            });
        }
    }, [dispatch, selectedBaseCode]);



    useEffect(() => {
        dispatch(getAllBaseCodes())
    }, [dispatch])

    useEffect(() => {
        if (error) {
            showToast('error', error);
        }
    }, [error]);

    useEffect(() => {
        if (createSuccess && selectedBaseCode) {
            showToast('success', 'Specification created successfully');
            setFormData(initialFormState);
            setSelectedBaseCode(null);
            setShowBaseCodeSearch(true);
        }
    }, [createSuccess, initialFormState, selectedBaseCode]);

    const validateForm = useCallback(() => {
        const errors = [];

        if (!formData.make.trim()) {
            errors.push('Make is required');
        }

        if (!formData.primaryUnit) {
            errors.push('Primary Unit is required');
        }

        if (!formData.standardPrice || formData.standardPrice <= 0) {
            errors.push('Valid Standard Price is required');
        }

        if (formData.allowedUnits.length === 0) {
            errors.push('At least one allowed unit must be selected');
        }

        // Validate price references
        formData.priceReferences.forEach((ref, index) => {
            if (!ref.partyName.trim()) {
                errors.push(`Party Name is required for reference ${index + 1}`);
            }
            if (!ref.email.trim()) {
                errors.push(`Email is required for reference ${index + 1}`);
            }
            if (!ref.phone.trim()) {
                errors.push(`Phone is required for reference ${index + 1}`);
            }
            if (!ref.price || ref.price <= 0) {
                errors.push(`Valid Price is required for reference ${index + 1}`);
            }
        });

        return errors;
    }, [formData]);



    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        
        if (name === 'primaryUnit') {
            // When primary unit changes, update the allowed units too
            setFormData(prev => {
                // Include the new primary unit in allowed units if it's not already there
                const newAllowedUnits = prev.allowedUnits.includes(value)
                    ? prev.allowedUnits
                    : [...prev.allowedUnits, value];
                    
                return {
                    ...prev,
                    [name]: value,
                    allowedUnits: newAllowedUnits
                };
            });
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        
        setIsFormDirty(true);
    }, []);

    const handlePriceReferenceChange = useCallback((index, field, value) => {
        setFormData(prev => {
            const updatedReferences = [...prev.priceReferences];
            updatedReferences[index] = {
                ...updatedReferences[index],
                [field]: value
            };
            return {
                ...prev,
                priceReferences: updatedReferences
            };
        });
        setIsFormDirty(true);
    }, []);
    const addPriceReference = () => {
        setFormData(prev => ({
            ...prev,
            priceReferences: [
                ...prev.priceReferences,
                { partyName: '', email: '', phone: '', price: '', websiteUrl: '' }
            ]
        }));
    };

    const removePriceReference = (index) => {
        setFormData(prev => ({
            ...prev,
            priceReferences: prev.priceReferences.filter((_, i) => i !== index)
        }));
    };

    const handleUnitSelection = useCallback((unit) => {
        setFormData((prev) => {
            const isSelected = prev.allowedUnits.includes(unit.symbol);
            const newAllowedUnits = isSelected
                ? prev.allowedUnits.filter((symbol) => symbol !== unit.symbol)
                : [...prev.allowedUnits, unit.symbol];
            console.log('Updated allowedUnits:', newAllowedUnits); // Debug
            return { ...prev, allowedUnits: newAllowedUnits };
        });
        setIsFormDirty(true);
    }, []);

    // Base Code Selection Component
    const BaseCodeSelection = () => {
        const options = baseCodes.map(code => ({
            value: code,
            label: `${code.baseCode} - ${code.itemName}`,
            baseCode: code.baseCode,
            itemName: code.itemName
        }))

        const customStyles = {
            control: (provided, state) => ({
                ...provided,
                borderColor: state.isFocused ? '#4F46E5' : '#E5E7EB',
                boxShadow: state.isFocused ? '0 0 0 1px #4F46E5' : 'none',
                '&:hover': {
                    borderColor: '#4F46E5'
                }
            }),
            option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected ? '#4F46E5' : state.isFocused ? '#EEF2FF' : 'white',
                color: state.isSelected ? 'white' : '#111827',
                cursor: 'pointer',
                '&:active': {
                    backgroundColor: '#4F46E5'
                }
            }),
            input: (provided) => ({
                ...provided,
                color: '#111827'
            })
        };


        const formatOptionLabel = ({ baseCode, itemName }) => (
            <div className="flex flex-col">
                <div className="font-medium">{baseCode}</div>
                <div className="text-sm text-gray-600">{itemName}</div>
            </div>
        );

        return (
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <FaSearch className="w-5 h-5 text-indigo-600" />

                        <CardTitle>Base code Selection </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>


                    <Select
                        options={options}
                        styles={customStyles}
                        placeholder="Search base code or item name..."
                        formatOptionLabel={formatOptionLabel}
                        onChange={(selected) => {
                            if (selected) {
                                console.log('Selected Base Code:', selected.value);
                                console.log('Primary Unit:', selected.value.primaryUnit);
                                setSelectedBaseCode(selected.value);
                                setShowBaseCodeSearch(false);
                            }
                        }}
                        isSearchable={true}
                        isClearable={true}
                        className="w-full"
                        noOptionsMessage={() => "No base codes found"}
                    />
                </CardContent>
            </Card>
        )
    }



    const SelectedBaseCodeDetails = () => (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700">Selected Base Code</h3>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-gray-600">Base Code:</span>
                            <span className="ml-2 font-medium">{selectedBaseCode.baseCode}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Item Name:</span>
                            <span className="ml-2 font-medium">{selectedBaseCode.itemName}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setSelectedBaseCode(null);
                        setShowBaseCodeSearch(true);
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                    <MdChangeCircle className='w-5 h-5 text-indigo-600' />
                    <span className='text-indigo-600'>Change Base Code</span>
                </button>
            </div>
        </div>
    );

    // Update in the renderUnitsSection function
    const renderUnitsSection = () => {
        console.log('Rendering units section:', {
            unitLoading,
            unitError,
            allowedUnits,
            primaryUnit: formData.primaryUnit,
            selectedBaseCodePrimaryUnit: selectedBaseCode?.primaryUnit
        });

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Primary Unit <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="primaryUnit"
                        value={formData.primaryUnit}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                        required
                    // Remove the disabled attribute
                    >
                        <option value="">
                            {unitLoading ? 'Loading Units...' : 'Select Unit'}
                        </option>
                        {unitError && <option disabled>{unitError}</option>}
                        {!unitLoading && allowedUnits?.units && allowedUnits.units.map(unit => (
                            <option
                                key={unit._id}
                                value={unit.symbol}
                                className={unit.baseUnit ? 'font-semibold text-indigo-600' : ''}
                            >
                                {unit.symbol} - {unit.name}
                                {unit.baseUnit && ' (Base Unit)'}
                                {unit.symbol === selectedBaseCode?.primaryUnit && ' (Default)'}
                            </option>
                        ))}
                    </select>
                    {/* Update the helper text */}
                    <p className="mt-1 text-sm text-gray-500">
                        {selectedBaseCode?.primaryUnit ?
                            `Default unit from base code is ${selectedBaseCode.primaryUnit}` :
                            'Select a primary unit'}
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Standard Price <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="standardPrice"
                        value={formData.standardPrice}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border rounded-md"
                        required
                        min="0"
                        step="0.01"
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allowed Units
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                        {unitLoading && (
                            <div className="col-span-3 text-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent inline-block"></div>
                                <span className="ml-2">Loading units...</span>
                            </div>
                        )}
                        {!unitLoading && allowedUnits?.units && allowedUnits.units.map(unit => (
                            <div key={unit._id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.allowedUnits.includes(unit.symbol)|| unit.symbol === formData.primaryUnit}
                                    onChange={() => handleUnitSelection(unit)}
                                    className="h-4 w-4 text-indigo-600 rounded"
                                    
                                    disabled={unit.symbol === formData.primaryUnit}
                                />
                                <label className="ml-2 text-sm text-gray-700 flex items-center">
                                    <span className={unit.baseUnit ? 'font-medium text-indigo-600' : ''}>
                                        {unit.symbol} - {unit.name}
                                    </span>
                                    {unit.baseUnit && (
                                        <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-600 rounded">
                                            Base Unit
                                        </span>
                                    )}
                                    {unit.symbol === selectedBaseCode?.primaryUnit && (
                                        <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-600 rounded">
                                            Default
                                        </span>
                                    )}
                                    {unit.symbol === formData.primaryUnit && (
                                        <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded">
                                            Selected Primary
                                        </span>
                                    )}
                                </label>
                            </div>
                        ))}
                        {!unitLoading && (!allowedUnits?.units || allowedUnits.units.length === 0) && (
                            <p className="col-span-3 text-sm text-gray-500">
                                No compatible units available for the selected base code
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            showToast('error', validationErrors[0]);
            return;
        }
    
        if (!allowedUnits?.units) {
            showToast('error', 'Units not loaded. Please try again.');
            return;
        }
    
        try {
            const primaryUnitObj = allowedUnits.units.find((u) => u.symbol === formData.primaryUnit);
            const allowedUnitObjects = formData.allowedUnits.map((unitSymbol) => {
                const unit = allowedUnits.units.find((u) => u.symbol === unitSymbol);
                return { unit: unit._id, isDefault: unitSymbol === formData.primaryUnit };
            });
    
            const requestData = {
                baseCode: selectedBaseCode.baseCode,
                make: formData.make,
                specification: formData.specification,
                primaryUnit: primaryUnitObj?._id,
                standardPrice: parseFloat(formData.standardPrice),
                allowedUnits: allowedUnitObjects,
                priceReferences: formData.priceReferences,
                remarks: formData.remarks,
            };
    
            await dispatch(createSpecification({ formData: requestData, isExcelUpload: false })).unwrap();
        } catch (err) {
            showToast('error', err.message || 'Failed to create specification');
        }
    };
    const handleResetConfirmation = useCallback(() => {
        setFormData(initialFormState);
        setIsFormDirty(false);
        setShowResetDialog(false);
        showToast('success', 'Form reset successfully');
    }, [initialFormState]);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {showBaseCodeSearch ? (
                <BaseCodeSelection />
            ) : (
                <SelectedBaseCodeDetails />
            )}
            {/* Basic Details Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <FaTools className="w-5 h-5 text-indigo-600" />
                        <CardTitle>Basic Details</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Make <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="make"
                                value={formData.make}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Specification
                            </label>
                            <textarea
                                name="specification"
                                value={formData.specification}
                                onChange={handleChange}
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 border rounded-md"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Units & Price Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <FaExchangeAlt className="w-5 h-5 text-indigo-600" />
                        <CardTitle>Units & Price</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {renderUnitsSection()}
                </CardContent>
            </Card>

            {/* Price References Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <FaMoneyBill className="w-5 h-5 text-indigo-600" />
                            <CardTitle>Price References</CardTitle>
                        </div>
                        <button
                            type="button"
                            onClick={addPriceReference}
                            className="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100"
                        >
                            Add Reference
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    {formData.priceReferences.map((reference, index) => (
                        <div key={index} className="mb-6 p-4 border rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Party Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={reference.partyName}
                                        onChange={(e) => handlePriceReferenceChange(index, 'partyName', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border rounded-md"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={reference.email}
                                        onChange={(e) => handlePriceReferenceChange(index, 'email', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border rounded-md"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Phone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={reference.phone}
                                        onChange={(e) => handlePriceReferenceChange(index, 'phone', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border rounded-md"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Price <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={reference.price}
                                        onChange={(e) => handlePriceReferenceChange(index, 'price', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border rounded-md"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Website URL
                                    </label>
                                    <input
                                        type="url"
                                        value={reference.websiteUrl}
                                        onChange={(e) => handlePriceReferenceChange(index, 'websiteUrl', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                            </div>

                            {index > 0 && (
                                <button
                                    type="button"
                                    onClick={() => removePriceReference(index)}
                                    className="mt-2 text-red-600 text-sm hover:text-red-800"
                                >
                                    Remove Reference
                                </button>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Remarks Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Remarks
                        </label>
                        <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            rows={4}
                            className="mt-1 block w-full px-3 py-2 border rounded-md"
                            placeholder="Enter any additional remarks..."
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-between mt-6">
                <button
                    type="button"
                    onClick={onBack}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                    Back
                </button>
                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={() => {
                            if (isFormDirty) setShowResetDialog(true);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Specification'}
                    </button>
                </div>
            </div>

            {/* Reset Dialog */}
            <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reset Form</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to reset the form? All entered data will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleResetConfirmation}
                            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md"
                        >
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
        </form>
    );
};

export default SpecificationForm;