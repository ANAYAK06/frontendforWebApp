import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCostCentreTypes } from '../Slices/costCentreTypeSlices';
import { fetchEligibleCCs, fetchDCAForCC, resetAssignmentSuccess, assignDCABudget, fetchFiscalYearsForCC, fetchBudgetForCCAndFiscalYear, setReferenceNumber } from '../Slices/dcaBudgetSlices';
import { showToast } from '../utilities/toastUtilities';

function AssignDCABudget() {
    const dispatch = useDispatch();
    const costCentreTypes = useSelector((state) => state.costCentreTypes.costCentreTypes);
    const { eligibleCCs, dcaList, loading, error, assignmentSuccess, fiscalYears, selectedBudget } = useSelector((state) => state.dcaBudget);

    const [formData, setFormData] = useState({
        ccid: '',
        subId: '',
        ccNo: '',
        fiscalYear: '',
        approvedBudget: 0,
        balanceBudget: 0,
        dcaAllocations: [],
        remarks: '',
        applyFiscalYear: false
    });
    const [remainingBalance, setRemainingBalance] = useState(0);



    useEffect(() => {
        if (!costCentreTypes.length) {
            dispatch(fetchCostCentreTypes());
        }
    }, [dispatch, costCentreTypes]);

    useEffect(() => {
        if (formData.balanceBudget) {
            setRemainingBalance(formData.balanceBudget)
        }
    }, [formData.balanceBudget])

    useEffect(() => {
        if (assignmentSuccess) {
            showToast('success', 'DCA Budget Assigned successfully')

            setFormData({
                ccid: '',
                subId: '',
                ccNo: '',
                fiscalYear: '',
                approvedBudget: 0,
                balanceBudget: 0,
                dcaAllocations: [],
                remarks: ''
            })
            setRemainingBalance(0);
            dispatch(resetAssignmentSuccess())
        }
    }, [assignmentSuccess, dispatch])

    const filteredSubTypes = formData.ccid
        ? costCentreTypes.find(cc => cc.value === parseInt(formData.ccid))?.subType || []
        : [];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'ccid' || name === 'subId') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                ccNo: '',
                fiscalYear: '',
                dcaAllocations: []
            }));
            if (name === 'subId') {
                dispatch(fetchEligibleCCs({ ccid: formData.ccid, subId: value }))
                    .unwrap()
                    .then(() => showToast('success', 'Eligible CC Fetched Sucessfully'))
                    .catch(() => showToast('error', 'Failed to fetch Eligible CCs'))
            }
        }
    };

    const handleCCSelect = useCallback((ccNo) => {
        const selected = eligibleCCs.find(cc => cc.ccNo === ccNo);
        if (!selected) {
            showToast('error', 'Selected CC Not Found')
            return
        }
        setFormData(prev => ({
            ...prev,
            ccNo,
            approvedBudget: selected.ccBudget,
            balanceBudget: selected.budgetBalance,
            fiscalYear: selected.applyFiscalYear ? '' : 'N/A'
        }));

        if (selected.applyFiscalYear) {

            dispatch(fetchFiscalYearsForCC(ccNo))
                .unwrap()
                .then(() => showToast('success', 'Financial year fetched successfully'))
                .catch(() => showToast('error', 'Failed to fetch FY'))
        } else {

            dispatch(fetchDCAForCC({ ccid: formData.ccid, subId: formData.subId, ccNo }))
                .unwrap()
                .then(() => showToast('success', 'DCA List fetched successfully'))
                .catch(() => showToast('error', 'Failed to fetch DCA List'))
        }

    }, [eligibleCCs, formData.ccid, formData.subId, dispatch]);

    const handleFiscalYearSelect = useCallback((fiscalYear) => {
        setFormData(prev => ({ ...prev, fiscalYear }))

        dispatch(fetchBudgetForCCAndFiscalYear({ ccNo: formData.ccNo, fiscalYear }))
            .unwrap()
            .then(() => {
                showToast('success', 'Budget Info fetched successfully')

                dispatch(fetchDCAForCC({ ccid: formData.ccid, subId: formData.subId, ccNo: formData.ccNo, fiscalYear }))
                    .unwrap()
                    .then(() => showToast('success', 'DCA List fetched successfully'))
                    .catch(() => showToast('error', 'Failed to Fetch DCA List'))
            })
            .catch(() => showToast('error', 'Failed to Fetch budget information'))
    }, [formData.ccNo, formData.ccid, formData.subId, dispatch])


    useEffect(() => {
        if (selectedBudget) {
            setFormData(prev => ({
                ...prev,
                approvedBudget: selectedBudget.ccBudget,
                balanceBudget: selectedBudget.balanceBudget
            }))
        }
    }, [selectedBudget])




    const handleDCAAllocation = useCallback((dcaCode, value, type) => {
        setFormData(prev => {
            const updatedAllocations = prev.dcaAllocations.map(dca => {
                if (dca.dcaCode === dcaCode) {
                    const newValue = parseFloat(value) || 0;
                    if (type === 'percentage') {
                        const amount = (newValue / 100) * prev.approvedBudget;
                        return { ...dca, percentage: newValue, assignedAmount: amount };
                    } else {
                        const percentage = (newValue / prev.approvedBudget) * 100;
                        return { ...dca, assignedAmount: newValue, percentage };
                    }
                }
                return dca;
            });
            const totalAllocated = updatedAllocations.reduce((sum, dca) => sum + dca.assignedAmount, 0)
            const newRemainingBalance = prev.balanceBudget - totalAllocated
            setRemainingBalance(newRemainingBalance)

            if (newRemainingBalance < 0) {
                showToast('warning', 'Allocation exceeds available budget')
            }

            return { ...prev, dcaAllocations: updatedAllocations };
        });
    }, []);


    useEffect(() => {
        if (dcaList.length > 0) {
            setFormData(prev => ({
                ...prev,
                dcaAllocations: dcaList.map(dca => ({
                    dcaCode: dca.code,
                    dcaName: dca.name,
                    percentage: 0,
                    assignedAmount: 0,
                    consumedAmount: 0,
                    balance: 0,
                    autoAllocate: false,
                    subDcas: dca.subDcas.map(subDca => ({
                        subDcaCode: subDca.subCode,
                        subdcaName: subDca.subdcaName,
                        amount: 0
                    }))
                }))
            }));
        }
    }, [dcaList]);

    const handleSubmit = (e) => {
        e.preventDefault();
    
        if (remainingBalance < 0) {
            showToast('error', 'Total allocation exceeds available budget')
            return
        }
    
        if (!formData.ccid || !formData.subId || !formData.ccNo || !formData.remarks) {
            showToast('error', 'Please fill all required fields')
            return
        }
    
        if (formData.dcaAllocations.every(dca => dca.assignedAmount === 0)) {
            showToast('error', 'Please allocate budget to at least one DCA')
            return
        }
    
        const filteredDCAAllocations = formData.dcaAllocations
            .filter(dca => dca.assignedAmount > 0)
            .map(dca => ({
                dcaCode: dca.dcaCode,
                assignedAmount: dca.assignedAmount,
                subDcas: dca.subDcas.filter(subDca => subDca.amount > 0)
                    .map(subDca => ({
                        subDcaCode: subDca.subDcaCode,
                        amount: subDca.amount
                    }))
            }))
    
        const submitData = {
            ccid: parseInt(formData.ccid),
            subId: parseInt(formData.subId),
            ccNo: formData.ccNo,
            dcaAllocations: filteredDCAAllocations,
            remarks: formData.remarks
        }
    
        if (formData.applyFiscalYear && formData.fiscalYear !== 'N/A') {
            submitData.fiscalYear = formData.fiscalYear
        }
    
        dispatch(assignDCABudget(submitData))
            .unwrap()
            .then((response) => {
                // Store reference number from response if needed
                if (response.referenceNumber) {
                    dispatch(setReferenceNumber(response.referenceNumber));
                }
            })
            .catch((err) => {
                showToast('error', `Failed to Assign DCA Budget: ${err.message}`)
            });
    };
    const handleReset = () => {
        // Reset form to initial state
        setFormData({
            ccid: '',
            subId: '',
            ccNo: '',
            fiscalYear: '',
            approvedBudget: 0,
            balanceBudget: 0,
            dcaAllocations: [],
            remarks: '',
            applyFiscalYear: false
        });

        // Reset remaining balance
        setRemainingBalance(0);

        // Show toast notification
        showToast('info', 'Form has been reset');
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
    }


    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Assign DCA Budget</h1>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error.message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="ccid" className="block text-sm font-medium text-gray-700">Cost Centre Type</label>
                        <select
                            name="ccid"
                            id="ccid"
                            value={formData.ccid}
                            onChange={handleInputChange}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Select Cost Centre Type</option>
                            {costCentreTypes.map((cc) => (
                                <option key={cc.value} value={cc.value}>{cc.label}</option>
                            ))}
                        </select>
                    </div>

                    {formData.ccid && (
                        <div>
                            <label htmlFor="subId" className="block text-sm font-medium text-gray-700">Sub Type</label>
                            <select
                                id="subId"
                                name="subId"
                                value={formData.subId}
                                onChange={handleInputChange}
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">Select Sub Type</option>
                                {filteredSubTypes.map((sub) => (
                                    <option key={sub.value} value={sub.value}>{sub.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {formData.subId && (
                        <div>
                            <label htmlFor="ccNo" className="block text-sm font-medium text-gray-700">CC Code</label>
                            <select
                                id="ccNo"
                                name="ccNo"
                                value={formData.ccNo}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    handleCCSelect(e.target.value);
                                }}
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">Select CC Code</option>
                                {eligibleCCs.map((cc) => (
                                    <option key={cc.ccNo} value={cc.ccNo}>{cc.ccNo}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {formData.ccNo && (
                    <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Budget Information</h2>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-blue-100 p-4 rounded-md">
                                <p className="text-sm font-medium text-gray-600">Approved Budget</p>
                                <p className="text-2xl font-bold text-blue-700">
                                    {formData.approvedBudget.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}
                                </p>
                            </div>
                            <div className="bg-green-100 p-4 rounded-md">
                                <p className="text-sm font-medium text-gray-600">Balance Budget</p>
                                <p className="text-2xl font-bold text-green-700">
                                    {formData.balanceBudget.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}
                                </p>
                            </div>
                            <div className="bg-yellow-100 p-4 rounded-md">
                                <p className="text-sm font-medium text-gray-600">Remaining Balance</p>
                                <p className="text-2xl font-bold text-yellow-700">
                                    {remainingBalance.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {formData.ccNo && formData.applyFiscalYear && (
                    <div>
                        <label htmlFor="fiscalYear" className="block text-sm font-medium text-gray-700">Fiscal Year</label>
                        <select
                            id="fiscalYear"
                            name="fiscalYear"
                            value={formData.fiscalYear}
                            onChange={(e) => handleFiscalYearSelect(e.target.value)}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Select Fiscal Year</option>
                            {fiscalYears.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                )}

                {formData.dcaAllocations.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-4">DCA Allocations</h2>
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            {/* Header */}
                            <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 border-b border-gray-200">
                                <div className="text-sm font-medium text-gray-700">DCA Code</div>
                                <div className="text-sm font-medium text-gray-700">DCA Name</div>
                                <div className="text-sm font-medium text-gray-700 text-right">Percentage (%)</div>
                                <div className="text-sm font-medium text-gray-700 text-right">Amount (₹)</div>
                            </div>

                            {/* DCA Rows */}
                            <div className="divide-y divide-gray-200">
                                {formData.dcaAllocations.map((dca) => (
                                    <div key={dca.dcaCode} className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
                                        <div className="font-medium text-indigo-600">{dca.dcaCode}</div>
                                        <div className="text-gray-900">{dca.dcaName}</div>
                                        <div>
                                            <input
                                                type="number"
                                                id={`percentage-${dca.dcaCode}`}
                                                value={dca.percentage || ''}
                                                onChange={(e) => handleDCAAllocation(dca.dcaCode, e.target.value, 'percentage')}
                                                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                id={`amount-${dca.dcaCode}`}
                                                value={dca.assignedAmount || ''}
                                                onChange={(e) => handleDCAAllocation(dca.dcaCode, e.target.value, 'amount')}
                                                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary Footer */}
                            <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 border-t border-gray-200">
                                <div className="col-span-2 text-sm font-medium text-gray-700">Total Allocation</div>
                                <div className="text-sm font-medium text-gray-700 text-right">
                                    {((formData.balanceBudget - remainingBalance) / formData.approvedBudget * 100).toFixed(2)}%
                                </div>
                                <div className="text-sm font-medium text-gray-700 text-right">
                                    ₹{(formData.balanceBudget - remainingBalance).toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-6">
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                    <textarea
                        id="remarks"
                        name="remarks"
                        rows="3"
                        value={formData.remarks}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    ></textarea>
                </div>


                <div className="flex justify-end space-x-4">

                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Creating...' : 'Assign DCA Budget'}
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Reset
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AssignDCABudget;