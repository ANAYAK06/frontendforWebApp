import React, { useState } from 'react';

import ReviewStage from './ReviewStage';
import DocumentsAndRemarksStage from './DocumentsAndRemarksStage';
import OpportunitySelectionStage from './OpportunitySelectionStage'
import ChecklistStage from './ChecklistStage'
import BOQUploadStage from './BOQUploadStage'
import { FaArrowLeft, FaCheck } from 'react-icons/fa';

const STAGES = [
    { id: 1, title: 'Select Opportunity' },
    { id: 2, title: 'Checklist' },
    { id: 3, title: 'BOQ Upload' },
    { id: 4, title: 'Documents & Remarks' },
    { id: 5, title: 'Review' }
];

const BOQCreation = () => {
    const [currentStage, setCurrentStage] = useState(1);
    const [formData, setFormData] = useState({
        opportunity: null,
        checklist: null,
        checklistItems: [],
        excelFile: null,
        excelData: null,
        attachments: [],
        remarks: ''
    });

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

    const handleReset = () => {
        setCurrentStage(1);
        setFormData({
            opportunity: null,
            checklist: null,
            checklistItems: [],
            excelFile: null,
            excelData: null,
            attachments: [],
            remarks: ''
        });
    };

    const updateFormData = (data) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

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
                            <h1 className="text-2xl font-bold text-gray-900">Create BOQ</h1>
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
                    <StageRenderer
                        currentStage={currentStage}
                        formData={formData}
                        updateFormData={updateFormData}
                        onNext={handleNext}
                        onBack={handleBack}
                        onReset={handleReset}
                    />
                </div>
            </div>
        </div>
    );
};

const StageRenderer = ({ currentStage, formData, updateFormData, onNext, onBack, onReset }) => {
    switch (currentStage) {
        case 1:
            return (
                <OpportunitySelectionStage
                    selectedOpportunity={formData.opportunity}
                    onSelect={(opportunity) => {
                        updateFormData({ opportunity });
                        onNext();
                    }}
                />
            );
        case 2:
            return (
                <ChecklistStage
                    opportunity={formData.opportunity}
                    checklist={formData.checklist}
                    checklistItems={formData.checklistItems}
                    onUpdate={(data) => updateFormData(data)}
                    onNext={onNext}
                    onBack={onBack}
                />
            );
        case 3:
            return (
                <BOQUploadStage
                    excelFile={formData.excelFile}
                    excelData={formData.excelData}
                    onUpdate={(data) => updateFormData(data)}
                    onNext={onNext}
                    onBack={onBack}
                />
            );
        case 4:
            return (
                <DocumentsAndRemarksStage
                    attachments={formData.attachments}
                    remarks={formData.remarks}
                    onUpdate={(data) => updateFormData(data)}
                    onNext={onNext}
                    onBack={onBack}
                />
            );
        case 5:
            return (
                <ReviewStage
                    formData={formData}
                    onBack={onBack}
                    onReset={onReset}
                />
            );
        default:
            return null;
    }
};

export default BOQCreation;