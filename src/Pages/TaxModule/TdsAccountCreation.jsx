import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from '../../Components/Card';
import { createNewTdsAccount, checkTdsAccountUniqueness, resetTdsAccountState } from '../../Slices/tdsAccountSlices';
import { fetchAccountGroups } from '../../Slices/groupSlices';
import { showToast } from '../../utilities/toastUtilities';
import CustomDatePicker from '../../Components/CustomDatePicker';
import { FaPercentage, FaBuilding, FaUser, FaUsers } from "react-icons/fa";

const TdsAccountCreation = () => {
    const dispatch = useDispatch();
    const { loading, error, success, isTdsAccountUnique } = useSelector((state) => state.tds);
    const { groups } = useSelector((state) => state.group);

    const initialFormState = useMemo(() => ({
        tdsAccountName: '',
        tdsAccountSec: '',
        accountingGroupId: '',
        openingBalance: 0,
        openingBalanceAsOn: new Date(),
        taxRules: {
            individual: '',
            huf: '',
            companiesAndFirms: '',
            others: ''
        },
        remarks: ''
    }), []);

    const [formData, setFormData] = useState(initialFormState);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [touchedFields, setTouchedFields] = useState({
        tdsAccountName: false
    });

    const handleReset = useCallback(() => {
        if (isFormDirty && window.confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
            setFormData(initialFormState);
            setIsFormDirty(false);
            setTouchedFields({ tdsAccountName: false });
            dispatch(resetTdsAccountState());
            showToast('info', 'Form has been reset');
        }
    }, [initialFormState, isFormDirty, dispatch]);

    useEffect(() => {
        if (success) {
            showToast('success', 'TDS Account created successfully');
            setFormData(initialFormState);
            setIsFormDirty(false);
            setTouchedFields({ tdsAccountName: false });
            dispatch(resetTdsAccountState());
        }
    }, [success, dispatch, initialFormState]);

    useEffect(() => {
        if (error) {
            showToast('error', error.message || 'An error occurred while creating the TDS account');
            dispatch(resetTdsAccountState());
        }
    }, [error, dispatch]);

    useEffect(() => {
        dispatch(fetchAccountGroups());
    }, [dispatch]);

    const validateForm = useCallback(() => {
        const requiredFields = [
            'tdsAccountName',
            'tdsAccountSec',
            'accountingGroupId'
        ];

        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            showToast('error', `Please fill all required fields: ${missingFields.join(', ')}`);
            return false;
        }

        if (isTdsAccountUnique === false) {
            showToast('error', 'Account name already exists');
            return false;
        }

        const taxRules = formData.taxRules;
        for (const rule in taxRules) {
            if (!taxRules[rule] || taxRules[rule] < 0 || taxRules[rule] > 100) {
                showToast('error', `Please enter valid tax percentage for ${rule} (0-100)`);
                return false;
            }
        }

        return true;
    }, [formData, isTdsAccountUnique]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                await dispatch(createNewTdsAccount(formData)).unwrap();
            } catch (err) {
                showToast('error', err.message || 'Failed to create TDS account');
            }
        }
    }, [dispatch, formData, validateForm]);

    const handleAccountCheck = useCallback(async (accountName) => {
        try {
            await dispatch(checkTdsAccountUniqueness(accountName)).unwrap();
        } catch (err) {
            showToast('error', 'Failed to check account name uniqueness');
        }
    }, [dispatch]);

    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouchedFields(prev => ({
            ...prev,
            [name]: true
        }));

        if (name === 'tdsAccountName' && formData.tdsAccountName) {
            handleAccountCheck(formData.tdsAccountName);
        }
    }, [formData.tdsAccountName, handleAccountCheck]);

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
                [name]: type === 'number' ? parseFloat(value) || 0 : value
            }));
        }
    }, []);

    const handleDateChange = useCallback((date) => {
        setIsFormDirty(true);
        setFormData(prev => ({
            ...prev,
            openingBalanceAsOn: date
        }));
    }, []);

    return (
        <div className="container mx-auto p-4 py-8 bg-white rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Create TDS Account</h2>

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
                                    TDS Account Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="tdsAccountName"
                                    value={formData.tdsAccountName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                    required
                                />
                                {touchedFields.tdsAccountName && isTdsAccountUnique === false && (
                                    <p className="mt-1 text-sm text-red-600">This account name already exists</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    TDS Section <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="tdsAccountSec"
                                    value={formData.tdsAccountSec}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tax Rules */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tax Rules</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="p-4 border rounded-lg bg-white shadow-sm">
                                <div className="flex items-center mb-3">
                                    <FaUser className="w-5 h-5 text-blue-600 mr-2" />
                                    <label className="block text-sm font-medium text-gray-700">
                                        Individual (%) <span className="text-red-500">*</span>
                                    </label>
                                </div>
                                <input
                                    type="number"
                                    name="taxRules.individual"
                                    value={formData.taxRules.individual}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 border rounded-md"
                                    min="0"
                                    max="100"
                                    required
                                />
                            </div>

                            <div className="p-4 border rounded-lg bg-white shadow-sm">
                                <div className="flex items-center mb-3">
                                    <FaUsers className="w-5 h-5 text-green-600 mr-2" />
                                    <label className="block text-sm font-medium text-gray-700">
                                        HUF (%) <span className="text-red-500">*</span>
                                    </label>
                                </div>
                                <input
                                    type="number"
                                    name="taxRules.huf"
                                    value={formData.taxRules.huf}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 border rounded-md"
                                    min="0"
                                    max="100"
                                    required
                                />
                            </div>

                            <div className="p-4 border rounded-lg bg-white shadow-sm">
                                <div className="flex items-center mb-3">
                                    <FaBuilding className="w-5 h-5 text-purple-600 mr-2" />
                                    <label className="block text-sm font-medium text-gray-700">
                                        Companies & Firms (%) <span className="text-red-500">*</span>
                                    </label>
                                </div>
                                <input
                                    type="number"
                                    name="taxRules.companiesAndFirms"
                                    value={formData.taxRules.companiesAndFirms}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 border rounded-md"
                                    min="0"
                                    max="100"
                                    required
                                />
                            </div>

                            <div className="p-4 border rounded-lg bg-white shadow-sm">
                                <div className="flex items-center mb-3">
                                    <FaPercentage className="w-5 h-5 text-orange-600 mr-2" />
                                    <label className="block text-sm font-medium text-gray-700">
                                        Others (%) <span className="text-red-500">*</span>
                                    </label>
                                </div>
                                <input
                                    type="number"
                                    name="taxRules.others"
                                    value={formData.taxRules.others}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 border rounded-md"
                                    min="0"
                                    max="100"
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Opening Balance
                                </label>
                                <div className="relative mt-1">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        name="openingBalance"
                                        value={formData.openingBalance}
                                        onChange={handleChange}
                                        className="block w-full pl-7 pr-12 py-2 border rounded-md"
                                    />
                                </div>
                            </div>

                            <div>
                                <CustomDatePicker
                                    selectedDate={formData.openingBalanceAsOn}
                                    onChange={handleDateChange}
                                    label="Balance As On Date"
                                />
                            </div>

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
                                    {groups
                                        .filter(group => group.natureId === 4) // Filter for Liability
                                        .map(group => (
                                            <option key={group._id} value={group._id}>
                                                {group.groupName}
                                            </option>
                                        ))}
                                </select>
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
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={loading || isTdsAccountUnique === false}
                        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 ${(loading || isTdsAccountUnique === false) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? 'Creating...' : 'Create TDS Account'}
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

export default TdsAccountCreation;