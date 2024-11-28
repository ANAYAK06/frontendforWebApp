

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewBankAccount, resetBankAccountState, checkBankAccountUniqueness } from '../../Slices/bankAccountSlices';
import { fetchAccountGroups } from '../../Slices/groupSlices';
import { showToast } from '../../utilities/toastUtilities';
import CustomDatePicker from '../../Components/CustomDatePicker';

function BankCreation() {
    const dispatch = useDispatch();
    const { loading, error, success, isBankAccountUnique } = useSelector((state) => state.bankAccount);
    const { groups, loading: groupsLoading } = useSelector((state) => state.group);

    const initialFormState = useMemo(() => ({
        accountType: '',
        bankName: '',
        branch: '',
        accountNumber: '',
        accountOpeningDate: new Date(),
        balanceAsOn: new Date(),
        accountingGroupId: '',
        ifscCode: '',
        micrCode: '',
        branchAddress: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'  // Default value
        },
        contactNumber: '',
        enabledForOnlineTransaction: false,
        creditCard: {
            hasCard: false,
            cardNumber: '',
            validThru: new Date()
        },
        openingBalance: 0,
        minimumBalance: 0,
        remarks: ''
    }), []);

    const [formData, setFormData] = useState(initialFormState);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [touchedFields, setTouchedFields] = useState({
        accountNumber: false,
        ifscCode: false,
        openingBalance: false,
        minimumBalance: false

    })

    // Reset form handler
    const handleReset = useCallback(() => {
        if (isFormDirty) {
            if (window.confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
                setFormData(initialFormState);
                setIsFormDirty(false);
            }
        } else {
            setFormData(initialFormState);
        }
    }, [initialFormState, isFormDirty]);

    const silentReset = useCallback(() => {
        setFormData(initialFormState);
        setIsFormDirty(false);
        setTouchedFields({
            accountNumber: false,
            ifscCode: false,
            openingBalance: false,
            minimumBalance: false
        });
    }, [initialFormState]);

    // Fetch account groups on component mount
    useEffect(() => {
        dispatch(fetchAccountGroups());
    }, [dispatch]);

    const filteredGroups = useMemo(() => {
        return groups.filter(group => group.natureId === 3 || group.natureId === 4)
    }, [groups])

    const getDefaultGroup = useCallback((accountType) => {
        const natureId = accountType === 'OD' ? 4 : 3;
        return filteredGroups.find(group => group.natureId === natureId)?._id || ''
    }, [filteredGroups])

    // Handle success message and form reset
    useEffect(() => {
        if (success) {
            showToast('success', 'Bank account submitted successfully');
            silentReset()

            dispatch(resetBankAccountState());
        }
    }, [success, dispatch, silentReset]);

    // Handle error messages
    useEffect(() => {
        if (error) {
            showToast('error', error);
        }
    }, [error]);

    // Validate IFSC Code format
    const validateIFSC = useCallback((ifscCode) => {
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        return ifscRegex.test(ifscCode);
    }, []);

    // Validate account number format
    const validateAccountNumber = useCallback((accountNumber) => {
        return /^\d{9,18}$/.test(accountNumber);
    }, []);

    // Handle form field changes
    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setIsFormDirty(true);

        if (name === 'accountType') {
            setFormData(prevState => ({
                ...prevState,
                accountType: value,
                accountingGroupId: getDefaultGroup(value)
            }))
        } else {
            if (name.includes('.')) {
                const [parent, child] = name.split('.');
                setFormData(prevState => ({
                    ...prevState,
                    [parent]: {
                        ...prevState[parent],
                        [child]: type === 'checkbox' ? checked : value
                    }
                }));
            } else {
                setFormData(prevState => ({
                    ...prevState,
                    [name]: type === 'checkbox' ? checked : value
                }));


            }

        }
    }, [getDefaultGroup]);

    const handleBlur = useCallback((e) => {
        const { name, value } = e.target;
        setTouchedFields(prev => ({
            ...prev,
            [name]: true
        }));

        // Validate IFSC code on blur
        if (name === 'ifscCode' && value) {
            if (!validateIFSC(value)) {
                showToast('warning', 'Please enter a valid IFSC code');
            }
        }

        // Validate account number on blur
        if (name === 'accountNumber' && value) {
            if (validateAccountNumber(value)) {
                dispatch(checkBankAccountUniqueness(value));
            } else {
                showToast('warning', 'Account number should be 9-18 digits');
            }
        }
        if ((name === 'openingBalance' || name === 'minimumBalance') &&
            touchedFields.openingBalance &&
            touchedFields.minimumBalance &&
            formData.accountType !== 'OD') {
            const opening = parseFloat(formData.openingBalance);
            const minimum = parseFloat(formData.minimumBalance);

            if (!isNaN(opening) && !isNaN(minimum) && opening < minimum) {
                showToast('warning', 'Opening balance cannot be less than minimum balance for non-OD accounts');
            }
        }
    }, [dispatch, validateIFSC, validateAccountNumber, formData.accountType, formData.openingBalance, formData.minimumBalance, touchedFields]);


    // Handle date changes
    const handleDateChange = useCallback((date, fieldName) => {
        setIsFormDirty(true);
        if (fieldName.includes('.')) {
            const [parent, child] = fieldName.split('.');
            setFormData(prevState => ({
                ...prevState,
                [parent]: {
                    ...prevState[parent],
                    [child]: date
                }
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                [fieldName]: date
            }));
        }
    }, []);

    // Validate form
    const validateForm = useCallback(() => {
        const requiredFields = ['accountType', 'bankName', 'branch', 'accountNumber', 'ifscCode'];
        const isRequiredFieldsFilled = requiredFields.every(field => formData[field]?.trim());

        if (!isRequiredFieldsFilled) {
            showToast('error', 'Please fill all required fields');
            return false;
        }

        if (!validateIFSC(formData.ifscCode)) {
            showToast('error', 'Invalid IFSC code format');
            return false;
        }

        if (!validateAccountNumber(formData.accountNumber)) {
            showToast('error', 'Invalid account number format');
            return false;
        }

        return true;
    }, [formData, validateIFSC, validateAccountNumber]);

    // Form submission handler
    const handleSubmit = useCallback((e) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (!formData.remarks.trim()) {
            showToast('warning', 'Please add remarks before submitting');
            return;
        }

        if (isBankAccountUnique === false) {
            showToast('error', 'Bank account number already exists');
            return;
        }



        dispatch(createNewBankAccount(formData));
    }, [formData, isBankAccountUnique, dispatch, validateForm]);

    const hasBalanceError = useCallback(() => {
        if (formData.accountType === 'OD') return false;
        if (!touchedFields.openingBalance || !touchedFields.minimumBalance) return false;

        const opening = parseFloat(formData.openingBalance);
        const minimum = parseFloat(formData.minimumBalance);

        return !isNaN(opening) && !isNaN(minimum) && opening < minimum;
    }, [formData.accountType, formData.openingBalance, formData.minimumBalance, touchedFields]);
    return (
        <div className="container mx-auto p-4 py-8 bg-white rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Create New Bank Account</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Bank Details Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Basic Bank Details</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="accountType" className="block text-sm font-medium text-gray-700">
                                Account Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="accountType"
                                name="accountType"
                                value={formData.accountType}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Select account type</option>
                                <option value="Savings">Savings</option>
                                <option value="Current">Current</option>
                                <option value="OD">OD</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
                                Bank Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="bankName"
                                name="bankName"
                                value={formData.bankName}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">
                                Account Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="accountNumber"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${touchedFields.accountNumber && (
                                    isBankAccountUnique === false
                                        ? 'border-red-500'
                                        : isBankAccountUnique === true
                                            ? 'border-green-500'
                                            : 'border-gray-300'
                                )
                                    }`}
                            />
                            {touchedFields.accountNumber && (
                                <>
                                    {isBankAccountUnique === false && (
                                        <p className="mt-1 text-sm text-red-600">This account number already exists</p>
                                    )}
                                    {formData.accountNumber && !validateAccountNumber(formData.accountNumber) && (
                                        <p className="mt-1 text-sm text-red-600">Account number should be 9-18 digits</p>
                                    )}
                                </>
                            )}
                        </div>

                        <div>
                            <CustomDatePicker
                                selectedDate={formData.accountOpeningDate}
                                onChange={(date) => handleDateChange(date, 'accountOpeningDate')}
                                label={<>Account Opening Date <span className="text-red-500">*</span></>}
                                placeholder="Choose a date"
                                minDate={new Date()} // Optional: Set minimum date
                                maxDate={new Date().setMonth(new Date().getMonth() + 6)} // Optional: Set maximum date
                                disabled={false}
                            />
                        </div>

                        <div>
                            <label htmlFor="accountingGroupId" className="block text-sm font-medium text-gray-700">
                                Account Group <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="accountingGroupId"
                                name="accountingGroupId"
                                value={formData.accountingGroupId}
                                onChange={handleChange}
                                required
                                disabled={groupsLoading}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {groupsLoading ? (
                                    <option value="">Loading groups...</option>
                                ) : (
                                    <>
                                        <option value="">Select a group</option>
                                        {filteredGroups.length > 0 ? (
                                            <>
                                                {/* Asset Groups */}
                                                <optgroup label="Asset Groups">
                                                    {filteredGroups
                                                        .filter(group => group.natureId === 3)
                                                        .map((group) => (
                                                            <option key={group._id} value={group._id}>
                                                                {group.groupName}
                                                            </option>
                                                        ))
                                                    }
                                                </optgroup>

                                                {/* Liability Groups */}
                                                <optgroup label="Liability Groups">
                                                    {filteredGroups
                                                        .filter(group => group.natureId === 4)
                                                        .map((group) => (
                                                            <option key={group._id} value={group._id}>
                                                                {group.groupName}
                                                            </option>
                                                        ))
                                                    }
                                                </optgroup>
                                            </>
                                        ) : (
                                            <option value="" disabled>No valid groups available</option>
                                        )}
                                    </>
                                )}
                            </select>
                            <p className="mt-1 text-sm text-gray-500">
                                {formData.accountType === 'OD' ?
                                    'Liability groups recommended for OD accounts' :
                                    'Asset groups recommended for Savings/Current accounts'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Balance Details Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Balance Details</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="openingBalance" className="block text-sm font-medium text-gray-700">
                                Opening Balance <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-[0.95rem] text-gray-500">₹</span>
                                <input
                                    type="number"
                                    id="openingBalance"
                                    name="openingBalance"
                                    value={formData.openingBalance}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    className={`mt-1 block w-full pl-8 px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${hasBalanceError() ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                            </div>

                        </div>

                        <div>
                            <label htmlFor="minimumBalance" className="block text-sm font-medium text-gray-700">
                                Minimum Balance <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-[0.95rem] text-gray-500">₹</span>
                                <input
                                    type="number"
                                    id="minimumBalance"
                                    name="minimumBalance"
                                    value={formData.minimumBalance}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    className={`mt-1 block w-full pl-8 px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${hasBalanceError() ? 'border-red-500' : 'border-gray-300'
                                        }`}

                                />
                            </div>
                        </div>
                        {hasBalanceError() && (
                            <div className="col-span-2">
                                <p className="text-sm text-red-600">
                                    Opening balance cannot be less than minimum balance for non-OD accounts
                                </p>
                            </div>
                        )}

                        <div>
                            <CustomDatePicker
                                selectedDate={formData.balanceAsOn}
                                onChange={(date) => handleDateChange(date, 'balanceAsOn')}
                                label={<>Balance As On <span className="text-red-500">*</span></>}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Branch Details</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                                Branch Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="branch"
                                name="branch"
                                value={formData.branch}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700">
                                IFSC Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="ifscCode"
                                name="ifscCode"
                                value={formData.ifscCode}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                placeholder="e.g., HDFC0001234"
                                className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${touchedFields.ifscCode && formData.ifscCode && !validateIFSC(formData.ifscCode)
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                    }`}
                            />
                            {touchedFields.ifscCode && formData.ifscCode && !validateIFSC(formData.ifscCode) && (
                                <p className="mt-1 text-sm text-red-600">
                                    Please enter a valid IFSC code (e.g., HDFC0001234)
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="micrCode" className="block text-sm font-medium text-gray-700">MICR Code</label>
                            <input
                                type="text"
                                id="micrCode"
                                name="micrCode"
                                value={formData.micrCode}
                                onChange={handleChange}
                                placeholder="9-digit MICR code"
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number</label>
                            <input
                                type="tel"
                                id="contactNumber"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                placeholder="Branch contact number"
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div className="col-span-2">
                            <h4 className="text-md font-medium text-gray-700 mb-2">Branch Address</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <input
                                        type="text"
                                        name="branchAddress.street"
                                        value={formData.branchAddress.street}
                                        onChange={handleChange}
                                        placeholder="Street"
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="branchAddress.city"
                                        value={formData.branchAddress.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="branchAddress.state"
                                        value={formData.branchAddress.state}
                                        onChange={handleChange}
                                        placeholder="State"
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="branchAddress.pincode"
                                        value={formData.branchAddress.pincode}
                                        onChange={handleChange}
                                        placeholder="Pincode"
                                        pattern="[0-9]{6}"
                                        title="Please enter a valid 6-digit pincode"
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Options Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Additional Options</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="enabledForOnlineTransaction"
                                name="enabledForOnlineTransaction"
                                checked={formData.enabledForOnlineTransaction}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="enabledForOnlineTransaction" className="ml-2 block text-sm text-gray-700">
                                Enable Online Transactions
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="creditCard.hasCard"
                                name="creditCard.hasCard"
                                checked={formData.creditCard.hasCard}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="creditCard.hasCard" className="ml-2 block text-sm text-gray-700">
                                Has Credit Card
                            </label>
                        </div>

                        {formData.creditCard.hasCard && (
                            <div className="col-span-2 grid grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="creditCard.cardNumber" className="block text-sm font-medium text-gray-700">
                                        Card Number
                                    </label>
                                    <input
                                        type="text"
                                        id="creditCard.cardNumber"
                                        name="creditCard.cardNumber"
                                        value={formData.creditCard.cardNumber}
                                        onChange={handleChange}
                                        pattern="[0-9]{16}"
                                        placeholder="16-digit card number"
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <CustomDatePicker
                                        selectedDate={formData.creditCard.validThru}
                                        onChange={(date) => handleDateChange(date, 'creditCard.validThru')}
                                        label="Valid Thru"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Remarks Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">
                        Remarks <span className="text-red-500">*</span>
                    </h3>
                    <div>
                        <textarea
                            id="remarks"
                            name="remarks"
                            rows="3"
                            value={formData.remarks}
                            onChange={handleChange}
                            required
                            placeholder="Add your remarks here"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        ></textarea>
                    </div>
                </div>

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
                        disabled={loading || isBankAccountUnique === false}
                        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${(loading || isBankAccountUnique === false) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? 'Creating...' : 'Create Bank Account'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default BankCreation;
