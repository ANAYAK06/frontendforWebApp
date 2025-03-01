import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../Components/Card';

import {
    FaBoxes,
    FaTools,
    FaCogs,
    FaPaperclip,
    FaCheckCircle,
    FaTimesCircle,
    FaExclamationTriangle
} from 'react-icons/fa';

const ReviewSubmitStage = ({
    formData,
    costCentres,
    wonBOQs,
    selectedClient,
    subClients,
    onSubmit,
    onBack,
    onReset,
    loading
}) => {
    // Find display names from IDs
    const selectedBOQ = wonBOQs.find(boq => boq._id === formData.boqId);
    const selectedCostCentre = costCentres.find(cc => cc._id === formData.costCentreId);
    
    // Calculate total amounts
    const totalItems = formData.items.length;
    const totalPOValue = formData.items.reduce((sum, item) => sum + (item.totalValue || 0), 0);
    
    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const selectedSubClient = subClients?.find(sc => sc._id === formData.subClientId);

    return (
        <div className="p-6">
            <div className="space-y-6">
                {/* Summary Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>PO Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-indigo-50 p-4 rounded-lg">
                                <p className="text-xs font-medium text-indigo-600 uppercase">PO Number</p>
                                <p className="mt-1 text-lg font-semibold">{formData.poNumber}</p>
                            </div>
                            <div className="bg-indigo-50 p-4 rounded-lg">
                                <p className="text-xs font-medium text-indigo-600 uppercase">Total Items</p>
                                <p className="mt-1 text-lg font-semibold text-right">{totalItems}</p>
                            </div>
                            <div className="bg-indigo-50 p-4 rounded-lg">
                                <p className="text-xs font-medium text-indigo-600 uppercase">Total Value</p>
                                <p className="mt-1 text-lg font-semibold text-right">{formatCurrency(totalPOValue)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2 bg-slate-300 p-2"><b>Basic Details</b></h4>
                                
                                <dl className="divide-y divide-gray-200">
                                    <div className="py-2 flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">PO Date</dt>
                                        <dd className="text-sm text-gray-900">{formData.poDate ? new Date(formData.poDate).toLocaleDateString() : 'N/A'}</dd>
                                    </div>
                                    <div className="py-2 flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Client</dt>
                                        <dd className="text-sm text-gray-900">{selectedClient?.clientName || 'N/A'} -{selectedClient.clientCode}</dd>
                                    </div>
                                    {selectedClient?.clientType !== 'Individual' && (
                                        <div className="py-2 flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Subclient</dt>
                                            <dd className="text-sm text-gray-900">
                                            {selectedSubClient ? `${selectedSubClient.subClientCode} - ${selectedSubClient.stateName || ''}` : 'N/A'}
                                            </dd>
                                        </div>
                                    )}
                                    <div className="py-2 flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">BOQ</dt>
                                        <dd className="text-sm text-gray-900">{selectedBOQ?.offerNumber || 'N/A'}</dd>
                                    </div>
                                    <div className="py-2 flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Cost Centre</dt>
                                        <dd className="text-sm text-gray-900">
                                            {selectedCostCentre ? `${selectedCostCentre.ccName} (${selectedCostCentre.ccNo})` : 'N/A'}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2 bg-slate-300 p-2"><b>Billing & Budget</b></h4>
                                <dl className="divide-y divide-gray-200">
                                    <div className="py-2 flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Advance Payment</dt>
                                        <dd className="text-sm text-gray-900">
                                            {formData.advanceApplicable.isApplicable 
                                                ? `${formData.advanceApplicable.percentage}%` 
                                                : 'Not Applicable'}
                                        </dd>
                                    </div>
                                    <div className="py-2 flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Billing Plan</dt>
                                        <dd className="text-sm text-gray-900">
                                            {formData.billingPlan.replace('_', ' ')}
                                        </dd>
                                    </div>
                                    {formData.billingPlan === 'Completion_Based' && (
                                        <div className="py-2 flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Completion Percentages</dt>
                                            <dd className="text-sm text-gray-900">
                                                {formData.billingPlanDetails.completionPercentages.join('%, ')}%
                                            </dd>
                                        </div>
                                    )}
                                    {formData.billingPlan === 'Custom' && (
                                        <div className="py-2 flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Custom Dates</dt>
                                            <dd className="text-sm text-gray-900">
                                                {formData.billingPlanDetails.customDates.map(date => 
                                                    new Date(date).toLocaleDateString()
                                                ).join(', ')}
                                            </dd>
                                        </div>
                                    )}
                                    <div className="py-2 flex justify-between">
                                        <dt className="text-sm font-medium text-gray-500">Budget Allocation</dt>
                                        <dd className="text-sm text-gray-900">
                                            {formData.budgetAllocation.method.replace('_', ' ')} ({formData.budgetAllocation.percentage}%)
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Items Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Item Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            #
                                        </th>
                                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Qty
                                        </th>
                                        <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rate
                                        </th>
                                        <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Types
                                        </th>
                                        <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sublet
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {formData.items.map((item, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {index + 1}
                                            </td>
                                            <td className="px-3 py-4 text-sm text-gray-900">
                                                {item.description}
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                {item.quantity}
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                {formatCurrency(item.rate)}
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                                <div className="bg-gray-50 px-3 py-1 rounded-md inline-block min-w-[120px] text-right">
                                                    {formatCurrency(item.totalValue)}
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                <div className="flex flex-wrap justify-center gap-1">
                                                    {item.itemTypes.includes('Supply') && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                                            <FaBoxes className="mr-1" /> Supply
                                                        </span>
                                                    )}
                                                    {item.itemTypes.includes('Service') && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                            <FaTools className="mr-1" /> Service
                                                        </span>
                                                    )}
                                                    {item.itemTypes.includes('Manufacturing') && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                            <FaCogs className="mr-1" /> Manufacturing
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                {item.isSublet ? (
                                                    <FaCheckCircle className="text-green-500 inline-block" />
                                                ) : (
                                                    <FaTimesCircle className="text-gray-300 inline-block" />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-blue-50 border-t-2 border-blue-200">
                                        <td colSpan="4" className="px-3 py-4 text-sm font-medium text-right text-gray-700">
                                            Total:
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                                            <div className="bg-white px-3 py-2 rounded-md border border-blue-200 inline-block min-w-[120px] text-right">
                                                {formatCurrency(totalPOValue)}
                                            </div>
                                        </td>
                                        <td colSpan="2"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Attachments and Remarks */}
                <Card>
                    <CardHeader>
                        <CardTitle>Attachments & Remarks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-3">Attachments</h4>
                                {formData.attachments.length > 0 ? (
                                    <ul className="space-y-2">
                                        {formData.attachments.map((attachment, index) => (
                                            <li key={attachment.id} className="flex items-center text-sm text-gray-600">
                                                <FaPaperclip className="mr-2 text-gray-400" />
                                                <span className="font-medium">
                                                    {attachment.name} ({formatFileSize(attachment.size)})
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500">No attachments added</p>
                                )}
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-3">Remarks</h4>
                                <p className="text-sm text-gray-600 whitespace-pre-line p-3 bg-gray-50 rounded-md border border-gray-200 min-h-[100px]">
                                    {formData.remarks || 'No remarks added'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-between pt-6">
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={onBack}
                            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={loading}
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={onReset}
                            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={loading}
                        >
                            Reset Form
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={onSubmit}
                        className="px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Creating PO...
                            </>
                        ) : (
                            'Create Client PO'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewSubmitStage;