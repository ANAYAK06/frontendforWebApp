import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    createClientPO,
    getPerformingCostCentres,
    getWonBOQs,
    getClientDetails,
    clearErrors,
    clearSuccess
} from '../../Slices/accountsModuleSlices/clientPOSlices';
import { showToast } from '../../utilities/toastUtilities';
import { Card, CardHeader, CardTitle, CardContent } from '../../Components/Card';
import {
    FaBoxes,
    FaTools,
    FaCogs,
    FaPlus,
    FaTrash
} from 'react-icons/fa';

const ITEM_TYPES = [
    { value: 'Supply', label: 'Supply', icon: FaBoxes },
    { value: 'Service', label: 'Service', icon: FaTools },
    { value: 'Manufacturing', label: 'Manufacturing', icon: FaCogs }
];

const BILLING_PLANS = [
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Quarterly', label: 'Quarterly' },
    { value: 'Completion_Based', label: 'Completion Based' },
    { value: 'Custom', label: 'Custom' }
];

const BUDGET_METHODS = [
    { value: 'PO_Value', label: 'Against PO Value' },
    { value: 'Invoice_Value', label: 'Against Invoice Value' }
];

const ClientPOCreation = () => {
    const dispatch = useDispatch();
    const {
        loading,
        error,
        success,
        costCentres,
        wonBOQs,
        clientDetails
    } = useSelector((state) => state.clientPO);

    const initialFormState = useMemo(() => ({
        poNumber: '',
        clientId: '',
        subClientId: '',
        boqId: '',
        items: [{
            boqItemId: '',
            description: '',
            quantity: 0,
            rate: 0,
            totalValue: 0,
            itemTypes: [],
            isSublet: false
        }],
        costCentreId: '',
        advanceApplicable: {
            isApplicable: false,
            percentage: 0
        },
        billingPlan: '',
        billingPlanDetails: {
            completionPercentages: [],
            customDates: []
        },
        budgetAllocation: {
            method: '',
            percentage: 0
        },
        remarks: ''
    }), []);

    const [formData, setFormData] = useState(initialFormState);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    useEffect(() => {
        dispatch(getPerformingCostCentres());
        dispatch(getWonBOQs());
    }, [dispatch]);

    const handleReset = useCallback(() => {
        if (isFormDirty && window.confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
            setFormData(initialFormState);
            setIsFormDirty(false);
            setSelectedClient(null);
        }
    }, [initialFormState, isFormDirty]);

    useEffect(() => {
        if (success.createPO) {
            showToast('success', 'Client PO created successfully');
            handleReset();
            dispatch(clearSuccess());
        }
    }, [success.createPO, dispatch, handleReset]);

    useEffect(() => {
        if (error.createPO) {
            showToast('error', error.createPO);
            dispatch(clearErrors());
        }
    }, [error.createPO, dispatch]);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setIsFormDirty(true);

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    }, []);

    const handleClientChange = useCallback(async (clientId) => {
        if (clientId) {
            const response = await dispatch(getClientDetails(clientId));
            setSelectedClient(response.payload);
            setFormData(prev => ({
                ...prev,
                clientId,
                subClientId: ''
            }));
        }
    }, [dispatch]);

    const handleItemChange = useCallback((index, field, value) => {
        setIsFormDirty(true);
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => {
                if (i === index) {
                    const updatedItem = { ...item, [field]: value };
                    if (field === 'quantity' || field === 'rate') {
                        updatedItem.totalValue = updatedItem.quantity * updatedItem.rate;
                    }
                    return updatedItem;
                }
                return item;
            })
        }));
    }, []);

    const addItem = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                boqItemId: '',
                description: '',
                quantity: 0,
                rate: 0,
                totalValue: 0,
                itemTypes: [],
                isSublet: false
            }]
        }));
    }, []);

    const removeItem = useCallback((index) => {
        if (index === 0) {
            showToast('error', 'Cannot remove primary item');
            return;
        }
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    }, []);

    const handleItemTypeToggle = useCallback((index, type) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => {
                if (i === index) {
                    const types = new Set(item.itemTypes);
                    if (types.has(type)) {
                        types.delete(type);
                    } else {
                        types.add(type);
                    }
                    return { ...item, itemTypes: Array.from(types) };
                }
                return item;
            })
        }));
    }, []);

    const validateForm = useCallback(() => {
        const errors = [];

        if (!formData.poNumber) errors.push('PO Number is required');
        if (!formData.clientId) errors.push('Client is required');
        if (selectedClient?.clientType !== 'Individual' && !formData.subClientId) {
            errors.push('Subclient is required for non-individual clients');
        }
        if (!formData.boqId) errors.push('BOQ is required');
        if (!formData.costCentreId) errors.push('Cost Centre is required');
        if (!formData.billingPlan) errors.push('Billing Plan is required');
        if (!formData.budgetAllocation.method) errors.push('Budget Allocation Method is required');
        if (!formData.remarks) errors.push('Remarks are required');

        // Validate items
        formData.items.forEach((item, index) => {
            if (!item.boqItemId) errors.push(`BOQ Item ${index + 1} is required`);
            if (item.itemTypes.length === 0) errors.push(`Item Types for Item ${index + 1} are required`);
            if (item.quantity <= 0) errors.push(`Quantity for Item ${index + 1} must be greater than 0`);
            if (item.rate <= 0) errors.push(`Rate for Item ${index + 1} must be greater than 0`);
        });

        if (errors.length > 0) {
            showToast('error', errors[0]);
            return false;
        }

        return true;
    }, [formData, selectedClient]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (validateForm()) {
            dispatch(createClientPO(formData));
        }
    }, [dispatch, formData, validateForm]);

    return (
        <div className="container mx-auto p-4 py-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Create Client PO</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        PO Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="poNumber"
                                        value={formData.poNumber}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Client <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="clientId"
                                        value={formData.clientId}
                                        onChange={(e) => handleClientChange(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        required
                                    >
                                        <option value="">Select Client</option>
                                        {/* Add client options here */}
                                    </select>
                                </div>

                                {selectedClient?.clientType !== 'Individual' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Subclient <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="subClientId"
                                            value={formData.subClientId}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                            required
                                        >
                                            <option value="">Select Subclient</option>
                                            {selectedClient?.subClients?.map(subclient => (
                                                <option key={subclient._id} value={subclient._id}>
                                                    {subclient.subClientCode}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        BOQ <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="boqId"
                                        value={formData.boqId}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        required
                                    >
                                        <option value="">Select BOQ</option>
                                        {wonBOQs.map(boq => (
                                            <option key={boq._id} value={boq._id}>
                                                {boq.offerNumber}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Cost Centre <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="costCentreId"
                                        value={formData.costCentreId}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        required
                                    >
                                        <option value="">Select Cost Centre</option>
                                        {costCentres.map(cc => (
                                            <option key={cc._id} value={cc._id}>
                                                {cc.ccName} ({cc.ccNo})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items Section */}
                    {formData.items.map((item, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Item {index + 1}</CardTitle>
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                BOQ Item <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={item.boqItemId}
                                                onChange={(e) => handleItemChange(index, 'boqItemId', e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                                required
                                            >
                                                <option value="">Select BOQ Item</option>
                                                {/* Add BOQ items options here */}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Description
                                            </label>
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Quantity <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                                className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                                min="0"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Rate <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={item.rate}
                                                onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))}
                                                className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                                min="0"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Total Value
                                            </label>
                                            <input
                                                type="number"
                                                value={item.totalValue}
                                                className="mt-1 block w-full px-3 py-2 bg-gray-100 border rounded-md"
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Item Types <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {ITEM_TYPES.map(type => (
                                                <div
                                                    key={type.value}
                                                    onClick={() => handleItemTypeToggle(index, type.value)}
                                                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all flex items-center space-x-2
                                                        ${item.itemTypes.includes(type.value)
                                                            ? 'border-indigo-500 bg-indigo-50'
                                                            : 'border-gray-200 hover:border-indigo-200'
                                                        }`}
                                                >
                                                    <type.icon className="w-5 h-5 text-indigo-600" />
                                                    <span>{type.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={item.isSublet}
                                                onChange={(e) => handleItemChange(index, 'isSublet', e.target.checked)}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-sm text-gray-600">Sublet Item</span>
                                        </label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={addItem}
                            className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                        >
                            <FaPlus className="mr-1" /> Add Another Item
                        </button>
                    </div>

                    {/* Billing Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.advanceApplicable.isApplicable}
                                            onChange={(e) => handleChange({
                                                target: {
                                                    name: 'advanceApplicable.isApplicable',
                                                    type: 'checkbox',
                                                    checked: e.target.checked
                                                }
                                            })}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm text-gray-600">Advance Applicable</span>
                                    </label>
                                    {formData.advanceApplicable.isApplicable && (
                                        <div className="mt-2">
                                            <input
                                                type="number"
                                                name="advanceApplicable.percentage"
                                                value={formData.advanceApplicable.percentage}
                                                onChange={handleChange}
                                                className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                                min="0"
                                                max="100"
                                                placeholder="Advance Percentage"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Billing Plan <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="billingPlan"
                                        value={formData.billingPlan}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        required
                                    >
                                        <option value="">Select Billing Plan</option>
                                        {BILLING_PLANS.map(plan => (
                                            <option key={plan.value} value={plan.value}>
                                                {plan.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {formData.billingPlan === 'Completion_Based' && (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Completion Percentages
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter comma-separated percentages (e.g., 25,50,75,100)"
                                            onChange={(e) => {
                                                const percentages = e.target.value.split(',').map(Number);
                                                handleChange({
                                                    target: {
                                                        name: 'billingPlanDetails.completionPercentages',
                                                        value: percentages
                                                    }
                                                });
                                            }}
                                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        />
                                    </div>
                                )}

                                {formData.billingPlan === 'Custom' && (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Custom Billing Dates
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter comma-separated dates (DD/MM/YYYY)"
                                            onChange={(e) => {
                                                const dates = e.target.value.split(',').map(date => new Date(date));
                                                handleChange({
                                                    target: {
                                                        name: 'billingPlanDetails.customDates',
                                                        value: dates
                                                    }
                                                });
                                            }}
                                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Budget Allocation */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Budget Allocation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Allocation Method <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="budgetAllocation.method"
                                        value={formData.budgetAllocation.method}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        required
                                    >
                                        <option value="">Select Method</option>
                                        {BUDGET_METHODS.map(method => (
                                            <option key={method.value} value={method.value}>
                                                {method.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Allocation Percentage <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="budgetAllocation.percentage"
                                        value={formData.budgetAllocation.percentage}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        min="0"
                                        max="100"
                                        required
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Remarks <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                    rows="3"
                                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                    placeholder="Enter remarks..."
                                    required
                                />
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
                            disabled={loading.createPO}
                            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 
                                ${loading.createPO ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading.createPO ? 'Creating...' : 'Create PO'}
                        </button>
                    </div>
                </form>

                {/* Loading Overlay */}
                {loading.createPO && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-5 rounded-lg flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                            <span className="text-lg font-medium text-gray-700">Creating PO...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientPOCreation;