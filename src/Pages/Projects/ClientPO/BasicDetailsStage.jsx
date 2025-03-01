import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../Components/Card';
import CustomDatePicker from '../../../Components/CustomDatePicker';

const BasicDetailsStage = ({
    formData,
    costCentres,
    clients,
    subClients,
    selectedClient,
    onUpdate,
    onClientChange,
    onNext,
    loading
}) => {
    const [errors, setErrors] = useState({
        poNumber: '',
        poDate: '',
        clientId: '',
        subClientId: '',
        costCentreId: ''
    });

    // Ensure the date is properly initialized as a UTC string
    useEffect(() => {
        // Initialize poDate if not set or invalid
        if (!formData.poDate) {
            // Convert current date to UTC string format as expected by CustomDatePicker
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const utcDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString();
            onUpdate({ poDate: utcDate });
        }
    }, [formData.poDate, onUpdate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onUpdate({ [name]: value });

        // Clear error when field is filled
        if (value) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleDateChange = (utcDateString) => {
        // The CustomDatePicker already returns a UTC date string
        onUpdate({ poDate: utcDateString });
        if (utcDateString) {
            setErrors(prev => ({ ...prev, poDate: '' }));
        }
    };

    const isSubclientRequired = () => {
        if (!selectedClient) return false;
        return selectedClient.clientType !== 'Individual';
    };

    const validateForm = () => {
        const newErrors = {
            poNumber: formData.poNumber ? '' : 'PO Number is required',
            poDate: formData.poDate ? '' : 'PO Date is required',
            clientId: formData.clientId ? '' : 'Client is required',
            subClientId: isSubclientRequired() && !formData.subClientId ? 'Subclient is required' : '',
            costCentreId: formData.costCentreId ? '' : 'Cost Centre is required'
        };

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onNext();
        }
    };

    return (
        <div className="p-6">
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* PO Number */}
                            <div>
                                <label htmlFor="poNumber" className="block text-sm font-medium text-gray-700">
                                    PO Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="poNumber"
                                    name="poNumber"
                                    value={formData.poNumber}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md ${errors.poNumber ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.poNumber && (
                                    <p className="mt-1 text-sm text-red-500">{errors.poNumber}</p>
                                )}
                            </div>

                            {/* PO Date */}
                            <div>
                                <label htmlFor="poDate" className="block text-sm font-medium text-gray-700">
                                    PO Date <span className="text-red-500">*</span>
                                </label>
                                <div className={`${errors.poDate ? 'border border-red-500 rounded-md' : ''}`}>
                                    <CustomDatePicker
                                        selectedDate={formData.poDate}
                                        onChange={handleDateChange}
                                        placeholder="Select date"
                                        label=""  // Remove additional label since we already have one above
                                    />
                                </div>
                                {errors.poDate && (
                                    <p className="mt-1 text-sm text-red-500">{errors.poDate}</p>
                                )}
                            </div>

                            {/* Client Selection */}
                            <div>
                                <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                                    Client <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="clientId"
                                    name="clientId"
                                    value={formData.clientId}
                                    onChange={(e) => onClientChange(e.target.value)}
                                    className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md ${errors.clientId ? 'border-red-500' : 'border-gray-300'}`}
                                    disabled={loading?.clients}
                                >
                                    <option value="">Select Client</option>
                                    {clients.map(client => (
                                        <option key={client._id} value={client._id}>
                                            {client.clientCode} - {client.clientName}
                                        </option>
                                    ))}
                                </select>
                                {errors.clientId && (
                                    <p className="mt-1 text-sm text-red-500">{errors.clientId}</p>
                                )}
                                {loading?.clients && (
                                    <p className="mt-1 text-sm text-gray-500">Loading clients...</p>
                                )}
                            </div>

                            {/* Subclient Selection (if applicable) */}
                            {selectedClient?.clientType !== 'Individual' && (
                                <div className={isSubclientRequired() ? '' : 'hidden'}>
                                    <label htmlFor="subClientId" className="block text-sm font-medium text-gray-700">
                                        Subclient <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="subClientId"
                                        name="subClientId"
                                        value={formData.subClientId}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md ${errors.subClientId ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">Select Subclient</option>
                                        {subClients.map(subclient => (
                                            <option key={subclient._id} value={subclient._id}>
                                                {subclient.subClientCode} -{subclient.stateName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.subClientId && (
                                        <p className="mt-1 text-sm text-red-500">{errors.subClientId}</p>
                                    )}
                                </div>
                            )}

                            {/* Cost Centre Selection */}
                            <div>
                                <label htmlFor="costCentreId" className="block text-sm font-medium text-gray-700">
                                    Cost Centre <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="costCentreId"
                                    name="costCentreId"
                                    value={formData.costCentreId}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md ${errors.costCentreId ? 'border-red-500' : 'border-gray-300'}`}
                                    disabled={loading?.costCentres}
                                >
                                    <option value="">Select Cost Centre</option>
                                    {costCentres.map(cc => (
                                        <option key={cc._id} value={cc._id}>
                                            {cc.ccName} ({cc.ccNo})
                                        </option>
                                    ))}
                                </select>
                                {errors.costCentreId && (
                                    <p className="mt-1 text-sm text-red-500">{errors.costCentreId}</p>
                                )}
                                {loading?.costCentres && (
                                    <p className="mt-1 text-sm text-gray-500">Loading cost centres...</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Continue
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BasicDetailsStage;