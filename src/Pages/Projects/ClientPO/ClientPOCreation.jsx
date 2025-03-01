import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    createClientPO,
    getPerformingCostCentres,
    getWonBOQs,
    getAllClients,
    getSubClientsByClientId,
    clearErrors,
    clearSuccess,
    clearSubclients
} from '../../../Slices/projectModuleSlices/clientPOSlices';
import { showToast } from '../../../utilities/toastUtilities';

// Import Components
import BasicDetailsStage from './BasicDetailsStage';
import BOQItemsSelectionStage from './BOQItemsSelectionStage';
import BillingBudgetStage from './BillingBudgetStage';
import AttachmentsRemarksStage from './AttachmentsRemarksStage';
import ReviewSubmitStage from './ReviewSubmitStage';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';

const STAGES = [
    { id: 1, title: 'Basic Details' },
    { id: 2, title: 'BOQ Items' },
    { id: 3, title: 'Billing & Budget' },
    { id: 4, title: 'Attachments & Remarks' },
    { id: 5, title: 'Review & Submit' }
];

const ClientPOCreation = () => {
    const dispatch = useDispatch();
    const {
        loading,
        error,
        success,
        costCentres,
        wonBOQs,
        clients,
        subClients
        
    } = useSelector((state) => state.clientPO);

    const [currentStage, setCurrentStage] = useState(1);

    const initialFormState = useMemo(() => ({
        poNumber: '',
        poDate: new Date(),
        clientId: '',
        subClientId: '',
        boqId: '',
        items: [],
        costCentreId: '',
        advanceApplicable: {
            isApplicable: false,
            percentage: 0
        },
        billingPlan: '',
        billingPlanDetails: {
            completionPercentages: [],
            customDates: []
        },
        budgetAllocation: {
            method: '',
            percentage: 0
        },
        remarks: '',
        attachments: []
    }), []);

    const [formData, setFormData] = useState(initialFormState);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    

    useEffect(() => {
        dispatch(getPerformingCostCentres());
        dispatch(getWonBOQs());
        dispatch(getAllClients());
    }, [dispatch]);


    const handleReset = useCallback(() => {
        if (isFormDirty && window.confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
            setFormData(initialFormState);
            setIsFormDirty(false);
            setSelectedClient(null);
            dispatch(clearSubclients());
            setCurrentStage(1);
        } else if (!isFormDirty) {
            setFormData(initialFormState);
            setSelectedClient(null);
            setCurrentStage(1);
        }
    }, [initialFormState, isFormDirty, dispatch]);

    useEffect(() => {
        if (success.createPO) {
            showToast('success', 'Client PO created successfully');
            handleReset();
            dispatch(clearSuccess());
        }
    }, [success.createPO, dispatch, handleReset]);

    useEffect(() => {
        if (error.createPO) {
            showToast('error', error.createPO);
            dispatch(clearErrors());
        }
    }, [error.createPO, dispatch]);

    const handleBack = () => {
        if (currentStage > 1) {
            setCurrentStage(prev => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentStage < STAGES.length) {
            setCurrentStage(prev => prev + 1);
        }
    };

    const updateFormData = useCallback((data) => {
        setFormData(prev => ({ ...prev, ...data }));
        setIsFormDirty(true);
    }, []);

    const handleClientChange = useCallback(async (clientId) => {
        if (clientId) {
            const selectedClient = clients.find(client => client._id === clientId);
            setSelectedClient(selectedClient);
            dispatch(clearSubclients());
            dispatch(getSubClientsByClientId(clientId));
            updateFormData({ 
                clientId,
                subClientId: ''
            });
        }else {
            setSelectedClient(null);
            dispatch(clearSubclients());
            updateFormData({ 
                clientId: '',
                subClientId: ''
            });
        }
    }, [dispatch, updateFormData, clients]);

    const handleSubmit = useCallback(() => {
        dispatch(createClientPO(formData));
    }, [dispatch, formData]);

    return (
        <div className="min-h-screen bg-gray-50 w-full">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            {currentStage > 1 && (
                                <button
                                    onClick={handleBack}
                                    className="mr-4 p-2 rounded-full hover:bg-gray-100"
                                >
                                    <FaArrowLeft className="w-5 h-5 text-gray-500" />
                                </button>
                            )}
                            <h1 className="text-2xl font-bold text-gray-900">Create Client PO</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stepper */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    {STAGES.map((stage, index) => (
                        <div key={stage.id} className="flex items-center">
                            <div className="flex flex-col items-center">
                                <div 
                                    className={`w-10 h-10 rounded-full flex items-center justify-center
                                        ${currentStage > stage.id ? 'bg-green-500' : 
                                          currentStage === stage.id ? 'bg-indigo-600' : 'bg-gray-200'}
                                        text-white font-semibold`}
                                >
                                    {currentStage > stage.id ? (
                                        <FaCheck className="w-5 h-5" />
                                    ) : (
                                        stage.id
                                    )}
                                </div>
                                <span className={`mt-2 text-sm ${
                                    currentStage === stage.id ? 'text-blue-600 font-semibold' : 'text-gray-500'
                                }`}>
                                    {stage.title}
                                </span>
                            </div>
                            {index < STAGES.length - 1 && (
                                <div className={`w-32 h-1 mx-4 ${
                                    currentStage > stage.id ? 'bg-green-500' : 'bg-gray-200'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-lg shadow">
                    {(() => {
                        switch (currentStage) {
                            case 1:
                                return (
                                    <BasicDetailsStage 
                                        formData={formData}
                                        costCentres={costCentres}
                                        clients={clients}
                                        subClients={subClients}
                                        selectedClient={selectedClient}
                                        onUpdate={updateFormData}
                                        onClientChange={handleClientChange}
                                        onNext={handleNext}
                                        loading={loading}
                                    />
                                );
                            case 2:
                                return (
                                    <BOQItemsSelectionStage 
                                        formData={formData}
                                        wonBOQs={wonBOQs}
                                        onUpdate={updateFormData}
                                        onNext={handleNext}
                                        onBack={handleBack}
                                        loading={loading}
                                    />
                                );
                            case 3:
                                return (
                                    <BillingBudgetStage 
                                        formData={formData}
                                        onUpdate={updateFormData}
                                        onNext={handleNext}
                                        onBack={handleBack}
                                    />
                                );
                            case 4:
                                return (
                                    <AttachmentsRemarksStage 
                                        formData={formData}
                                        onUpdate={updateFormData}
                                        onNext={handleNext}
                                        onBack={handleBack}
                                    />
                                );
                            case 5:
                                return (
                                    <ReviewSubmitStage 
                                        formData={formData}
                                        costCentres={costCentres}
                                        wonBOQs={wonBOQs}
                                        selectedClient={selectedClient}
                                        subClients={subClients}
                                        onSubmit={handleSubmit}
                                        onBack={handleBack}
                                        onReset={handleReset}
                                        loading={loading.createPO}
                                    />
                                );
                            default:
                                return null;
                        }
                    })()}
                </div>
            </div>

            {/* Loading Overlay */}
            {loading.createPO && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-5 rounded-lg flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                        <span className="text-lg font-medium text-gray-700">Creating PO...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientPOCreation;