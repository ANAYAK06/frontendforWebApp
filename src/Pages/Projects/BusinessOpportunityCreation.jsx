import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewOpportunity, resetOpportunityState } from '../../Slices/businessOppertunitySlices';
import { showToast } from '../../utilities/toastUtilities';
import CustomDatePicker from '../../Components/CustomDatePicker';
import { Card, CardContent, CardHeader, CardTitle } from '../../Components/Card';
import { FaBuilding, FaFileContract, FaHandshake, FaUserTie } from "react-icons/fa";

const BusinessOpportunityCreation = () => {
    const dispatch = useDispatch();
    const { loading, error, success } = useSelector((state) => state.businessOpportunity);

    const initialFormState = useMemo(() => ({
        type: '',
        descriptionOfWork: '',
        submissionDate: new Date(),
        client: {
            name: '',
            contactPerson: '',
            phone: '',
            email: '',
            address: ''
        },
        ultimateCustomer: {
            name: '',
            industry: '',
            sector: ''
        },
        opportunityType: '',
        businessCategory: '',
        estimatedValue: '',
        tenderDetails: {
            tenderNumber: '',
            tenderDate: new Date(),
            emdRequired: false,
            emdDetails: {
                amount: 0,
                type: 'BG'
            }
        },
        jointVentureAcceptable: false,
        jointVentureDetails: {
            companyName: '',
            registrationNumber: '',
            sharePercentage: '',
            contactPerson: '',
            contactEmail: '',
            contactPhone: ''
        },
         remarks: ''
    }), []);

    const [formData, setFormData] = useState(initialFormState);
    const [isFormDirty, setIsFormDirty] = useState(false);

    const handleReset = useCallback(() => {
        if (isFormDirty && window.confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
            setFormData(initialFormState);
            setIsFormDirty(false);
            dispatch(resetOpportunityState());
            showToast('info', 'Form has been reset');
        }
    }, [initialFormState, isFormDirty, dispatch]);

    useEffect(() => {
        if (success) {
            showToast('success', 'Business opportunity created successfully');
            setFormData(initialFormState);
            dispatch(resetOpportunityState());
        }
    }, [success, dispatch, initialFormState]);

    useEffect(() => {
        if (error) {
            showToast('error', error.message || 'An error occurred');
            dispatch(resetOpportunityState());
        }
    }, [error, dispatch]);
    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setIsFormDirty(true);
    
        if (name.includes('.')) {
            const parts = name.split('.');
            if (parts.length === 3) {
                // Handle deeply nested objects (like tenderDetails.emdDetails.amount)
                setFormData(prev => ({
                    ...prev,
                    [parts[0]]: {
                        ...prev[parts[0]],
                        [parts[1]]: {
                            ...prev[parts[0]][parts[1]],
                            [parts[2]]: type === 'number' ? parseFloat(value) || 0 : value
                        }
                    }
                }));
            } else {
                // Handle single level nested objects
                const [parent, child] = parts;
                if (name === 'tenderDetails.emdRequired') {
                    setFormData(prev => ({
                        ...prev,
                        tenderDetails: {
                            ...prev.tenderDetails,
                            emdRequired: checked,
                            // Reset EMD details when unchecking
                            emdDetails: checked ? prev.tenderDetails.emdDetails : {
                                amount: 0,
                                type: 'BG'
                            }
                        }
                    }));
                } else {
                    setFormData(prev => ({
                        ...prev,
                        [parent]: {
                            ...prev[parent],
                            [child]: type === 'checkbox' ? checked : value
                        }
                    }));
                }
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    }, []);

   

    

    const handleDateChange = useCallback((date, fieldName) => {
        setIsFormDirty(true);
        if (fieldName.includes('.')) {
            const [parent, child] = fieldName.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: date
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [fieldName]: date
            }));
        }
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        try {
            await dispatch(createNewOpportunity(formData)).unwrap();
        } catch (err) {
            showToast('error', err.message || 'Failed to create opportunity');
        }
    }, [dispatch, formData]);

    return (
        <div className="container mx-auto p-4 py-8 bg-white rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Create Business Opportunity</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Opportunity Type Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Opportunity Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                onClick={() => handleChange({ target: { name: 'type', value: 'TENDER' } })}
                                className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${formData.type === 'TENDER'
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 hover:border-indigo-200'
                                    }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-indigo-100 rounded-full">
                                        <FaFileContract className="w-6 h-6 text-indigo-600" /> {/* For Tender */}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Tender</h3>
                                        <p className="text-sm text-gray-500">Bid for a tender opportunity</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                onClick={() => handleChange({ target: { name: 'type', value: 'PROPOSAL' } })}
                                className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${formData.type === 'PROPOSAL'
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 hover:border-indigo-200'
                                    }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-indigo-100 rounded-full">
                                        <FaHandshake className="w-6 h-6 text-indigo-600" /> {/* For Proposal */}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Proposal</h3>
                                        <p className="text-sm text-gray-500">Direct business proposal</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Client Details */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <FaUserTie className="w-5 h-5 text-indigo-600" />
                            <CardTitle>Client Details</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Client Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="client.name"
                                    value={formData.client.name}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Contact Person <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="client.contactPerson"
                                    value={formData.client.contactPerson}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="client.phone"
                                    value={formData.client.phone}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                    required
                                    pattern="[+]?[0-9]{10,13}"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="client.email"
                                    value={formData.client.email}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                    required
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="client.address"
                                    value={formData.client.address}
                                    onChange={handleChange}
                                    rows="3"
                                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                    required
                                ></textarea>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Opportunity Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Opportunity Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Description of Work <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="descriptionOfWork"
                                    value={formData.descriptionOfWork}
                                    onChange={handleChange}
                                    rows="4"
                                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                    required
                                    minLength="10"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Opportunity Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="opportunityType"
                                    value={formData.opportunityType}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                    required
                                >
                                    <option value="">Select Type</option>
                                    <option value="EPC">EPC</option>
                                    <option value="ETC">ETC</option>
                                    <option value="MANUFACTURING">Manufacturing</option>
                                    <option value="TRADING">Trading</option>
                                    <option value="SERVICES">Services</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Business Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="businessCategory"
                                    value={formData.businessCategory}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="E&I">E&I</option>
                                    <option value="HVSS">HVSS</option>
                                    <option value="CIVIL">Civil</option>
                                    <option value="O&M">O&M</option>
                                    <option value="WU">WU</option>
                                    <option value="MECH">Mechanical</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Estimated Value <span className="text-red-500">*</span>
                                </label>
                                <div className="relative mt-1">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        name="estimatedValue"
                                        value={formData.estimatedValue}
                                        onChange={handleChange}
                                        className="block w-full pl-7 pr-12 py-2 border rounded-md"
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <CustomDatePicker
                                    selectedDate={formData.submissionDate}
                                    onChange={(date) => handleDateChange(date, 'submissionDate')}
                                    label={<>Submission Date <span className="text-red-500">*</span></>}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tender Details - Conditional Rendering */}
                {formData.type === 'TENDER' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Tender Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Tender Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="tenderDetails.tenderNumber"
                                        value={formData.tenderDetails.tenderNumber}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        required
                                    />
                                </div>

                                <div>
                                    <CustomDatePicker
                                        selectedDate={formData.tenderDetails.tenderDate}
                                        onChange={(date) => handleDateChange(date, 'tenderDetails.tenderDate')}
                                        label={<>Tender Date <span className="text-red-500">*</span></>}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            name="tenderDetails.emdRequired"
                                            checked={formData.tenderDetails.emdRequired}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                                        />
                                        <label className="text-sm font-medium text-gray-700">
                                            EMD Required
                                        </label>
                                    </div>
                                </div>

                                {formData.tenderDetails.emdRequired && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                EMD Amount <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative mt-1">
                                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                                                <input
                                                    type="number"
                                                    name="tenderDetails.emdDetails.amount"
                                                    value={formData.tenderDetails.emdDetails.amount}
                                                    onChange={handleChange}
                                                    className="block w-full pl-7 pr-12 py-2 border rounded-md"
                                                    required
                                                    min="0"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                EMD Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="tenderDetails.emdDetails.type"
                                                value={formData.tenderDetails.emdDetails.type}
                                                onChange={handleChange}
                                                className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                                required
                                            >
                                                <option value="BG">Bank Guarantee</option>
                                                <option value="DD">Demand Draft</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Ultimate Customer Details - Required for Tender */}
                {formData.type === 'TENDER' && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <FaBuilding className="w-5 h-5 text-indigo-600" />
                                <CardTitle>Ultimate Customer Details</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Customer Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="ultimateCustomer.name"
                                        value={formData.ultimateCustomer.name}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Industry
                                    </label>
                                    <input
                                        type="text"
                                        name="ultimateCustomer.industry"
                                        value={formData.ultimateCustomer.industry}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Sector <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="ultimateCustomer.sector"
                                        value={formData.ultimateCustomer.sector}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        required
                                    >
                                        <option value="">Select Sector</option>
                                        <option value="PUBLIC">Public</option>
                                        <option value="PRIVATE">Private</option>
                                        <option value="GOVERNMENT">Government</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Joint Venture Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Joint Venture Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="jointVentureAcceptable"
                                    checked={formData.jointVentureAcceptable}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                                />
                                <label className="text-sm font-medium text-gray-700">
                                    Joint Venture Acceptable
                                </label>
                            </div>

                            {formData.jointVentureAcceptable && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Company Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="jointVentureDetails.companyName"
                                            value={formData.jointVentureDetails.companyName}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Registration Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="jointVentureDetails.registrationNumber"
                                            value={formData.jointVentureDetails.registrationNumber}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Share Percentage <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="jointVentureDetails.sharePercentage"
                                            value={formData.jointVentureDetails.sharePercentage}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                            required
                                            min="0"
                                            max="100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Contact Person <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="jointVentureDetails.contactPerson"
                                            value={formData.jointVentureDetails.contactPerson}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Contact Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="jointVentureDetails.contactEmail"
                                            value={formData.jointVentureDetails.contactEmail}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Contact Phone <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="jointVentureDetails.contactPhone"
                                            value={formData.jointVentureDetails.contactPhone}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                            required
                                            pattern="[+]?[0-9]{10,13}"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Remarks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                            placeholder="Add your remarks here"
                            required
                        ></textarea>
                    </CardContent>
                </Card>


                {/* Form Actions */}
                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? 'Creating...' : 'Create Opportunity'}
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

export default BusinessOpportunityCreation;