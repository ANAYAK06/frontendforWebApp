import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewLoan, resetLoanState, checkLoanNumberUniqueness } from '../../Slices/loanAccountSlices';
import { fetchAccountGroups } from '../../Slices/groupSlices';
import { fetchAllBankAccounts } from '../../Slices/bankAccountSlices';
import { showToast } from '../../utilities/toastUtilities';
import CustomDatePicker from '../../Components/CustomDatePicker';
import { FaCalculator } from "react-icons/fa6";
import { Card, CardContent, CardHeader, CardTitle } from '../../Components/Card'

import { FaShieldAlt, FaHandshake, FaRupeeSign, FaClock } from "react-icons/fa";

const LoanCreation = () => {
    const dispatch = useDispatch();
    const { loading, error, success, isLoanNumberUnique } = useSelector((state) => state.loan);
    const { groups } = useSelector((state) => state.group);
    const { bankAccounts } = useSelector((state) => state.bankAccount);

    const initialFormState = useMemo(() => ({
        updateType: '',
        loanType: '',
        lenderName: '',
        lenderType: '',
        loanPurpose: '',
        loanNumber: '',
        disbursementDate: new Date(),
        loanAmount: '',
        charges: {
            processingFee: 0,
            documentationCharges: 0,
            insuranceCharges: 0,
            otherCharges: 0
        },
        rateOfInterest: '',
        numberOfInstallments: '',
        emiStartDate: new Date(),
        linkedBankAccount: '',
        amountReceiptType: '',
        accountingGroupId: '',
        disbursedAmount: 0,
        openingBalanceAsOn: new Date(),
        currentBalance: '',
        securityDetails: {
            assetType: '',
            assetValue: '',
            assetDescription: '',
            documentNumbers: []
        },
        remarks: ''
    }), []);

    const [formData, setFormData] = useState(initialFormState);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [touchedFields, setTouchedFields] = useState({
        loanNumber: false,
        loanAmount: false,
        rateOfInterest: false
    });
    const [calculatedEMI, setCalculatedEMI] = useState(null);
    const [showEmiSummary, setShowEmiSummary] = useState(false);
 


    const handleReset = useCallback(() => {
        if (isFormDirty && window.confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
            setFormData(initialFormState);
            setIsFormDirty(false);
            setTouchedFields({
                loanNumber: false,
                loanAmount: false,
                rateOfInterest: false
            });
            setCalculatedEMI(null);
            setShowEmiSummary(false);
            dispatch(resetLoanState());
            showToast('info', 'Form has been reset');
        }
    }, [initialFormState, isFormDirty, dispatch]);

    const silentReset = useCallback(() =>{
        setFormData(initialFormState);
        setIsFormDirty(false);
        setTouchedFields({
            loanNumber: false,
            loanAmount: false,
            rateOfInterest: false
        });
        setCalculatedEMI(null);
        setShowEmiSummary(false);
        dispatch(resetLoanState());

    })

    // Success Handler
    useEffect(() => {
        if (success) {
            showToast('success', 'Loan created successfully');
            silentReset()
            dispatch(resetLoanState());
        }
    }, [success, dispatch, handleReset]);

    // Error Handler
    useEffect(() => {
        if (error) {
            showToast('error', error.message || 'An error occurred while creating the loan');
            dispatch(resetLoanState());
        }
    }, [error, dispatch]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            dispatch(resetLoanState());
        };
    }, [dispatch]);

    // Calculate disbursed amount
    useEffect(() => {
        if (formData.loanAmount && formData.updateType === 'new') {
            const totalCharges = Object.values(formData.charges).reduce((sum, charge) => sum + (charge || 0), 0);
            const disbursedAmount = parseFloat(formData.loanAmount) - totalCharges;
            setFormData(prev => ({
                ...prev,
                disbursedAmount: disbursedAmount
            }));
        }
    }, [formData.loanAmount, formData.charges, formData.updateType]);

    // Handle update type changes
    useEffect(() => {
        if (formData.updateType === 'new' && formData.loanAmount) {
            setFormData(prev => ({
                ...prev,
                currentBalance: prev.loanAmount,
                balanceAsOnDate: prev.disbursementDate
            }));
        }
    }, [formData.updateType, formData.loanAmount, formData.disbursementDate]);

    // Load initial data
    useEffect(() => {
        dispatch(fetchAccountGroups());
        dispatch(fetchAllBankAccounts());
    }, [dispatch]);

    const validateForm = useCallback(() => {
        const requiredFields = [
            'loanNumber',
            'loanAmount',
            'rateOfInterest',
            'lenderName',
            'lenderType',
            'loanPurpose',
            'numberOfInstallments',
            'linkedBankAccount',
            'accountingGroupId',
            'amountReceiptType'
        ];

        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            showToast('error', `Please fill all required fields: ${missingFields.join(', ')}`);
            return false;
        }

        if (isLoanNumberUnique === false) {
            showToast('error', 'Loan number already exists');
            return false;
        }

        if (formData.loanType === 'secured' &&
            (!formData.securityDetails.assetType ||
                !formData.securityDetails.assetValue ||
                !formData.securityDetails.assetDescription)) {
            showToast('error', 'Please fill all security details for secured loan');
            return false;
        }

        return true;
    }, [formData, isLoanNumberUnique]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const result = await dispatch(createNewLoan(formData)).unwrap();
                if (result) {
                    setFormData(initialFormState);
                    setCalculatedEMI(null);
                    setShowEmiSummary(false);
                }
            } catch (err) {
                showToast('error', err.message || 'Failed to create loan');
            }
        }
    }, [dispatch, formData, validateForm, initialFormState]);

    const handleLoanNumberCheck = useCallback(async (loanNumber) => {
        try {
            const result = await dispatch(checkLoanNumberUniqueness(loanNumber)).unwrap();
            if (!result) {
                showToast('error', 'This loan number is already in use');
            }
        } catch (err) {
            showToast('error', 'Failed to check loan number uniqueness');
        }
    }, [dispatch]);

    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouchedFields(prev => ({
            ...prev,
            [name]: true
        }));

        if (name === 'loanNumber' && formData.loanNumber) {
            handleLoanNumberCheck(formData.loanNumber);
        }
    }, [formData.loanNumber, handleLoanNumberCheck]);



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

    const handleDateChange = useCallback((date, fieldName) => {
        setIsFormDirty(true);
        setFormData(prev => ({
            ...prev,
            [fieldName]: date
        }));
    }, []);

    const calculateEMI = useCallback(() => {
        const P = parseFloat(formData.loanAmount);
        const R = parseFloat(formData.rateOfInterest) / (12 * 100);
        const N = parseInt(formData.numberOfInstallments);

        if (!P || !R || !N) {
            showToast('error', 'Please fill loan amount, interest rate, and number of installments');
            return;
        }

        try {
            const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
            setCalculatedEMI({
                monthly: Math.round(emi),
                total: Math.round(emi * N),
                interest: Math.round((emi * N) - P)
            });
            setShowEmiSummary(true);
        } catch (err) {
            showToast('error', 'Error calculating EMI. Please check your inputs.');
        }
    }, [formData.loanAmount, formData.rateOfInterest, formData.numberOfInstallments]);





    return (
        <div className="container mx-auto p-4 py-8 bg-white rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Create New Loan</h2>

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
                                        <FaRupeeSign className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">New Loan</h3>
                                        <p className="text-sm text-gray-500">Create a new loan entry</p>
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
                                        <h3 className="font-semibold text-lg">Existing Loan</h3>
                                        <p className="text-sm text-gray-500">Record an existing loan</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Loan Type Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Loan Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                onClick={() => handleChange({ target: { name: 'loanType', value: 'secured' } })}
                                className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${formData.loanType === 'secured'
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-gray-200 hover:border-indigo-200'
                                    }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-indigo-100 rounded-full">
                                        <FaShieldAlt className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Secured Loan</h3>
                                        <p className="text-sm text-gray-500">Backed by collateral</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                onClick={() => handleChange({ target: { name: 'loanType', value: 'unsecured' } })}
                                className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${formData.loanType === 'unsecured'
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-gray-200 hover:border-indigo-200'
                                    }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-indigo-100 rounded-full">
                                        <FaHandshake className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Unsecured Loan</h3>
                                        <p className="text-sm text-gray-500">Based on creditworthiness</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Basic Loan Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Loan Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="loanNumber"
                                    value={formData.loanNumber}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                    required
                                />
                                {touchedFields.loanNumber && isLoanNumberUnique === false && (
                                    <p className="mt-1 text-sm text-red-600">This loan number already exists</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Lender Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="lenderName"
                                    value={formData.lenderName}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Lender Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="lenderType"
                                    value={formData.lenderType}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                    required
                                >
                                    <option value="">Select Lender Type</option>
                                    <option value="bank">Bank</option>
                                    <option value="agency">Agency</option>
                                    <option value="director">Director</option>
                                    <option value="individual">Individual</option>
                                    <option value="others">Others</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Loan Purpose <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="loanPurpose"
                                    value={formData.loanPurpose}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                    required
                                >
                                    <option value="">Select Purpose</option>
                                    <option value="workingCapital">Working Capital</option>
                                    <option value="assetPurchase">Asset Purchase</option>
                                    <option value="others">Others</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {/* Amount Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Amount Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Loan Amount <span className="text-red-500">*</span>
                                </label>
                                <div className="relative mt-1">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        name="loanAmount"
                                        value={formData.loanAmount}
                                        onChange={handleChange}
                                        className="block w-full pl-7 pr-12 py-2 border rounded-md"
                                        required
                                    />
                                </div>
                            </div>

                            {formData.updateType === 'new' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Processing Fee</label>
                                        <div className="relative mt-1">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                                            <input
                                                type="number"
                                                name="charges.processingFee"
                                                value={formData.charges.processingFee}
                                                onChange={handleChange}
                                                className="block w-full pl-7 pr-12 py-2 border rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Documentation Charges</label>
                                        <div className="relative mt-1">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                                            <input
                                                type="number"
                                                name="charges.documentationCharges"
                                                value={formData.charges.documentationCharges}
                                                onChange={handleChange}
                                                className="block w-full pl-7 pr-12 py-2 border rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Insurance Charges</label>
                                        <div className="relative mt-1">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                                            <input
                                                type="number"
                                                name="charges.insuranceCharges"
                                                value={formData.charges.insuranceCharges}
                                                onChange={handleChange}
                                                className="block w-full pl-7 pr-12 py-2 border rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Other Charges</label>
                                        <div className="relative mt-1">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                                            <input
                                                type="number"
                                                name="charges.otherCharges"
                                                value={formData.charges.otherCharges}
                                                onChange={handleChange}
                                                className="block w-full pl-7 pr-12 py-2 border rounded-md"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Disbursed Amount Display */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Disbursed Amount:</span>
                                    <span className="text-lg font-semibold text-indigo-600">
                                        ₹{formData.disbursedAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Current Balance for Existing Loans */}
                            {formData.updateType === 'existing' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Current Balance <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative mt-1">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                                            <input
                                                type="number"
                                                name="currentBalance"
                                                value={formData.currentBalance}
                                                onChange={handleChange}
                                                className="block w-full pl-7 pr-12 py-2 border rounded-md"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <CustomDatePicker
                                            selectedDate={formData.balanceAsOnDate}
                                            onChange={(date) => handleDateChange(date, 'balanceAsOnDate')}
                                            label={<>Balance As On Date <span className="text-red-500">*</span></>}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* EMI Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>EMI Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={calculateEMI}
                                    className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                                >
                                    <FaCalculator className="w-4 h-4 mr-2" />
                                    Calculate EMI
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
                                        Number of Installments <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="numberOfInstallments"
                                        value={formData.numberOfInstallments}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        required
                                    />
                                </div>

                                <div>
                                    <CustomDatePicker
                                        selectedDate={formData.emiStartDate}
                                        onChange={(date) => handleDateChange(date, 'emiStartDate')}
                                        label={<>EMI Start Date <span className="text-red-500">*</span></>}
                                    />
                                </div>
                            </div>

                            {/* Persistent EMI Summary */}
                            {calculatedEMI && (
                                <div className="bg-indigo-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-indigo-900 mb-2">EMI Calculation Summary</h4>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Monthly EMI</p>
                                            <p className="text-indigo-900 font-semibold">₹{calculatedEMI.monthly.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Total Interest</p>
                                            <p className="text-indigo-900 font-semibold">₹{calculatedEMI.interest.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Total Amount</p>
                                            <p className="text-indigo-900 font-semibold">₹{calculatedEMI.total.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Bank and Account Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Bank & Account Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        .filter(group => group.natureId === 4)
                                        .map(group => (
                                            <option key={group._id} value={group._id.toString()}>
                                                {group.groupName}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>

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
                                <CustomDatePicker
                                    selectedDate={formData.disbursementDate}
                                    onChange={(date) => handleDateChange(date, 'disbursementDate')}
                                    label={<>Disbursement Date <span className="text-red-500">*</span></>}
                                />
                            </div>

                            <div>
                                <CustomDatePicker
                                    selectedDate={formData.openingBalanceAsOn}
                                    onChange={(date) => handleDateChange(date, 'openingBalanceAsOn')}
                                    label={<>Opening Balance As On <span className="text-red-500">*</span></>}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Amount Receipt Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="amountReceiptType"
                                    value={formData.amountReceiptType}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                    required
                                >
                                    <option value="">Select Receipt Type</option>
                                    <option value="bankAccount">Bank Account</option>
                                    <option value="thirdParty">Third Party</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Details - Only shown for secured loans */}
                {formData.loanType === 'secured' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Asset Type <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="securityDetails.assetType"
                                        value={formData.securityDetails.assetType}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Asset Value <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative mt-1">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                                        <input
                                            type="number"
                                            name="securityDetails.assetValue"
                                            value={formData.securityDetails.assetValue}
                                            onChange={handleChange}
                                            className="block w-full pl-7 pr-12 py-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Asset Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="securityDetails.assetDescription"
                                        value={formData.securityDetails.assetDescription}
                                        onChange={handleChange}
                                        rows="3"
                                        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                        required
                                    ></textarea>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

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
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={loading || isLoanNumberUnique === false}
                        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${(loading || isLoanNumberUnique === false) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? 'Creating...' : 'Create Loan'}
                    </button>
                </div>
            </form>

            {/* EMI Calculation Popup */}
            {showEmiSummary && calculatedEMI && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full mx-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">EMI Details</h3>
                            <button
                                onClick={() => setShowEmiSummary(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-indigo-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Monthly EMI</p>
                                <p className="text-2xl font-bold text-indigo-600">
                                    ₹{calculatedEMI.monthly.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Total Interest</p>
                                <p className="text-2xl font-bold text-green-600">
                                    ₹{calculatedEMI.interest.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    ₹{calculatedEMI.total.toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            <p className="mb-2">
                                * The EMI amount is calculated based on the provided loan amount,
                                interest rate, and tenure.
                            </p>
                            <p>
                                * Actual EMI amount may vary based on the disbursement date and
                                other charges.
                            </p>
                        </div>
                        <div className="mt-6 text-right">
                            <button
                                onClick={() => setShowEmiSummary(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}



            {/* Processing Overlay */}
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

export default LoanCreation;