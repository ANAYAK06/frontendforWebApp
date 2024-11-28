import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewFixedDeposit, checkFDAccountUniqueness, resetFDState } from '../../Slices/fixedDepositSlices';
import { fetchAccountGroups } from '../../Slices/groupSlices';
import { fetchAllBankAccounts } from '../../Slices/bankAccountSlices';
import { showToast } from '../../utilities/toastUtilities';
import CustomDatePicker from '../../Components/CustomDatePicker';
import { FaCalculator } from "react-icons/fa6";
import { Card, CardContent, CardHeader, CardTitle } from '../../Components/Card';
import { FaRegMoneyBillAlt, FaClock, FaUniversity, FaPercentage } from "react-icons/fa";

const FixedDepositCreation = () => {
    const dispatch = useDispatch();
    const { loading, error, success, isFDAccountUnique } = useSelector((state) => state.fixedDeposit);
    const { groups } = useSelector((state) => state.group);
    const { bankAccounts } = useSelector((state) => state.bankAccount);

    const initialFormState = useMemo(() => ({
        fdType: '',
        updateType: '',
        bankName: '',
        accountNumber: '',
        depositAmount: '',
        tenure: {
            years: 0,
            months: 0,
            days: 0
        },
        rateOfInterest: '',
        interestPayout: '',
        depositDate: new Date(),
        linkedBankAccount: '',
        accountingGroupId: '',
        autoRenewal: {
            isEnabled: false,
            renewalPeriod: {
                years: 0,
                months: 0,
                days: 0
            }
        },
        fdBalance: '',
        balanceAsOn: new Date(),
        remarks: ''
    }), []);

    const [formData, setFormData] = useState(initialFormState);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [touchedFields, setTouchedFields] = useState({
        accountNumber: false
    });
    const [calculatedMaturity, setCalculatedMaturity] = useState(null);
    const [showMaturitySummary, setShowMaturitySummary] = useState(false);

    const handleReset = useCallback(() => {
        if (isFormDirty && window.confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
            setFormData(initialFormState);
            setIsFormDirty(false);
            setTouchedFields({ accountNumber: false });
            setCalculatedMaturity(null);
            setShowMaturitySummary(false);
            dispatch(resetFDState());
            showToast('info', 'Form has been reset');
        }
    }, [initialFormState, isFormDirty, dispatch]);

    const silentReset = useCallback(() => {
        setFormData(initialFormState);
        setIsFormDirty(false);
        setTouchedFields({ accountNumber: false });
        setCalculatedMaturity(null);
        setShowMaturitySummary(false);
        dispatch(resetFDState());
    }, [initialFormState, dispatch]);

    useEffect(() => {
        if (success) {
            showToast('success', 'Fixed Deposit created successfully');
            silentReset();
            dispatch(resetFDState());
        }
    }, [success, dispatch, silentReset]);

    useEffect(() => {
        if (error) {
            showToast('error', error.message || 'An error occurred while creating the fixed deposit');
            dispatch(resetFDState());
        }
    }, [error, dispatch]);

    useEffect(() => {
        dispatch(fetchAccountGroups());
        dispatch(fetchAllBankAccounts());
    }, [dispatch]);

    const validateForm = useCallback(() => {
        const requiredFields = [
            'fdType',
            'updateType',
            'bankName',
            'accountNumber',
            'depositAmount',
            'rateOfInterest',
            'interestPayout',
            'linkedBankAccount',
            'accountingGroupId'
        ];

        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            showToast('error', `Please fill all required fields: ${missingFields.join(', ')}`);
            return false;
        }

        if (isFDAccountUnique === false) {
            showToast('error', 'Account number already exists');
            return false;
        }

        const totalTenure = formData.tenure.years * 12 + formData.tenure.months + (formData.tenure.days / 30);
        if (totalTenure <= 0) {
            showToast('error', 'Please specify a valid tenure');
            return false;
        }
        if (formData.updateType === 'existing' && (!formData.fdBalance || !formData.balanceAsOn)) {
            showToast('error', 'Please fill FD balance and balance as on date for existing FD');
            return false;
        }

        return true;
    }, [formData, isFDAccountUnique]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                await dispatch(createNewFixedDeposit(formData)).unwrap();
            } catch (err) {
                showToast('error', err.message || 'Failed to create fixed deposit');
            }
        }
    }, [dispatch, formData, validateForm]);

    const handleAccountCheck = useCallback(async (accountNumber) => {
        try {
            const result = await dispatch(checkFDAccountUniqueness(accountNumber)).unwrap();
            if (!result) {
                showToast('error', 'This account number is already in use');
            }
        } catch (err) {
            showToast('error', 'Failed to check account number uniqueness');
        }
    }, [dispatch]);

    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouchedFields(prev => ({
            ...prev,
            [name]: true
        }));

        if (name === 'accountNumber' && formData.accountNumber) {
            handleAccountCheck(formData.accountNumber);
        }
    }, [formData.accountNumber, handleAccountCheck]);

    const handleChange = useCallback((e) => {
        const { name, value, type } = e.target;
        setIsFormDirty(true);

        if (name.includes('.')) {
            const [parent, child, subChild] = name.split('.');
            if (subChild) {
                setFormData(prev => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: {
                            ...prev[parent][child],
                            [subChild]: type === 'number' ? parseFloat(value) || 0 : value
                        }
                    }
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: type === 'number' ? parseFloat(value) || 0 : value
                    }
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? parseFloat(value) || 0 : value
            }));
        }
    }, []);

    const handleDateChange = useCallback((date, fieldName) => {
        setIsFormDirty(true);
        setFormData(prev => ({
            ...prev,
            [fieldName]: date
        }));
    }, []);

    const calculateMaturity = useCallback(() => {
        const principal = parseFloat(formData.depositAmount);
        const rate = parseFloat(formData.rateOfInterest) / 100;
        const years = formData.tenure.years + (formData.tenure.months / 12) + (formData.tenure.days / 365);

        if (!principal || !rate || !years) {
            showToast('error', 'Please fill amount, interest rate, and tenure');
            return;
        }

        try {
            let maturityAmount;
            if (formData.interestPayout === 'cumulative') {
                // Compound interest
                maturityAmount = principal * Math.pow(1 + (rate / 4), 4 * years);
            } else {
                // Simple interest
                maturityAmount = principal + (principal * rate * years);
            }

            setCalculatedMaturity({
                amount: Math.round(maturityAmount),
                interest: Math.round(maturityAmount - principal),
                maturityDate: new Date(formData.depositDate).setFullYear(
                    new Date(formData.depositDate).getFullYear() + formData.tenure.years,
                    new Date(formData.depositDate).getMonth() + formData.tenure.months,
                    new Date(formData.depositDate).getDate() + formData.tenure.days
                )
            });
            setShowMaturitySummary(true);
        } catch (err) {
            showToast('error', 'Error calculating maturity amount. Please check your inputs.');
        }
    }, [formData.depositAmount, formData.rateOfInterest, formData.tenure, formData.interestPayout, formData.depositDate]);

    return (
        <div className="container mx-auto p-4 py-8 bg-white rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Create Fixed Deposit</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Update Type Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Update Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                onClick={() => handleChange({ target: { name: 'updateType', value: 'new' } })}
                                className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${formData.updateType === 'new'
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 hover:border-indigo-200'
                                    }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-indigo-100 rounded-full">
                                        <FaRegMoneyBillAlt className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">New Fixed Deposit</h3>
                                        <p className="text-sm text-gray-500">Create a new fixed deposit</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                onClick={() => handleChange({ target: { name: 'updateType', value: 'existing' } })}
                                className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${formData.updateType === 'existing'
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 hover:border-indigo-200'
                                    }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-indigo-100 rounded-full">
                                        <FaClock className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Existing Fixed Deposit</h3>
                                        <p className="text-sm text-gray-500">Record an existing fixed deposit</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* FD Type Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Fixed Deposit Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { value: 'regular', label: 'Regular FD', icon: FaUniversity },
                                { value: 'taxSaver', label: 'Tax Saver FD', icon: FaPercentage },
                                { value: 'cumulative', label: 'Cumulative FD', icon: FaRegMoneyBillAlt },
                                { value: 'nonCumulative', label: 'Non-Cumulative FD', icon: FaClock }
                            ].map(type => (
                                <div
                                    key={type.value}
                                    onClick={() => handleChange({ target: { name: 'fdType', value: type.value } })}
                                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${formData.fdType === type.value
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
                                    Bank Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleChange}
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
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                    required
                                />
                                {touchedFields.accountNumber && isFDAccountUnique === false && (
                                    <p className="mt-1 text-sm text-red-600">This account number already exists</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Deposit Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Deposit Amount <span className="text-red-500">*</span>
                                </label>
                                <div className="relative mt-1">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        name="depositAmount"
                                        value={formData.depositAmount}
                                        onChange={handleChange}
                                        className="block w-full pl-7 pr-12 py-2 border rounded-md"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Years <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="tenure.years"
                                        value={formData.tenure.years}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        min="0"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Months <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="tenure.months"
                                        value={formData.tenure.months}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        min="0"
                                        max="11"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Days <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="tenure.days"
                                        value={formData.tenure.days}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        min="0"
                                        max="30"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Interest Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Interest Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={calculateMaturity}
                                    className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                                >
                                    <FaCalculator className="w-4 h-4 mr-2" />
                                    Calculate Maturity Amount
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Rate of Interest (% p.a.) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="rateOfInterest"
                                        value={formData.rateOfInterest}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        required
                                        step="0.01"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Interest Payout <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="interestPayout"
                                        value={formData.interestPayout}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        required
                                    >
                                        <option value="">Select Payout Frequency</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="halfYearly">Half Yearly</option>
                                        <option value="yearly">Yearly</option>
                                        <option value="onMaturity">On Maturity</option>
                                    </select>
                                </div>
                            </div>

                            {/* Maturity Calculation Summary */}
                            {calculatedMaturity && (
                                <div className="bg-indigo-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-indigo-900 mb-2">Maturity Calculation Summary</h4>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Maturity Amount</p>
                                            <p className="text-indigo-900 font-semibold">
                                                ₹{calculatedMaturity.amount.toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Total Interest</p>
                                            <p className="text-indigo-900 font-semibold">
                                                ₹{calculatedMaturity.interest.toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Maturity Date</p>
                                            <p className="text-indigo-900 font-semibold">
                                                {new Date(calculatedMaturity.maturityDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Bank & Account Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Bank & Account Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Linked Bank Account <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="linkedBankAccount"
                                    value={formData.linkedBankAccount}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                    required
                                >
                                    <option value="">Select Bank Account</option>
                                    {bankAccounts.map(account => (
                                        <option key={account._id} value={account._id}>
                                            {account.bankName} - {account.accountNumber}
                                        </option>
                                    ))}
                                </select>
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
                                        .filter(group => group.natureId === 3) // Filter for Asset groups
                                        .map(group => (
                                            <option key={group._id} value={group._id}>
                                                {group.groupName}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div>
                                <CustomDatePicker
                                    selectedDate={formData.depositDate}
                                    onChange={(date) => handleDateChange(date, 'depositDate')}
                                    label={<>Deposit Date <span className="text-red-500">*</span></>}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {formData.updateType === 'existing' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Existing FD Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Current FD Balance <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative mt-1">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                                        <input
                                            type="number"
                                            name="fdBalance"
                                            value={formData.fdBalance}
                                            onChange={handleChange}
                                            className="block w-full pl-7 pr-12 py-2 border rounded-md"
                                            required={formData.updateType === 'existing'}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <CustomDatePicker
                                        selectedDate={formData.balanceAsOn}
                                        onChange={(date) => handleDateChange(date, 'balanceAsOn')}
                                        label={<>Balance As On Date <span className="text-red-500">*</span></>}
                                        required={formData.updateType === 'existing'}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Auto Renewal */}
                <Card>
                    <CardHeader>
                        <CardTitle>Auto Renewal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="autoRenewal.isEnabled"
                                    checked={formData.autoRenewal.isEnabled}
                                    onChange={(e) => handleChange({
                                        target: {
                                            name: 'autoRenewal.isEnabled',
                                            value: e.target.checked
                                        }
                                    })}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">
                                    Enable Auto Renewal
                                </label>
                            </div>

                            {formData.autoRenewal.isEnabled && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Years</label>
                                        <input
                                            type="number"
                                            name="autoRenewal.renewalPeriod.years"
                                            value={formData.autoRenewal.renewalPeriod.years}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Months</label>
                                        <input
                                            type="number"
                                            name="autoRenewal.renewalPeriod.months"
                                            value={formData.autoRenewal.renewalPeriod.months}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                            min="0"
                                            max="11"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Days</label>
                                        <input
                                            type="number"
                                            name="autoRenewal.renewalPeriod.days"
                                            value={formData.autoRenewal.renewalPeriod.days}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                            min="0"
                                            max="30"
                                        />
                                    </div>
                                </div>
                            )}
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
                        disabled={loading || isFDAccountUnique === false}
                        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 ${(loading || isFDAccountUnique === false) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? 'Creating...' : 'Create Fixed Deposit'}
                    </button>
                </div>
            </form>
            {showMaturitySummary && calculatedMaturity && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full mx-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Maturity Summary Details</h3>
                            <button
                                onClick={() => setShowMaturitySummary(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-indigo-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Maturity Amount</p>
                                <p className="text-2xl font-bold text-indigo-600">
                                    ₹{calculatedMaturity.amount.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Calculated Interest</p>
                                <p className="text-2xl font-bold text-green-600">
                                    ₹{calculatedMaturity.interest.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Matuirity Date</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {new Date(calculatedMaturity.maturityDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            <p className="mb-2">
                                * The interest amount is calculated based on the provided  amount,
                                interest rate, and tenure.
                            </p>
                            <p>
                                * Actual maturity  amount may vary based on the closing date and
                                other charges.
                            </p>
                        </div>
                        <div className="mt-6 text-right">
                            <button
                                onClick={() => setShowMaturitySummary(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

export default FixedDepositCreation;
