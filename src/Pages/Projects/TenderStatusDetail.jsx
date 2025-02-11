import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaArrowLeft, FaTrophy, FaTimesCircle, FaFileAlt, FaUpload, FaMoneyBill, FaArrowAltCircleDown } from 'react-icons/fa';
import { createTenderStatus, clearErrors, clearSuccess} from '../../Slices/projectModuleSlices/tenderFinalStatus';
import { showToast } from '../../utilities/toastUtilities';
import CustomDatePicker from '../../Components/CustomDatePicker';
import { Card, CardContent, CardHeader, CardTitle } from '../../Components/Card';


const TenderStatusDetail = ({ boq, onBack }) => {
    const dispatch = useDispatch();
    const { loading: { create: loading }, error: { create: error }, success: { create: success } } = useSelector(state => state.tenderStatus);
    const [tenderStatus, setTenderStatus] = useState('');
    const [remarks, setRemarks] = useState('');
    const [attachments, setAttachments] = useState([]);

    // Form states for won status
    const [wonDetails, setWonDetails] = useState({
        tenderNumber: boq?.businessOpportunity?.tenderDetails?.tenderNumber || '',
        poNumber: '',
        clientPODate: null,
        workLocation: '',
        expectedStartDate: new Date(),
        originalBOQAmount: boq?.totalAmount || 0,
        variationAcceptance: boq?.variationAcceptance || 0, // Default variation acceptance
        finalVariationPercentage: '',
        finalAmount: 0
    });

    // Form states for lost status
    const [lostDetails, setLostDetails] = useState({
        L1: { companyName: '', price: '' },
        L2: { companyName: '', price: '' },
        winningParty: { name: '', details: '' },
        reasonForLoss: '',
        futurePrecautions: ''
    });
    const calculateAmount = (baseAmount, variationPercentage) => {
        const variation = (parseFloat(variationPercentage) || 0) / 100;
        return baseAmount * (1 - variation);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };
  
    useEffect(() => {
        if (error) {
            showToast('error', error);
            dispatch(clearErrors());
        }
        if (success) {
            showToast('success', 'Tender status updated successfully');
            dispatch(clearSuccess());
            onBack();
        }
    }, [error, success, dispatch, onBack]);

    const handleFileChange = (e) => {
        setAttachments([...e.target.files]);
    };

   


    const handleSubmit = async () => {
        if (!tenderStatus || !remarks.trim()) {
            showToast('error', 'Please fill all required fields');
            return;
        }
    
        const formData = new FormData();
        formData.append('boqId', boq._id);
        formData.append('tenderStatus', tenderStatus);
        formData.append('remarks', remarks.trim());
    
        // Append files if any
        attachments.forEach(file => {
            formData.append('attachments', file);
        });
    
        // Add appropriate details based on tender status
        if (tenderStatus === 'won') {
            // Directly append wonDetails fields instead of nesting under 'details'
            formData.append('wonDetails', JSON.stringify({
                tenderNumber: boq.businessOpportunity.tenderDetails.tenderNumber,
                poNumber: wonDetails.poNumber,
                clientPODate: wonDetails.clientPODate?.toISOString(),
                workLocation: wonDetails.workLocation,
                expectedStartDate: wonDetails.expectedStartDate?.toISOString(),
                originalBOQAmount: Number(wonDetails.originalBOQAmount),
                negotiatedAmount: Number(wonDetails.finalAmount), // Use the calculated final amount
                originalVariationPercentage: Number(wonDetails.variationAcceptance),
                finalVariationPercentage: Number(wonDetails.finalVariationPercentage),
                finalVariationAmount: calculateAmount(wonDetails.originalBOQAmount, wonDetails.finalVariationPercentage),
                finalAcceptedAmount: Number(wonDetails.finalAmount)
            }));
        } else {
            // For lost tender, append lostDetails
            formData.append('lostDetails', JSON.stringify({
                L1: {
                    companyName: lostDetails.L1.companyName,
                    price: Number(lostDetails.L1.price)
                },
                L2: {
                    companyName: lostDetails.L2.companyName,
                    price: Number(lostDetails.L2.price)
                },
                winningParty: lostDetails.winningParty,
                reasonForLoss: lostDetails.reasonForLoss,
                futurePrecautions: lostDetails.futurePrecautions
            }));
        }
    
        dispatch(createTenderStatus(formData));
    };

    const handleLostDetailsChange = (section, field, value) => {
        setLostDetails(prev => ({
            ...prev,
            [section]: typeof field === 'string'
                ? value
                : { ...prev[section], [field]: value }
        }));
    };

    // Add this new handler for variation changes
    const handleVariationChange = (value) => {
        const variation = parseFloat(value) || 0;
        const originalAmount = parseFloat(wonDetails.originalBOQAmount);
        // Calculate final amount with reduction
        const finalAmount = calculateAmount(originalAmount, variation);
    
        setWonDetails(prev => ({
            ...prev,
            finalVariationPercentage: value,
            finalAmount: finalAmount
        }));
    };
  

    const FinancialDetailsSection = () => {
        const maxAmount = wonDetails.originalBOQAmount * (1 - (wonDetails.variationAcceptance / 100));
        
        return (
            <div className="space-y-6">
                {/* Amount Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-50 rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Initial Tender Value</h3>
                            <div className="p-2 bg-blue-100 rounded-full">
                                <FaFileAlt className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(wonDetails.originalBOQAmount)}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">Base amount</p>
                    </div>
    
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Maximum Variation</h3>
                            <div className="p-2 bg-purple-100 rounded-full">
                                <FaArrowAltCircleDown className="w-4 h-4 text-red-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {wonDetails.variationAcceptance}%
                        </p>
                        <p className="text-sm text-red-500 mt-2">
                            Max amount: {formatCurrency(maxAmount)}
                        </p>
                    </div>
    
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Final Amount</h3>
                            <div className="p-2 bg-green-100 rounded-full">
                                <FaMoneyBill className="w-4 h-4 text-green-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(wonDetails.finalAmount || wonDetails.originalBOQAmount)}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            {wonDetails.finalVariationPercentage ? `With ${wonDetails.finalVariationPercentage}% variation` : 'No variation applied'}
                        </p>
                    </div>
                </div>
    
                {/* Variation Input */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Final Variation Percentage *
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            min="0"
                            max={wonDetails.variationAcceptance}
                            value={wonDetails.finalVariationPercentage}
                            onChange={(e) => handleVariationChange(e.target.value)}
                            className="block w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder={`Enter variation (0-${wonDetails.variationAcceptance}%)`}
                        />
                        <div className="absolute right-3 top-3 text-gray-400">%</div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        Maximum allowed variation is {wonDetails.variationAcceptance}%
                    </p>
                </div>
    
                {/* Summary Card */}
                {wonDetails.finalVariationPercentage && (
                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-50 rounded-xl p-6 shadow-sm">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Final Amount Summary</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Original Amount</span>
                                <span className="font-medium">{formatCurrency(wonDetails.originalBOQAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Variation Applied</span>
                                <span className="font-medium">{wonDetails.finalVariationPercentage}%</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t">
                                <span className="text-lg font-semibold text-gray-900">Final Tender Amount</span>
                                <span className="text-lg font-bold text-indigo-600">{formatCurrency(wonDetails.finalAmount)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };



    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                >
                    <FaArrowLeft className="mr-2" />
                    Back to List
                </button>
                <h2 className="text-2xl font-bold text-gray-900">Tender Status Update</h2>
            </div>

            {/* BOQ Header Info */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-t-lg">
                <div className="flex items-center space-x-4">
                    <FaFileAlt className="h-8 w-8" />
                    <div>
                        <h3 className="text-2xl font-bold">BOQ #{boq.offerNumber}</h3>
                        <p className="text-lg opacity-90">{boq.businessOpportunity?.client?.name}</p>
                    </div>
                </div>
            </div>

            {/* Status Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Tender Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                            onClick={() => setTenderStatus('won')}
                            className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${tenderStatus === 'won'
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-green-200'
                                }`}
                        >
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-green-100 rounded-full">
                                    <FaTrophy className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Won</h3>
                                    <p className="text-sm text-gray-500">Tender awarded to us</p>
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => setTenderStatus('lost')}
                            className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${tenderStatus === 'lost'
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200 hover:border-red-200'
                                }`}
                        >
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-red-100 rounded-full">
                                    <FaTimesCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Lost</h3>
                                    <p className="text-sm text-gray-500">Tender not awarded</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Status-specific details */}
            {tenderStatus === 'won' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Won Tender Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Details */}
                            <div>
                                <label>Tender Number *</label>
                                <div className="mt-1 px-3 py-2 bg-gray-50 border rounded-md text-gray-700">
                                    {boq?.businessOpportunity?.tenderDetails?.tenderNumber || 'N/A'}
                                </div>
                            </div>

                            {/* PO Details */}
                            <div>
                                <label>PO Number</label>
                                <input
                                    type="text"
                                    value={wonDetails.poNumber}
                                    onChange={(e) => setWonDetails({ ...wonDetails, poNumber: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                                />
                            </div>

                            {/* Financial Details */}
                            <div className='col-span-2'>
                            <FinancialDetailsSection />
                            </div>
                            {/* Dates and Location */}
                            <div>
                                <CustomDatePicker
                                    selectedDate={wonDetails.clientPODate}
                                    onChange={(date) => setWonDetails({ ...wonDetails, clientPODate: date })}
                                    label="Client PO Date"
                                />
                            </div>

                            <div>
                                <CustomDatePicker
                                    selectedDate={wonDetails.expectedStartDate}
                                    onChange={(date) => setWonDetails({ ...wonDetails, expectedStartDate: date })}
                                    label="Expected Start Date *"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label>Work Location *</label>
                                <input
                                    type="text"
                                    value={wonDetails.workLocation}
                                    onChange={(e) => setWonDetails({ ...wonDetails, workLocation: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}


            {tenderStatus === 'lost' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Lost Tender Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* L1 Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        L1 Company Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={lostDetails.L1.companyName}
                                        onChange={(e) => handleLostDetailsChange('L1', 'companyName', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        L1 Price <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative mt-1">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                                        <input
                                            type="number"
                                            value={lostDetails.L1.price}
                                            onChange={(e) => handleLostDetailsChange('L1', 'price', e.target.value)}
                                            className="block w-full pl-7 pr-12 py-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* L2 Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">L2 Company Name</label>
                                    <input
                                        type="text"
                                        value={lostDetails.L2.companyName}
                                        onChange={(e) => handleLostDetailsChange('L2', 'companyName', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">L2 Price</label>
                                    <div className="relative mt-1">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                                        <input
                                            type="number"
                                            value={lostDetails.L2.price}
                                            onChange={(e) => handleLostDetailsChange('L2', 'price', e.target.value)}
                                            className="block w-full pl-7 pr-12 py-2 border rounded-md"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Reason and Precautions */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Reason for Loss <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={lostDetails.reasonForLoss}
                                    onChange={(e) => handleLostDetailsChange('reasonForLoss', null, e.target.value)}
                                    rows="3"
                                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Future Precautions <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={lostDetails.futurePrecautions}
                                    onChange={(e) => handleLostDetailsChange('futurePrecautions', null, e.target.value)}
                                    rows="3"
                                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
            {/* File Upload Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex items-center space-x-2 px-4 py-2 border rounded-md hover:bg-gray-50"
                        >
                            <FaUpload className="text-gray-500" />
                            <span>Upload Files</span>
                        </label>
                        <span className="text-sm text-gray-500">
                            {attachments.length} files selected
                        </span>
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
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        rows="3"
                        className="mt-1 block w-full px-3 py-2 border rounded-md"
                        placeholder="Enter your remarks"
                        required
                    />
                </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={loading || !tenderStatus || !remarks.trim()}
                    className={`px-6 py-2 rounded-md font-medium ${loading || !tenderStatus || !remarks.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                        } text-white`}
                >
                    {loading ? 'Updating...' : 'Submit Status Update'}
                </button>
            </div>

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

export default TenderStatusDetail;