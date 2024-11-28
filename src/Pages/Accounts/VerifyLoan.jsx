import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FaChevronDown, FaRegEdit, FaTimes, FaFileInvoiceDollar } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import SignatureAndRemarks from '../../Components/SignatureAndRemarks';
import {
    fetchVerificationLoans,
    updateLoanThunk,
    rejectLoanThunk,
} from '../../Slices/loanAccountSlices';
import { fetchAccountGroups } from '../../Slices/groupSlices';
import { fetchAllBankAccounts } from '../../Slices/bankAccountSlices';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '../../Components/DailogComponent'
import { showToast } from '../../utilities/toastUtilities';

const defaultProps = {
    checkContent: true,
    onEmpty: () => { },
    onStateChange: () => { }
};

function VerifyLoan(props) {
    const { checkContent, onEmpty, onStateChange } = { ...defaultProps, ...props };

    const dispatch = useDispatch();
    const { loansForVerification, loading, error } = useSelector(state => state.loan);
    const userRoleId = useSelector(state => state.auth.userInfo.roleId);
    const [inboxExpanded, setInboxExpanded] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [emiDetails, setEmiDetails] = useState(null);
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    const { groups } = useSelector((state) => state.group);
    const { bankAccounts } = useSelector((state) => state.bankAccount);

    const hasContent = useMemo(() => loansForVerification?.length > 0, [loansForVerification]);

    useEffect(() => {
        if (userRoleId) {
            dispatch(fetchVerificationLoans(userRoleId));
        }
    }, [dispatch, userRoleId]);

    useEffect(() => {
        dispatch(fetchAccountGroups())
        dispatch(fetchAllBankAccounts())
    }, [dispatch])

    const getGroupName = useCallback((groupId) => {
        const group = groups.find(g => g._id === groupId)
        return group?.groupName || 'N/A'
    }, [groups])
    const getBankName = useCallback((bankId) => {
        console.log('Current bankId:', bankId);
        
        // If bankId is already a bank object with bankName, return it directly
        if (bankId && typeof bankId === 'object' && bankId.bankName) {
            return bankId.bankName;
        }
    
        // If it's an ID string/object, search in bankAccounts
        if (bankId && bankAccounts?.length) {
            const searchId = typeof bankId === 'string' ? bankId : bankId.toString();
            const bank = bankAccounts.find(bank => bank._id.toString() === searchId);
            return bank?.bankName || 'N/A';
        }
    
        return 'N/A';
    }, [bankAccounts]);

    useEffect(() => {
        console.log('Bank Accounts are', bankAccounts)
        console.log('Bank Name is', getBankName(selectedLoan?.linkedBankAccount))
    }, [bankAccounts, getBankName, selectedLoan])

    const calculateEMI = useCallback((loan) => {
        const P = loan.loanAmount;
        const R = loan.rateOfInterest / (12 * 100);
        const N = loan.numberOfInstallments;
        const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);

        return {
            monthly: Math.round(emi),
            total: Math.round(emi * N),
            interest: Math.round((emi * N) - P)
        };
    }, []);

    useEffect(() => {
        onStateChange(loading, hasContent);
    }, [loading, hasContent, onStateChange]);

    const openLoanDetails = useCallback((loan) => {
        setSelectedLoan(loan);
        setEmiDetails(calculateEMI(loan));
    }, [calculateEMI]);

    const closeLoanDetails = useCallback(() => {
        setSelectedLoan(null);
        setRemarks('');
        setEmiDetails(null);
    }, []);

    const handleVerify = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before verifying');
            return;
        }
        try {
            await dispatch(updateLoanThunk({
                id: selectedLoan._id,
                updateData: { remarks: remarks }
            })).unwrap();
            showToast('success', 'Loan verified successfully');
            closeLoanDetails();
            dispatch(fetchVerificationLoans(userRoleId));
        } catch (error) {
            showToast('error', error.message || 'Failed to verify loan');
        }
    }, [dispatch, selectedLoan, remarks, userRoleId, closeLoanDetails]);

    const handleReject = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before rejecting');
            return;
        }
        setShowRejectDialog(true);
    }, [remarks]);

    const handleConfirmedReject = useCallback(async () => {
        try {
            await dispatch(rejectLoanThunk({
                id: selectedLoan._id,
                remarks: remarks
            })).unwrap();
            showToast('error', 'Loan rejected successfully');
            closeLoanDetails();
            dispatch(fetchVerificationLoans(userRoleId));
        } catch (error) {
            showToast('error', error.message || 'Failed to reject loan');
        }
        setShowRejectDialog(false);
    }, [dispatch, selectedLoan, remarks, userRoleId, closeLoanDetails]);

    if (loading && !loansForVerification?.length) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error || !hasContent) return null;

    return (
        <>
            <div className="w-full bg-white shadow-md rounded-md overflow-hidden mb-4 mt-4">
                <div className="p-4 bg-slate-100 flex justify-between items-center">
                    <div className="px-2 py-2 rounded-full bg-slate-300 cursor-pointer" onClick={() => setInboxExpanded(!inboxExpanded)}>
                        <FaChevronDown className={`text-gray-600 font-bold ${inboxExpanded ? 'rotate-180 duration-300' : ''}`} />
                    </div>
                    <div><h3 className="text-gray-600 font-bold">Loan Verification</h3></div>
                    <div className="font-bold text-red-500">({loansForVerification?.length || 0})</div>
                </div>

                <div className={`transition-max-height duration-500 ease-in-out overflow-hidden ${inboxExpanded ? 'max-h-screen' : 'max-h-0'}`}>
                    {inboxExpanded && (
                        <div className="p-4 bg-white">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="text-gray-700">
                                        <tr>
                                            <th className="border px-4 py-2">Action</th>
                                            <th className="border px-4 py-2">Loan Number</th>
                                            <th className="border px-4 py-2">Lender</th>
                                            <th className="border px-4 py-2">Type</th>
                                            <th className="border px-4 py-2">Amount</th>
                                            <th className="border px-4 py-2">Interest Rate</th>
                                            <th className="border px-4 py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loansForVerification?.map((loan) => (
                                            <tr key={loan._id} className="hover:bg-gray-50">
                                                <td className="border px-4 py-2">
                                                    <FaRegEdit
                                                        className="text-yellow-600 cursor-pointer text-2xl"
                                                        onClick={() => openLoanDetails(loan)}
                                                    />
                                                </td>
                                                <td className="border px-4 py-2">{loan.loanNumber}</td>
                                                <td className="border px-4 py-2">{loan.lenderName}</td>
                                                <td className="border px-4 py-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${loan.loanType === 'secured'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {loan.loanType}
                                                    </span>
                                                </td>
                                                <td className="border px-4 py-2">
                                                    {loan.loanAmount.toLocaleString('en-IN', {
                                                        style: 'currency',
                                                        currency: 'INR'
                                                    })}
                                                </td>
                                                <td className="border px-4 py-2">{loan.rateOfInterest}%</td>
                                                <td className="border px-4 py-2">
                                                    <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">
                                                        {loan.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {selectedLoan && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 fade-in">
                        <div className="relative mx-auto p-6 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
                            <button onClick={closeLoanDetails} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500">
                                <FaTimes className="h-6 w-6" />
                            </button>

                            <div className="mt-4">
                                {/* Header Section */}
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-t-lg">
                                    <div className="flex items-center space-x-4">
                                        <FaFileInvoiceDollar className="h-8 w-8" />
                                        <div>
                                            <h3 className="text-2xl font-bold">Loan Details</h3>
                                            <p className="text-lg opacity-90">{selectedLoan.updateType === 'new' ? 'New Loan' : 'Existing Loan'}</p>
                                            <p className="text-lg opacity-90">#{selectedLoan.loanNumber} - {selectedLoan.lenderName}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                    {/* Left Column - Basic Details */}
                                    <div className="space-y-6">
                                        {/* Loan Overview Card */}
                                        <div className="bg-white p-6 rounded-lg shadow-md">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Loan Overview</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-indigo-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Loan Type</p>
                                                    <p className="text-lg font-semibold text-indigo-700 capitalize">{selectedLoan.loanType}</p>
                                                </div>
                                                <div className="bg-purple-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Purpose</p>
                                                    <p className="text-lg font-semibold text-purple-700 capitalize">{selectedLoan.loanPurpose}</p>
                                                </div>
                                                <div className="bg-blue-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Lender Type</p>
                                                    <p className="text-lg font-semibold text-blue-700 capitalize">{selectedLoan.lenderType}</p>
                                                </div>
                                                <div className="bg-green-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Disbursed Amount</p>
                                                    <p className="text-lg font-semibold text-green-700">{selectedLoan.disbursedAmount.toLocaleString('en-IN', {
                                                        style: 'currency',
                                                        currency: 'INR'
                                                    })}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Financial Details Card */}
                                        <div className="bg-white p-6 rounded-lg shadow-md">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Financial Details</h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center border-b pb-2">
                                                    <span className="text-gray-600">Loan Amount</span>
                                                    <span className="text-lg font-semibold text-gray-800">
                                                        {selectedLoan.loanAmount.toLocaleString('en-IN', {
                                                            style: 'currency',
                                                            currency: 'INR'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center border-b pb-2">
                                                    <span className="text-gray-600">Interest Rate</span>
                                                    <span className="text-lg font-semibold text-gray-800">
                                                        {selectedLoan.rateOfInterest}% p.a.
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center border-b pb-2">
                                                    <span className="text-gray-600">Tenure</span>
                                                    <span className="text-lg font-semibold text-gray-800">
                                                        {selectedLoan.numberOfInstallments} months
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Processing Fee</span>
                                                    <span className="text-lg font-semibold text-gray-800">
                                                        {selectedLoan.charges?.processingFee?.toLocaleString('en-IN', {
                                                            style: 'currency',
                                                            currency: 'INR'
                                                        }) || '₹0'}
                                                    </span>
                                                </div>

                                            </div>
                                        </div>
                                        <div className="bg-indigo-100 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Linked Bank Account</p>
                                            <p className="text-base font-semibold text-indigo-800">
                                                {getBankName(selectedLoan.linkedBankAccount || 'N/A')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right Column - EMI and Additional Details */}
                                    <div className="space-y-6">
                                        {/* EMI Details Card */}
                                        {emiDetails && (
                                            <div className="bg-white p-4 rounded-lg shadow-md">
                                                <h4 className="text-lg font-semibold text-gray-800 mb-4">EMI Calculation</h4>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg">
                                                        <p className="text-sm opacity-90">Monthly EMI</p>
                                                        <p className="text-3xl font-bold">
                                                            ₹{emiDetails.monthly.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="bg-indigo-50 p-4 rounded-lg">
                                                            <p className="text-sm text-gray-600">Total Interest</p>
                                                            <p className="text-lg font-semibold text-indigo-700">
                                                                ₹{emiDetails.interest.toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="bg-purple-50 p-4 rounded-lg">
                                                            <p className="text-sm text-gray-600">Total Amount</p>
                                                            <p className="text-lg font-semibold text-purple-700">
                                                                ₹{emiDetails.total.toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Additional Details Card */}
                                        <div className="bg-white p-6 rounded-lg shadow-md">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Additional Details</h4>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <p className="text-sm text-gray-600">Disbursement Date</p>
                                                        <p className="text-base font-semibold text-gray-800">
                                                            {new Date(selectedLoan.disbursementDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="bg-red-100 p-4 rounded-lg">
                                                        <p className="text-sm text-gray-600">EMI Start Date</p>
                                                        <p className="text-base font-semibold text-red-800">
                                                            {new Date(selectedLoan.emiStartDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <p className="text-sm text-gray-600">Payment Receipt Type</p>
                                                        <p className="text-base font-semibold text-gray-800">
                                                            {selectedLoan.amountReceiptType === 'bankAccount' ? 'Bank Account' : 'Third Party'}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <p className="text-sm text-gray-600">Accounting Group</p>
                                                        <p className="text-base font-semibold text-gray-800">
                                                            {getGroupName(selectedLoan.accountingGroupId || 'N/A')}
                                                        </p>
                                                    </div>


                                                </div>

                                                {selectedLoan.loanType === 'secured' && (
                                                    <div className="mt-4">
                                                        <h5 className="text-md font-semibold text-gray-700 mb-2">Security Details</h5>
                                                        <div className="bg-yellow-50 p-4 rounded-lg">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-sm text-gray-600">Asset Type</p>
                                                                    <p className="text-base font-semibold text-gray-800">
                                                                        {selectedLoan.securityDetails?.assetType}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-600">Asset Value</p>
                                                                    <p className="text-base font-semibold text-gray-800">
                                                                        ₹{selectedLoan.securityDetails?.assetValue?.toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2">
                                                                <p className="text-sm text-gray-600">Description</p>
                                                                <p className="text-base text-gray-800">
                                                                    {selectedLoan.securityDetails?.assetDescription}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Signatures and Remarks Section */}
                                <div className="mt-6">
                                    <div className="bg-white p-6 rounded-lg shadow-md">
                                        <SignatureAndRemarks
                                            signatures={selectedLoan.signatureAndRemarks || []}
                                        />

                                        <div className="mt-4">
                                            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
                                                Remarks
                                            </label>
                                            <textarea
                                                id="remarks"
                                                name="remarks"
                                                rows="3"
                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                                placeholder="Enter your remarks here"
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 flex justify-end space-x-4">
                                    <button
                                        onClick={handleVerify}
                                        disabled={loading}
                                        className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-base font-medium rounded-md shadow-sm hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        {loading ? 'Processing...' : 'Verify'}
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        disabled={loading}
                                        className="px-6 py-2 bg-red-100 text-red-700 text-base font-medium rounded-md shadow-sm hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                    >
                                        {loading ? 'Processing...' : 'Reject'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                            Confirm Loan Rejection
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-gray-600">
                            Are you sure you want to reject loan #{selectedLoan?.loanNumber}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmedReject}
                            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md"
                        >
                            Yes, Reject Loan
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </>
    );
}

export default React.memo(VerifyLoan);
