import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../Components/Card';


import { FaUpload, FaTrash, FaFile, FaPaperclip } from 'react-icons/fa';

const AttachmentsRemarksStage = ({ formData, onUpdate, onNext, onBack }) => {
    const [errors, setErrors] = useState({
        remarks: '',
        attachments: ''
    });
    const fileInputRef = useRef(null);

    const handleRemarks = (e) => {
        onUpdate({ remarks: e.target.value });
        if (e.target.value) {
            setErrors(prev => ({ ...prev, remarks: '' }));
        }
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // For each file, create an object with the file and a unique ID
        const newAttachments = files.map(file => ({
            id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date()
        }));

        onUpdate({ attachments: [...formData.attachments, ...newAttachments] });
        setErrors(prev => ({ ...prev, attachments: '' }));

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    const removeAttachment = (id) => {
        const updatedAttachments = formData.attachments.filter(attachment => attachment.id !== id);
        onUpdate({ attachments: updatedAttachments });
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType) => {
        if (fileType.startsWith('image/')) return '📷';
        if (fileType.startsWith('application/pdf')) return '📄';
        if (fileType.includes('word')) return '📝';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
        return '📎';
    };

    const validateForm = () => {
        const newErrors = {
            remarks: formData.remarks ? '' : 'Remarks are required'
        };

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
                    {/* Attachments Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Attachments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-md hover:border-indigo-500 transition-colors">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current.click()}
                                        className="flex flex-col items-center text-sm text-gray-600"
                                    >
                                        <FaUpload className="w-8 h-8 text-gray-400 mb-2" />
                                        <span className="font-medium">Click to upload files</span>
                                        <span className="text-xs text-gray-500 mt-1">Upload any supporting documents</span>
                                    </button>
                                </div>

                                {formData.attachments.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium text-gray-500 mb-3">
                                            Uploaded Documents ({formData.attachments.length})
                                        </h4>
                                        <ul className="divide-y divide-gray-200">
                                            {formData.attachments.map((attachment) => (
                                                <li key={attachment.id} className="py-3 flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <span className="text-xl mr-3">{getFileIcon(attachment.type)}</span>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {formatFileSize(attachment.size)} • Uploaded {attachment.uploadedAt.toLocaleTimeString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAttachment(attachment.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <FaTrash className="w-4 h-4" />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Remarks Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Remarks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Remarks <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.remarks}
                                    onChange={handleRemarks}
                                    rows="4"
                                    className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md ${
                                        errors.remarks ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter any additional information or special instructions..."
                                />
                                {errors.remarks && (
                                    <p className="mt-1 text-sm text-red-500">{errors.remarks}</p>
                                )}
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

export default AttachmentsRemarksStage;