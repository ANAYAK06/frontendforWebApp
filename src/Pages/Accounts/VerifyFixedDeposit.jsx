import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FaChevronDown, FaRegEdit, FaTimes, FaPiggyBank } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { fetchVerificationFDs, rejectFixedDepositThunk, resetRejectSuccess, resetUpdateSuccess, updateFixedDeposit } from '../../Slices/fixedDepositSlices';
import SignatureAndRemarks from '../../Components/SignatureAndRemarks';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '../../Components/DailogComponent';
import { showToast } from '../../utilities/toastUtilities';

const defaultProps = {
    checkContent: true,
    onEmpty: () => { },
    onStateChange: () => { }
};

function VerifyFixedDeposit(props) {
    const { checkContent, onEmpty, onStateChange } = { ...defaultProps, ...props };

    const dispatch = useDispatch();
    const { fdsForVerification, loading, error } = useSelector(state => state.fixedDeposit);
    const userRoleId = useSelector(state => state.auth.userInfo.roleId);
    const [inboxExpanded, setInboxExpanded] = useState(false);
    const [selectedFD, setSelectedFD] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [maturityDetails, setMaturityDetails] = useState(null);
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    const { groups } = useSelector((state) => state.group);
    const { bankAccounts } = useSelector((state) => state.bankAccount);

    const hasContent = useMemo(() => fdsForVerification?.length > 0, [fdsForVerification]);

    const getGroupName = useCallback((groupId) => {
        const group = groups.find(g => g._id === groupId);
        return group?.groupName || 'N/A';
    }, [groups]);

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

    const calculateMaturity = useCallback((fd) => {
        const principal = parseFloat(fd.depositAmount);
        const rate = parseFloat(fd.rateOfInterest) / 100;
        const years = fd.tenure.years + (fd.tenure.months / 12) + (fd.tenure.days / 365);

        let maturityAmount;
        if (fd.interestPayout === 'cumulative') {
            maturityAmount = principal * Math.pow(1 + (rate / 4), 4 * years);
        } else {
            maturityAmount = principal + (principal * rate * years);
        }

        const maturityDate = new Date(fd.depositDate);
        maturityDate.setFullYear(
            maturityDate.getFullYear() + fd.tenure.years,
            maturityDate.getMonth() + fd.tenure.months,
            maturityDate.getDate() + fd.tenure.days
        );

        return {
            amount: Math.round(maturityAmount),
            interest: Math.round(maturityAmount - principal),
            maturityDate
        };
    }, []);

    useEffect(() => {
        if (userRoleId) {
            // Assuming you have an action to fetch FDs for verification
            dispatch(fetchVerificationFDs(userRoleId));
        }
    }, [dispatch, userRoleId]);

    const openFDDetails = useCallback((fd) => {
        setSelectedFD(fd);
        setMaturityDetails(calculateMaturity(fd));
    }, [calculateMaturity]);

    const closeFDDetails = useCallback(() => {
        setSelectedFD(null);
        setRemarks('');
        setMaturityDetails(null);
    }, []);

    const handleVerify = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before verifying');
            return;
        }
        try {
            await dispatch(updateFixedDeposit({
                id: selectedFD._id,
                updateData: { remarks: remarks }
            })).unwrap();
            showToast('success', 'Fixed Deposit verified successfully');
            closeFDDetails();
            dispatch(fetchVerificationFDs(userRoleId));
        } catch (error) {
            showToast('error', error.message || 'Failed to verify fixed deposit');
        }
    }, [dispatch, selectedFD, remarks, userRoleId, closeFDDetails]);

    const handleReject = useCallback(() => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before rejecting');
            return;
        }
        setShowRejectDialog(true);
    }, [remarks]);

    const handleConfirmedReject = useCallback(async () => {
        try {
            await dispatch(rejectFixedDepositThunk({
                id: selectedFD._id,
                remarks: remarks
            })).unwrap();
            showToast('error', 'Fixed Deposit rejected successfully');
            closeFDDetails();
            dispatch(fetchVerificationFDs(userRoleId));
        } catch (error) {
            showToast('error', error.message || 'Failed to reject fixed deposit');
        }
        setShowRejectDialog(false);
    }, [dispatch, selectedFD, remarks, userRoleId, closeFDDetails]);

    if (loading && !fdsForVerification?.length) {
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
                    <div 
                        className="px-2 py-2 rounded-full bg-slate-300 cursor-pointer" 
                        onClick={() => setInboxExpanded(!inboxExpanded)}
                    >
                        <FaChevronDown 
                            className={`text-gray-600 font-bold ${inboxExpanded ? 'rotate-180 duration-300' : ''}`} 
                        />
                    </div>
                    <div><h3 className="text-gray-600 font-bold">Fixed Deposit Verification</h3></div>
                    <div className="font-bold text-red-500">({fdsForVerification?.length || 0})</div>
                </div>

                <div className={`transition-max-height duration-500 ease-in-out overflow-hidden ${inboxExpanded ? 'max-h-screen' : 'max-h-0'}`}>
                    {inboxExpanded && (
                        <div className="p-4 bg-white">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="text-gray-700">
                                        <tr>
                                            <th className="border px-4 py-2">Action</th>
                                            <th className="border px-4 py-2">Account Number</th>
                                            <th className="border px-4 py-2">Bank Name</th>
                                            <th className="border px-4 py-2">Type</th>
                                            <th className="border px-4 py-2">Amount</th>
                                            <th className="border px-4 py-2">Interest Rate</th>
                                            <th className="border px-4 py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fdsForVerification?.map((fd) => (
                                            <tr key={fd._id} className="hover:bg-gray-50">
                                                <td className="border px-4 py-2">
                                                    <FaRegEdit
                                                        className="text-yellow-600 cursor-pointer text-2xl"
                                                        onClick={() => openFDDetails(fd)}
                                                    />
                                                </td>
                                                <td className="border px-4 py-2">{fd.accountNumber}</td>
                                                <td className="border px-4 py-2">{fd.bankName}</td>
                                                <td className="border px-4 py-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        fd.fdType === 'regular' 
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {fd.fdType}
                                                    </span>
                                                </td>
                                                <td className="border px-4 py-2">
                                                    {fd.depositAmount.toLocaleString('en-IN', {
                                                        style: 'currency',
                                                        currency: 'INR'
                                                    })}
                                                </td>
                                                <td className="border px-4 py-2">{fd.rateOfInterest}%</td>
                                                <td className="border px-4 py-2">
                                                    <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">
                                                        {fd.status}
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

                {selectedFD && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 fade-in">
                        <div className="relative mx-auto p-6 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto">
                            <button onClick={closeFDDetails} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500">
                                <FaTimes className="h-6 w-6" />
                            </button>

                            <div className="mt-4">
                                {/* Header Section */}
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-t-lg">
                                    <div className="flex items-center space-x-4">
                                        <FaPiggyBank className="h-8 w-8" />
                                        <div>
                                            <h3 className="text-2xl font-bold">Fixed Deposit Details</h3>
                                            <p className="text-lg opacity-90">
                                                {selectedFD.updateType === 'new' ? 'New FD' : 'Existing FD'}
                                            </p>
                                            <p className="text-lg opacity-90">
                                                {selectedFD.accountNumber} - {selectedFD.bankName}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                        {/* FD Overview */}
                                        <div className="bg-white p-6 rounded-lg shadow-md">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">FD Overview</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-indigo-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">FD Type</p>
                                                    <p className="text-lg font-semibold text-indigo-700 capitalize">
                                                        {selectedFD.fdType}
                                                    </p>
                                                </div>
                                                <div className="bg-purple-50 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Interest Payout</p>
                                                    <p className="text-lg font-semibold text-purple-700 capitalize">
                                                        {selectedFD.interestPayout}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Deposit Details */}
                                        <div className="bg-white p-6 rounded-lg shadow-md">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Deposit Details</h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center border-b pb-2">
                                                    <span className="text-gray-600">Deposit Amount</span>
                                                    <span className="text-lg font-semibold text-gray-800">
                                                        {selectedFD.depositAmount.toLocaleString('en-IN', {
                                                            style: 'currency',
                                                            currency: 'INR'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center border-b pb-2">
                                                    <span className="text-gray-600">Interest Rate</span>
                                                    <span className="text-lg font-semibold text-gray-800">
                                                        {selectedFD.rateOfInterest}% p.a.
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Tenure</span>
                                                    <span className="text-lg font-semibold text-gray-800">
                                                        {selectedFD.tenure.years}y {selectedFD.tenure.months}m {selectedFD.tenure.days}d
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-6">
                                        {/* Maturity Details */}
                                        {maturityDetails && (
                                            <div className="bg-white p-6 rounded-lg shadow-md">
                                                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                                    Maturity Details
                                                </h4>
                                                <div className="grid grid-cols-1 gap-4">
                                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg">
                                                        <p className="text-sm opacity-90">Maturity Amount</p>
                                                        <p className="text-3xl font-bold">
                                                            ₹{maturityDetails.amount.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="bg-indigo-50 p-4 rounded-lg">
                                                            <p className="text-sm text-gray-600">Total Interest</p>
                                                            <p className="text-lg font-semibold text-indigo-700">
                                                                ₹{maturityDetails.interest.toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="bg-purple-50 p-4 rounded-lg">
                                                            <p className="text-sm text-gray-600">Maturity Date</p>
                                                            <p className="text-lg font-semibold text-purple-700">
                                                                {maturityDetails.maturityDate.toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Additional Details */}
                                        <div className="bg-white p-6 rounded-lg shadow-md">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Additional Details</h4>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <p className="text-sm text-gray-600">Deposit Date</p>
                                                        <p className="text-base font-semibold text-gray-800">
                                                            {new Date(selectedFD.depositDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <p className="text-sm text-gray-600">Linked Bank Account</p>
                                                        <p className="text-base font-semibold text-gray-800">
                                                            {getBankName(selectedFD.linkedBankAccount)}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <p className="text-sm text-gray-600">Accounting Group</p>
                                                        <p className="text-base font-semibold text-gray-800">
                                                            {getGroupName(selectedFD.accountingGroupId)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Auto Renewal Details */}
                                                {selectedFD.autoRenewal?.isEnabled && (
                                                    <div className="mt-4">
                                                        <h5 className="text-md font-semibold text-gray-700 mb-2">
                                                            Auto Renewal Details
                                                        </h5>
                                                        <div className="bg-blue-50 p-4 rounded-lg">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-sm text-gray-600">Renewal Period</p>
                                                                    <p className="text-base font-semibold text-gray-800">
                                                                        {selectedFD.autoRenewal.renewalPeriod.years}y{' '}
                                                                        {selectedFD.autoRenewal.renewalPeriod.months}m{' '}
                                                                        {selectedFD.autoRenewal.renewalPeriod.days}d
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* For Existing FDs */}
                                                {selectedFD.updateType === 'existing' && (
                                                    <div className="mt-4">
                                                        <h5 className="text-md font-semibold text-gray-700 mb-2">
                                                            Existing FD Details
                                                        </h5>
                                                        <div className="bg-yellow-50 p-4 rounded-lg">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-sm text-gray-600">Current Balance</p>
                                                                    <p className="text-base font-semibold text-gray-800">
                                                                        ₹{selectedFD.fdBalance?.toLocaleString()}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-600">Balance As On</p>
                                                                    <p className="text-base font-semibold text-gray-800">
                                                                        {new Date(selectedFD.balanceAsOn).toLocaleDateString()}
                                                                    </p>
                                                                </div>
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
                                            signatures={selectedFD.signatureAndRemarks || []}
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

            {/* Reject Confirmation Dialog */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                            Confirm Fixed Deposit Rejection
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-gray-600">
                            Are you sure you want to reject fixed deposit #{selectedFD?.accountNumber}? 
                            This action cannot be undone.
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
                            Yes, Reject Fixed Deposit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default React.memo(VerifyFixedDeposit);