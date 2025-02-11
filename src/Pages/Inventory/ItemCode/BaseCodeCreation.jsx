import React, { useState } from 'react';
import { FaBoxes, FaTools, FaUpload, FaFileAlt, FaArrowLeft } from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from '../../../Components/Card';
import BaseCodeForm from './BaseCodeForm'; 
import BaseCodeUpload from './BaseCodeUpload'; 

const BaseCodeCreation = () => {
    const [creationType, setCreationType] = useState('');
    const [itemType, setItemType] = useState('');

    const handleCreationTypeSelect = (type) => {
        setCreationType(type);
    };

    const handleItemTypeSelect = (type) => {
        console.log('Setting itemType to:', type); 
        setItemType(type);
    };

    const handleBack = () => {
        if (itemType) {
            setItemType('');
        } else {
            setCreationType('');
        }
    };

    return (
        <div className="container mx-auto p-4 py-8 bg-white rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Create Base Code</h2>

            {(creationType || itemType) && (
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
                        <span className="text-gray-600">{creationType === 'single' ? 'Single Entry' : 'Bulk Upload'}</span>
                        {itemType && (
                            <>
                                <span className="text-gray-400">/</span>
                                <span className="text-gray-600">{itemType}</span>
                            </>
                        )}
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
                                        <p className="text-sm text-gray-500">Create individual base code</p>
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
                                        <p className="text-sm text-gray-500">Create multiple base codes via Excel</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Item Type Selection */}
            {creationType && !itemType && (
                <Card>
                    <CardHeader>
                        <CardTitle>Select Item Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                onClick={() => handleItemTypeSelect('MATERIAL')}
                                className="cursor-pointer p-6 rounded-lg border-2 border-gray-200 hover:border-indigo-200 transition-all"
                            >
                                <div className="flex items-center space-x-4">
                                    <FaBoxes className="w-6 h-6 text-indigo-600" />
                                    <div>
                                        <h3 className="font-semibold text-lg">Material Code</h3>
                                        <p className="text-sm text-gray-500">Create code for physical items</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                onClick={() => handleItemTypeSelect('SERVICE')}
                                className="cursor-pointer p-6 rounded-lg border-2 border-gray-200 hover:border-indigo-200 transition-all"
                            >
                                <div className="flex items-center space-x-4">
                                    <FaTools className="w-6 h-6 text-indigo-600" />
                                    <div>
                                        <h3 className="font-semibold text-lg">Service Code</h3>
                                        <p className="text-sm text-gray-500">Create code for services</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Form or Upload Component */}
            {creationType && itemType && (
                <>
                    {creationType === 'single' ? (
                        <BaseCodeForm 
                            itemType={itemType}
                            onBack={ handleBack}
                        />
                    ) : (
                        <BaseCodeUpload 
                            itemType={itemType}
                            onBack={handleBack}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default BaseCodeCreation;