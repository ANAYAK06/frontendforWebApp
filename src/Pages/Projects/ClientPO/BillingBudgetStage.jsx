import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../Components/Card'
import CustomDatePicker from '../../../Components/CustomDatePicker';

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

const BillingBudgetStage = ({ formData, onUpdate, onNext, onBack }) => {
    const [errors, setErrors] = useState({
        billingPlan: '',
        'budgetAllocation.method': '',
        'budgetAllocation.percentage': '',
        'billingPlanDetails.completionPercentages': '',
        'billingPlanDetails.customDates': ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            onUpdate({
                [parent]: {
                    ...formData[parent],
                    [child]: type === 'checkbox' ? checked : value
                }
            });
        } else {
            onUpdate({
                [name]: type === 'checkbox' ? checked : value
            });
        }
        
        // Clear error for this field
        if (name.includes('.')) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        } else {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleCompletionPercentagesChange = (e) => {
        const percentages = e.target.value.split(',').map(p => p.trim()).filter(Boolean).map(Number);
        onUpdate({
            billingPlanDetails: {
                ...formData.billingPlanDetails,
                completionPercentages: percentages
            }
        });
        setErrors(prev => ({ ...prev, 'billingPlanDetails.completionPercentages': '' }));
    };

    const handleCustomDatesChange = (dates) => {
        onUpdate({
            billingPlanDetails: {
                ...formData.billingPlanDetails,
                customDates: dates
            }
        });
        setErrors(prev => ({ ...prev, 'billingPlanDetails.customDates': '' }));
    };

    const addCustomDate = () => {
        const dates = [...formData.billingPlanDetails.customDates, new Date()];
        handleCustomDatesChange(dates);
    };

    const removeCustomDate = (index) => {
        const dates = [...formData.billingPlanDetails.customDates];
        dates.splice(index, 1);
        handleCustomDatesChange(dates);
    };

    const updateCustomDate = (index, date) => {
        const dates = [...formData.billingPlanDetails.customDates];
        dates[index] = date;
        handleCustomDatesChange(dates);
    };

    const validateForm = () => {
        const newErrors = {
            billingPlan: formData.billingPlan ? '' : 'Billing Plan is required',
            'budgetAllocation.method': formData.budgetAllocation.method ? '' : 'Budget Allocation Method is required',
            'budgetAllocation.percentage': formData.budgetAllocation.percentage > 0 ? '' : 'Budget Allocation Percentage is required'
        };

        // Validate completion percentages if Completion_Based is selected
        if (formData.billingPlan === 'Completion_Based') {
            const percentages = formData.billingPlanDetails.completionPercentages;
            if (!percentages || percentages.length === 0) {
                newErrors['billingPlanDetails.completionPercentages'] = 'Completion percentages are required';
            } else if (!percentages.includes(100)) {
                newErrors['billingPlanDetails.completionPercentages'] = 'Completion percentages must include 100%';
            }
        }

        // Validate custom dates if Custom is selected
        if (formData.billingPlan === 'Custom') {
            const dates = formData.billingPlanDetails.customDates;
            if (!dates || dates.length === 0) {
                newErrors['billingPlanDetails.customDates'] = 'Custom billing dates are required';
            }
        }

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
                <div className="space-y-6">
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
                                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md"
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
                                        className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md ${
                                            errors.billingPlan ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Select Billing Plan</option>
                                        {BILLING_PLANS.map(plan => (
                                            <option key={plan.value} value={plan.value}>
                                                {plan.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.billingPlan && (
                                        <p className="mt-1 text-sm text-red-500">{errors.billingPlan}</p>
                                    )}
                                </div>

                                {formData.billingPlan === 'Completion_Based' && (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Completion Percentages <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter comma-separated percentages (e.g., 25,50,75,100)"
                                            value={formData.billingPlanDetails.completionPercentages.join(',')}
                                            onChange={handleCompletionPercentagesChange}
                                            className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md ${
                                                errors['billingPlanDetails.completionPercentages'] ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors['billingPlanDetails.completionPercentages'] && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors['billingPlanDetails.completionPercentages']}
                                            </p>
                                        )}
                                        <p className="mt-1 text-sm text-gray-500">
                                            Enter percentages at which billing should occur (must include 100%).
                                        </p>
                                    </div>
                                )}

                                {formData.billingPlan === 'Custom' && (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Custom Billing Dates <span className="text-red-500">*</span>
                                        </label>
                                        
                                        {formData.billingPlanDetails.customDates.length > 0 ? (
                                            <div className="space-y-2">
                                                {formData.billingPlanDetails.customDates.map((date, index) => (
                                                    <div key={index} className="flex items-center space-x-2">
                                                        <CustomDatePicker
                                                            selected={new Date(date)}
                                                            onChange={(newDate) => updateCustomDate(index, newDate)}
                                                            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCustomDate(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 mb-2">No custom dates added yet.</p>
                                        )}
                                        
                                        <button
                                            type="button"
                                            onClick={addCustomDate}
                                            className="mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-indigo-600 hover:bg-gray-50"
                                        >
                                            Add Billing Date
                                        </button>
                                        
                                        {errors['billingPlanDetails.customDates'] && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors['billingPlanDetails.customDates']}
                                            </p>
                                        )}
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
                                        className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md ${
                                            errors['budgetAllocation.method'] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Select Method</option>
                                        {BUDGET_METHODS.map(method => (
                                            <option key={method.value} value={method.value}>
                                                {method.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors['budgetAllocation.method'] && (
                                        <p className="mt-1 text-sm text-red-500">{errors['budgetAllocation.method']}</p>
                                    )}
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
                                        className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md ${
                                            errors['budgetAllocation.percentage'] ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        min="0"
                                        max="100"
                                    />
                                    {errors['budgetAllocation.percentage'] && (
                                        <p className="mt-1 text-sm text-red-500">{errors['budgetAllocation.percentage']}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-between pt-6">
                        <button
                            type="button"
                            onClick={onBack}
                            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BillingBudgetStage;