import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSubClient, clearErrors, clearSuccess } from '../../Slices/accountsModuleSlices/clientSlices';
import { fetchCCCodesForDropdown } from '../../Slices/costCentreSlices';
import { fetchStates } from '../../Slices/stateSlices';
import { fetchActiveClients } from '../../Slices/accountsModuleSlices/clientSlices';
import { showToast } from '../../utilities/toastUtilities';
import { Card, CardHeader, CardTitle, CardContent } from '../../Components/Card';
import {
    FaPlus,
    FaTrash,

} from 'react-icons/fa';
import CustomDatePicker from '../../Components/CustomDatePicker';


const SubClientCreation = () => {
    const dispatch = useDispatch();
    const { loading, error, success } = useSelector((state) => state.client);
    const { ccstate } = useSelector((state) => state.ccstate);
    const { activeClients = [] } = useSelector((state) => state.client);
    const { ccCodes, ccCodesLoading, ccCodesError } = useSelector((state) => state.costCentres);

    const initialFormState = useMemo(() => ({
        mainClientId: '',
        gstNumber: '',
        registeredAddress: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
        },
        hasOpeningBalance: false,
        balanceAsOn: '',
        costCenterBalances: [],
        remarks: ''
    }), []);


    const [formData, setFormData] = useState(initialFormState);


    useEffect(() => {
        dispatch(fetchActiveClients());
        dispatch(fetchCCCodesForDropdown());
        
        dispatch(fetchStates());
        

    }, [dispatch]);

    useEffect(() => {
        console.log('Component CC Codes:', ccCodes);
        console.log('Loading State:', ccCodesLoading);
        console.log('Error State:', ccCodesError);
    
    }, [ccCodes, ccCodesLoading, ccCodesError]);

    const handleDateChange = (date) => {
        if (date) {
            // When a date is selected, it's already in UTC
            setFormData(prev => ({
                ...prev,
                balanceAsOn: date // CustomDatePicker now returns UTC ISO string
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                balanceAsOn: null
            }));
        }
    };


    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;

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

    const handleAddressChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            registeredAddress: {
                ...prev.registeredAddress,
                [field]: value
            }
        }));
    }, []);

    const handleCostCenterBalanceAdd = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            costCenterBalances: [
                ...prev.costCenterBalances,
                {
                    ccCode: '',
                    ccName: '',
                    basicAmount: 0,
                    cgst: 0,
                    sgst: 0,
                    igst: 0,
                    total: 0
                }
            ]
        }));
    }, []);

    const handleCostCenterBalanceChange = useCallback((index, field, value) => {
        setFormData(prev => {
            const newBalances = [...prev.costCenterBalances];
            const numericValue = parseFloat(value) || 0;

            newBalances[index] = {
                ...newBalances[index],
                [field]: value,
                total: calculateTotal(newBalances[index], field, numericValue)
                   
            };
            return {
                ...prev,
                costCenterBalances: newBalances
            };
        });
    }, []);

    const calculateTotal = (balance, changedField, newValue) => {
        const values = {
            basicAmount: parseFloat(balance.basicAmount) || 0,
            cgst: parseFloat(balance.cgst) || 0,
            sgst: parseFloat(balance.sgst) || 0,
            igst: parseFloat(balance.igst) || 0
        };
        
        // Update the changed field's value
        values[changedField] = newValue;
        
        return values.basicAmount + values.cgst + values.sgst + values.igst;
    };

    const handleCostCenterSelect = useCallback((index, ccValue) => {
        console.log('Selecting CC Value:', ccValue); // Debug log
        console.log('Available CC Codes:', ccCodes); // Debug log
        
        if (!ccCodes || ccCodes.length === 0) return;
    
        const selectedCC = ccCodes.find(cc => cc.value === ccValue);
        const selectedState = formData.registeredAddress.state;

        console.log('Found Selected CC:', selectedCC); // Debug log
        console.log('Selected State:', selectedState); // Debug log

        const isIntraState = selectedCC?.location === selectedState;
        console.log('State matching:', {
            ccLocation: selectedCC?.location,
            selectedState,
            isIntraState
        });
        
    
        if (selectedCC) {
            setFormData(prev => {
                const newBalances = [...prev.costCenterBalances];
                
                // Update the balance at the specific index
                newBalances[index] = {
                    ...newBalances[index],
                    ccCode: selectedCC.value,
                    ccName: selectedCC.label.split(' - ')[1] || '', // Extract ccName from label with fallback
                    // Reset amounts when changing cost center
                    basicAmount: '0',
                    cgst: '0',
                    sgst: '0',
                    igst: '0',
                    total: 0,
                    isIntraState
                };
    
                console.log('Updated Balance:', newBalances[index]); // Debug log
                
                return {
                    ...prev,
                    costCenterBalances: newBalances
                };
            });
        }
    }, [ccCodes, formData.registeredAddress.state]);

    const removeCostCenterBalance = useCallback((index) => {
        setFormData(prev => ({
            ...prev,
            costCenterBalances: prev.costCenterBalances.filter((_, i) => i !== index)
        }));
    }, []);

    const validateForm = useCallback(() => {
        const errors = [];

        if (!formData.mainClientId) errors.push('Main Client is required');
        if (!formData.gstNumber) errors.push('GST Number is required');
        if (!formData.registeredAddress.street) errors.push('Street address is required');
        if (!formData.registeredAddress.city) errors.push('City is required');
        if (!formData.registeredAddress.state) errors.push('State is required');
        if (!formData.registeredAddress.pincode) errors.push('Pincode is required');

        if (formData.hasOpeningBalance) {
            if (!formData.balanceAsOn) errors.push('Balance As On date is required');
            if (formData.costCenterBalances.length === 0) {
                errors.push('At least one cost center balance is required');
            }
        }

        if (errors.length > 0) {
            showToast('error', errors[0]);
            return false;
        }
        return true;
    }, [formData]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (validateForm()) {
            dispatch(createSubClient(formData));
        }
    }, [dispatch, formData, validateForm]);

    useEffect(() => {
        if (success.createSubClient) {
            showToast('success', 'Sub-client created successfully');
            setFormData(initialFormState);
            dispatch(clearSuccess());
        }
    }, [success.createSubClient, dispatch, initialFormState]);

    useEffect(() => {
        if (error.createSubClient) {
            showToast('error', error.createSubClient);
            dispatch(clearErrors());
        }
    }, [error.createSubClient, dispatch]);

    return (
        <div className="container mx-auto p-4 py-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Create Sub-Client</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Client Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Main Client Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Main Client <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="mainClientId"
                                        value={formData.mainClientId}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        required
                                    >
                                        <option value="">Select Main Client</option>
                                        {activeClients.map(client => (
                                            <option key={client._id} value={client._id}>
                                                {client.clientName} ({client.clientCode})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        GST Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="gstNumber"
                                        value={formData.gstNumber}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        maxLength={15}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Registered Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Registered Address</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Street Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.registeredAddress.street}
                                        onChange={(e) => handleAddressChange('street', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            City <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.registeredAddress.city}
                                            onChange={(e) => handleAddressChange('city', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            State <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.registeredAddress.state}
                                            onChange={(e) => handleAddressChange('state', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                            required
                                        >
                                            <option value="">Select State</option>
                                            {ccstate[0]?.states?.map((state) => (
                                                <option key={state.code} value={state.code}>
                                                    {state.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Pincode <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.registeredAddress.pincode}
                                            onChange={(e) => handleAddressChange('pincode', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                            pattern="[0-9]{6}"
                                            maxLength={6}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Country
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.registeredAddress.country}
                                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Opening Balance Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Opening Balance</CardTitle>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="hasOpeningBalance"
                                        checked={formData.hasOpeningBalance}
                                        onChange={handleChange}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm text-gray-600">Has Opening Balance</span>
                                </label>
                            </div>
                        </CardHeader>
                        {formData.hasOpeningBalance && (
                            <CardContent>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Balance As On <span className="text-red-500">*</span>
                                        </label>
                                        <CustomDatePicker
                                         selectedDate={formData.balanceAsOn} // Pass the UTC string directly
                                             onChange={handleDateChange}
                                           label=""
                                             placeholder='Select Date'
                                          disabled={!formData.hasOpeningBalance}
                                             maxDate={new Date().toISOString()} // Convert maxDate to UTC string
/>
                                    </div>

                                    <div className="space-y-4">
                                    <div className="flex justify-between items-center">
    <h4 className="text-lg font-medium">Cost Center Balances</h4>
    <button
        type="button"
        onClick={handleCostCenterBalanceAdd}
        disabled={!ccCodes || ccCodes.length === 0} 
        className={`flex items-center text-sm text-indigo-600 hover:text-indigo-800 ${
            (!ccCodes || ccCodes.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
    >
        <FaPlus className="mr-1" /> Add Cost Center
    </button>
</div>
                                  
                                        {formData.costCenterBalances.map((balance, index) => (
                                            <div key={index} className="p-4 border rounded-lg bg-white space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h5 className="font-medium">Cost Center {index + 1}</h5>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCostCenterBalance(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Cost Center <span className="text-red-500">*</span>
                                                        </label>
                                                        <select
    value={balance.ccCode}
    onChange={(e) => handleCostCenterSelect(index, e.target.value)}
    className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md ${
        (!ccCodes || ccCodes.length === 0) ? 'cursor-wait opacity-50' : ''
    }`}
    required={formData.hasOpeningBalance}
    disabled={!ccCodes || ccCodes.length === 0}
>
    <option value="">
        {!ccCodes || ccCodes.length === 0 ? 'Loading Cost Centers...' : 'Select Cost Center'}
    </option>
    {ccCodes && ccCodes.length > 0 && ccCodes.map(cc => (
        <option key={cc.value} value={cc.value}>
            {cc.label}
        </option>
    ))}
</select>
{ccCodesError && (
    <p className="mt-1 text-sm text-red-600">
        Error loading cost centers. Please try again.
    </p>
)}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Basic Amount <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={balance.basicAmount}
                                                            onChange={(e) => handleCostCenterBalanceChange(index, 'basicAmount', e.target.value)}
                                                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                                            required={formData.hasOpeningBalance}
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                    {balance.isIntraState ? ( <>
            <div>
                <label className="block text-sm font-medium text-gray-700">CGST</label>
                <input
                    type="number"
                    value={balance.cgst}
                    onChange={(e) => handleCostCenterBalanceChange(index, 'cgst', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                    min="0"
                    step="0.01"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">SGST</label>
                <input
                    type="number"
                    value={balance.sgst}
                    onChange={(e) => handleCostCenterBalanceChange(index, 'sgst', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                    min="0"
                    step="0.01"
                />
            </div>
            <div className="opacity-50">
                <label className="block text-sm font-medium text-gray-700">IGST</label>
                <input
                    type="number"
                    value="0"
                    disabled
                    className="mt-1 block w-full px-3 py-2 bg-gray-100 border rounded-md cursor-not-allowed"
                />
            </div>
        </>) : ( <>
            <div className="opacity-50">
                <label className="block text-sm font-medium text-gray-700">CGST</label>
                <input
                    type="number"
                    value="0"
                    disabled
                    className="mt-1 block w-full px-3 py-2 bg-gray-100 border rounded-md cursor-not-allowed"
                />
            </div>
            <div className="opacity-50">
                <label className="block text-sm font-medium text-gray-700">SGST</label>
                <input
                    type="number"
                    value="0"
                    disabled
                    className="mt-1 block w-full px-3 py-2 bg-gray-100 border rounded-md cursor-not-allowed"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">IGST</label>
                <input
                    type="number"
                    value={balance.igst}
                    onChange={(e) => handleCostCenterBalanceChange(index, 'igst', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                    min="0"
                    step="0.01"
                />
            </div>
        </>)}

                                                </div>
                                                <div className="flex justify-end">
                                                    <div className="text-right">
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Total
                                                        </label>
                                                        <span className="block mt-1 text-lg font-semibold text-indigo-600">
                                                            ₹ {balance.total.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* Remarks */}
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
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2"
                                    placeholder="Enter any additional remarks..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={() => setFormData(initialFormState)}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={loading.createSubClient}
                            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 
                                ${loading.createSubClient ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading.createSubClient ? 'Creating...' : 'Create Sub-Client'}
                        </button>
                    </div>
                </form>

                {/* Loading Overlay */}
                {loading.createSubClient && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-5 rounded-lg flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                            <span className="text-lg font-medium text-gray-700">Creating Sub-Client...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubClientCreation;