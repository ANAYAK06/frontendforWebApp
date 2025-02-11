import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createClient, clearErrors, clearSuccess } from '../../Slices/accountsModuleSlices/clientSlices';
import { fetchAccountGroups } from '../../Slices/groupSlices';
import { fetchStates } from '../../Slices/stateSlices';
import { showToast } from '../../utilities/toastUtilities';
import { Card, CardHeader, CardTitle, CardContent } from '../../Components/Card';
import { 
    FaBuilding, 
    FaUserTie, 
    FaTrash,
    FaPlus,
    FaHandshake,
    FaPrayingHands,
    FaUsers
} from 'react-icons/fa';
import { FaBuildingUser } from "react-icons/fa6"
import { HiOfficeBuilding } from 'react-icons/hi';

const CLIENT_TYPES = [
    { value: 'Individual', label: 'Individual', icon: FaUserTie },
    { value: 'Proprietorship', label: 'Proprietorship', icon: FaBuildingUser },
    { value: 'Partnership', label: 'Partnership', icon: FaHandshake },
    { value: 'PrivateLimited', label: 'Private Limited', icon: FaBuilding },
    { value: 'PublicLimited', label: 'Public Limited', icon: HiOfficeBuilding },
    { value: 'Government', label: 'Government', icon: HiOfficeBuilding },
    { value: 'Trust', label: 'Trust', icon: FaPrayingHands },
    { value: 'Society', label: 'Society', icon: FaUsers }
];

const GST_TYPES = [
    { value: 'Regular', label: 'Regular' },
    { value: 'Composite', label: 'Composite' },
    { value: 'Unregistered', label: 'Unregistered' }
];

const ClientCreation = () => {
    const dispatch = useDispatch();
    const { loading, error, success } = useSelector((state) => state.client);
    const { groups } = useSelector((state) => state.group);
    const { ccstate } = useSelector((state) => state.ccstate);

    const initialFormState = useMemo(() => ({
        clientName: '',
        clientType: '',
        gstType: '',
        pan: '',
        mainGstNumber: '',
        accountingGroupId: '',
        registeredAddress: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
        },
        corporateAddress: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
        },
        contactPersons: [{
            name: '',
            designation: '',
            email: '',
            phone: '',
            isActive: true
        }],
        bankAccounts: [{
            accountName: '',
            accountNumber: '',
            bankName: '',
            branchName: '',
            ifscCode: '',
            isDefault: true
        }],
        creditPeriod: 0,
        creditLimit: 0,
        clientStatus: 'Active',
        remarks: ''
    }), []);

    const [formData, setFormData] = useState(initialFormState);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [sameAsRegistered, setSameAsRegistered] = useState(false);

    useEffect(() => {
        dispatch(fetchAccountGroups());
        dispatch(fetchStates());
        
    }, [dispatch]);
    const handleReset = useCallback(() => {
        if (isFormDirty && window.confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
            setFormData(initialFormState);
            setIsFormDirty(false);
            setSameAsRegistered(false);
        }
    }, [initialFormState, isFormDirty]);


    useEffect(() => {
        if (success.create) {
            showToast('success', 'Client created successfully');
            handleReset();
            dispatch(clearSuccess());
        }
    }, [success.create, dispatch, handleReset]);

    useEffect(() => {
        if (error.create) {
            showToast('error', error.create);
            dispatch(clearErrors());
        }
    }, [error.create, dispatch]);
    

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

    const handleArrayChange = useCallback((index, field, subfield, value) => {
        setIsFormDirty(true);
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => 
                i === index ? { ...item, [subfield]: value } : item
            )
        }));
    }, []);

    

    const addArrayItem = useCallback((field, defaultItem) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], defaultItem]
        }));
    }, []);

    const removeArrayItem = useCallback((field, index) => {
        if (index === 0) {
            showToast('error', 'Cannot remove primary entry');
            return;
        }
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    }, []);

    const handleAddressChange = useCallback((type, field, value) => {
        setIsFormDirty(true);
        setFormData(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value
            }
        }));

        if (sameAsRegistered && type === 'registeredAddress') {
            setFormData(prev => ({
                ...prev,
                corporateAddress: {
                    ...prev.corporateAddress,
                    [field]: value
                }
            }));
        }
    }, [sameAsRegistered]);

    const handleSameAsRegistered = useCallback((e) => {
        const checked = e.target.checked;
        setSameAsRegistered(checked);
        if (checked) {
            setFormData(prev => ({
                ...prev,
                corporateAddress: {...prev.registeredAddress}
            }));
        }
    }, []);

    const validateForm = useCallback(() => {
        const errors = [];

        // Basic validations
        if (!formData.clientName) errors.push('Client Name is required');
        if (!formData.clientType) errors.push('Client Type is required');
        if (!formData.accountingGroupId) errors.push('Accounting Group is required');

        // PAN validation for non-individual clients
        if (formData.clientType !== 'Individual' && formData.pan) {
            if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
                errors.push('Invalid PAN format');
            }
        }

        // GST validation
        if (formData.gstType !== 'Unregistered' && formData.mainGstNumber) {
            if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(formData.mainGstNumber)) {
                errors.push('Invalid GST Number format');
            }
        }

        // Address validation
        if (!formData.registeredAddress.street || !formData.registeredAddress.city || 
            !formData.registeredAddress.state || !formData.registeredAddress.pincode) {
            errors.push('Complete registered address is required');
        }

        // Validate at least one contact person
        if (!formData.contactPersons[0].name || !formData.contactPersons[0].phone) {
            errors.push('At least one contact person with name and phone is required');
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
            dispatch(createClient(formData));
        }
    }, [dispatch, formData, validateForm]);

 
    return (
        <div className="container mx-auto p-4 py-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Create Client</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Client Type Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {CLIENT_TYPES.map(type => (
                                    <div
                                        key={type.value}
                                        onClick={() => handleChange({ 
                                            target: { name: 'clientType', value: type.value } 
                                        })}
                                        className={`cursor-pointer p-4 rounded-lg border-2 transition-all
                                            ${formData.clientType === type.value
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-indigo-200'
                                            }`}
                                    >
                                        <div className="flex flex-col items-center space-y-2">
                                            <div className="p-2 bg-indigo-100 rounded-full">
                                                <type.icon className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <h3 className="font-medium text-center">{type.label}</h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Basic Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Client Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="clientName"
                                        value={formData.clientName}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        GST Type
                                    </label>
                                    <select
                                        name="gstType"
                                        value={formData.gstType}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                    >
                                        <option value="">Select GST Type</option>
                                        {GST_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {formData.clientType !== 'Individual' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            PAN Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="pan"
                                            value={formData.pan}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                            maxLength={10}
                                            required
                                        />
                                    </div>
                                )}

                                {formData.gstType !== 'Unregistered' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            GST Number
                                        </label>
                                        <input
                                            type="text"
                                            name="mainGstNumber"
                                            value={formData.mainGstNumber}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                            maxLength={15}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Accounting Group <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="accountingGroupId"
                                        value={formData.accountingGroupId}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        required
                                    >
                                        <option value="">Select Accounting Group</option>
                                        {groups.map(group => (
                                            <option key={group._id} value={group._id}>
                                                {group.groupName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address Section */}
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
                    onChange={(e) => handleAddressChange('registeredAddress', 'street', e.target.value)}
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
                        onChange={(e) => handleAddressChange('registeredAddress', 'city', e.target.value)}
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
                        onChange={(e) => handleAddressChange('registeredAddress', 'state', e.target.value)}
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
                        onChange={(e) => handleAddressChange('registeredAddress', 'pincode', e.target.value)}
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

{/* Corporate Address */}
<Card>
    <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle>Corporate Address</CardTitle>
            <label className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    checked={sameAsRegistered}
                    onChange={handleSameAsRegistered}
                    className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Same as Registered</span>
            </label>
        </div>
    </CardHeader>
    <CardContent>
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Street Address <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.corporateAddress.street}
                    onChange={(e) => handleAddressChange('corporateAddress', 'street', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                    disabled={sameAsRegistered}
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
                        value={formData.corporateAddress.city}
                        onChange={(e) => handleAddressChange('corporateAddress', 'city', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                        disabled={sameAsRegistered}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        State <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.corporateAddress.state}
                        onChange={(e) => handleAddressChange('corporateAddress', 'state', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                        disabled={sameAsRegistered}
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
                        value={formData.corporateAddress.pincode}
                        onChange={(e) => handleAddressChange('corporateAddress', 'pincode', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        disabled={sameAsRegistered}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Country
                    </label>
                    <input
                        type="text"
                        value={formData.corporateAddress.country}
                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                        disabled
                    />
                </div>
            </div>
        </div>
    </CardContent>
</Card>

                    {/* Contact Persons */}
                   {/* Contact Persons Section */}
<Card>
    <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle>Contact Persons</CardTitle>
            <button
                type="button"
                onClick={() => addArrayItem('contactPersons', {
                    name: '',
                    designation: '',
                    email: '',
                    phone: '',
                    isActive: true
                })}
                className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
            >
                <FaPlus className="mr-1" /> Add Contact Person
            </button>
        </div>
    </CardHeader>
    <CardContent>
        {formData.contactPersons.map((person, index) => (
            <div key={index} className="space-y-4 border-b pb-4 mb-4 last:border-0">
                <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium">Contact Person {index + 1}</h4>
                    {index > 0 && (
                        <button
                            type="button"
                            onClick={() => removeArrayItem('contactPersons', index)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <FaTrash />
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={person.name}
                            onChange={(e) => handleArrayChange(index, 'contactPersons', 'name', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Designation
                        </label>
                        <input
                            type="text"
                            value={person.designation}
                            onChange={(e) => handleArrayChange(index, 'contactPersons', 'designation', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            value={person.email}
                            onChange={(e) => handleArrayChange(index, 'contactPersons', 'email', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={person.phone}
                            onChange={(e) => handleArrayChange(index, 'contactPersons', 'phone', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                            pattern="[0-9]{10}"
                            maxLength={10}
                            required
                        />
                    </div>
                    <div>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={person.isActive}
                                onChange={(e) => handleArrayChange(index, 'contactPersons', 'isActive', e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-600">Active Contact</span>
                        </label>
                    </div>
                </div>
            </div>
        ))}
    </CardContent>
</Card>
<Card>
    <CardHeader>
        <CardTitle>Credit Details</CardTitle>
    </CardHeader>
    <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Credit Period (Days)
                </label>
                <input
                    type="number"
                    name="creditPeriod"
                    value={formData.creditPeriod}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                    min="0"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Credit Limit
                </label>
                <input
                    type="number"
                    name="creditLimit"
                    value={formData.creditLimit}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                    min="0"
                />
            </div>
        </div>
    </CardContent>
</Card>
<Card>
    <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle>Bank Accounts</CardTitle>
            <button
                type="button"
                onClick={() => addArrayItem('bankAccounts', {
                    accountName: '',
                    accountNumber: '',
                    bankName: '',
                    branchName: '',
                    ifscCode: '',
                    isDefault: true
                })}
                className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
            >
                <FaPlus className="mr-1" /> Add Bank Account
            </button>
        </div>
    </CardHeader>
    <CardContent>
        {formData.bankAccounts.map((account, index) => (
            <div key={index} className="space-y-4 border-b pb-4 mb-4 last:border-0">
                <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium">Bank Account {index + 1}</h4>
                    {index > 0 && (
                        <button
                            type="button"
                            onClick={() => removeArrayItem('bankAccounts', index)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <FaTrash />
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Account Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={account.accountName}
                            onChange={(e) => handleArrayChange(index, 'bankAccounts', 'accountName', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Account Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={account.accountNumber}
                            onChange={(e) => handleArrayChange(index, 'bankAccounts', 'accountNumber', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Bank Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={account.bankName}
                            onChange={(e) => handleArrayChange(index, 'bankAccounts', 'bankName', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Branch Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={account.branchName}
                            onChange={(e) => handleArrayChange(index, 'bankAccounts', 'branchName', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            IFSC Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={account.ifscCode}
                            onChange={(e) => handleArrayChange(index, 'bankAccounts', 'ifscCode', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={account.isDefault}
                                onChange={(e) => handleArrayChange(index, 'bankAccounts', 'isDefault', e.target.checked)}
                                className="rounded border-gray-300"
                                disabled={index === 0} // First account is always default
                            />
                            <span className="text-sm text-gray-600">Default Account</span>
                        </label>
                    </div>
                </div>
            </div>
        ))}
    </CardContent>
</Card>
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
                            disabled={loading.create}
                            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 
                                ${loading.create ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading.create ? 'Creating...' : 'Create Client'}
                        </button>
                    </div>
                </form>

                {/* Loading Overlay */}
                {loading.create && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-5 rounded-lg flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                            <span className="text-lg font-medium text-gray-700">Creating Client...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientCreation;