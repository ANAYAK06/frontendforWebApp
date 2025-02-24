// SpecificationCreation.jsx
import React, { useState } from 'react';
import { FaWrench, FaUpload, FaFileAlt, FaArrowLeft } from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from '../../../Components/Card';
import SpecificationForm from './SpecificationForm';
import SpecificationUpload from './SpecificationUpload';

const SpecificationCreation = ({ baseCodeId, baseCodeDetails }) => {
    const [creationType, setCreationType] = useState('');

    const handleCreationTypeSelect = (type) => {
        setCreationType(type);
    };

    const handleBack = () => {
        setCreationType('');
    };

    return (
        <div className="container mx-auto p-4 py-8 bg-white rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Create Specification</h2>

            {baseCodeDetails && (
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700">Base Code Details</h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                            <span className="text-gray-600">Base Code:</span>
                            <span className="ml-2 font-medium">{baseCodeDetails.baseCode}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Item Name:</span>
                            <span className="ml-2 font-medium">{baseCodeDetails.itemName}</span>
                        </div>
                    </div>
                </div>
            )}

            {creationType && (
                <div className="mb-6 flex items-center space-x-2">
                    <button
                        onClick={handleBack}
                        className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 hover:bg-slate-100 border p-2 rounded-md transition-all"
                    >
                        <FaArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </button>
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-600">
                            {creationType === 'single' ? 'Single Entry' : 'Bulk Upload'}
                        </span>
                    </div>
                </div>
            )}

            {/* Creation Type Selection */}
            {!creationType && (
                <Card>
                    <CardHeader>
                        <CardTitle>Select Creation Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                onClick={() => handleCreationTypeSelect('single')}
                                className="cursor-pointer p-6 rounded-lg border-2 border-gray-200 hover:border-indigo-200 transition-all"
                            >
                                <div className="flex items-center space-x-4">
                                    <FaFileAlt className="w-6 h-6 text-indigo-600" />
                                    <div>
                                        <h3 className="font-semibold text-lg">Single Entry</h3>
                                        <p className="text-sm text-gray-500">Create individual specification</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                onClick={() => handleCreationTypeSelect('bulk')}
                                className="cursor-pointer p-6 rounded-lg border-2 border-gray-200 hover:border-indigo-200 transition-all"
                            >
                                <div className="flex items-center space-x-4">
                                    <FaUpload className="w-6 h-6 text-indigo-600" />
                                    <div>
                                        <h3 className="font-semibold text-lg">Bulk Upload</h3>
                                        <p className="text-sm text-gray-500">Create multiple specifications via Excel</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Form or Upload Component */}
            {creationType && (
                <>
                    {creationType === 'single' ? (
                        <SpecificationForm 
                            baseCodeId={baseCodeId}
                            onBack={handleBack}
                        />
                    ) : (
                        <SpecificationUpload 
                            baseCodeId={baseCodeId}
                            onBack={handleBack}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default SpecificationCreation;