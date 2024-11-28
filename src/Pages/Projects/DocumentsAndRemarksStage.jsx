import React, { useState } from 'react';
import { FaFilePdf, FaTimesCircle } from 'react-icons/fa';
import { showToast } from '../../utilities/toastUtilities';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogAction,
    AlertDialogCancel,
} from '../../Components/DailogComponent';

const DocumentsAndRemarksStage = ({ attachments, remarks, onUpdate, onNext, onBack }) => {
    const [showNewAttachmentDialog, setShowNewAttachmentDialog] = useState(false);
    const [newAttachmentName, setNewAttachmentName] = useState('');
    const [attachmentFile, setAttachmentFile] = useState(null);

    const handleAttachment = () => {
        if (!newAttachmentName.trim() || !attachmentFile) {
            showToast('error', 'Please provide both name and file');
            return;
        }

        if (!attachmentFile.type.includes('pdf')) {
            showToast('error', 'Only PDF files are allowed');
            return;
        }

        onUpdate({
            attachments: [...attachments, {
                name: newAttachmentName,
                file: attachmentFile
            }]
        });

        setNewAttachmentName('');
        setAttachmentFile(null);
        setShowNewAttachmentDialog(false);
        showToast('success', 'Document added successfully');
    };

    const handleNext = () => {
        onNext();
    };

    return (
        <div className="p-6">
            {/* Supporting Documents */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                        <FaFilePdf className="text-red-600 w-6 h-6" />
                        <h2 className="text-xl font-semibold text-gray-900">Supporting Documents</h2>
                    </div>
                    <button
                        onClick={() => setShowNewAttachmentDialog(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Add Document
                    </button>
                </div>

                <div className="space-y-3">
                    {attachments.map((attachment, index) => (
                        <div 
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                            <div className="flex items-center space-x-3">
                                <FaFilePdf className="text-red-500 w-5 h-5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                                    <p className="text-xs text-gray-500">{attachment.file.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => onUpdate({
                                    attachments: attachments.filter((_, i) => i !== index)
                                })}
                                className="text-red-500 hover:text-red-700"
                            >
                                <FaTimesCircle className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Remarks */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Remarks</h2>
                <textarea
                    value={remarks}
                    onChange={(e) => onUpdate({ remarks: e.target.value })}
                    rows="4"
                    className="w-full px-3 py-2 border rounded-md resize-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Add any additional remarks..."
                />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
                <button
                    onClick={onBack}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    Next
                </button>
            </div>

            {/* New Attachment Dialog */}
            <AlertDialog open={showNewAttachmentDialog} onOpenChange={setShowNewAttachmentDialog}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Add New Document</AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <input
                            type="text"
                            value={newAttachmentName}
                            onChange={(e) => setNewAttachmentName(e.target.value)}
                            placeholder="Enter document name"
                            className="w-full px-3 py-2 border rounded-md"
                        />
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setAttachmentFile(e.target.files[0])}
                            className="w-full"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setShowNewAttachmentDialog(false);
                            setNewAttachmentName('');
                            setAttachmentFile(null);
                        }}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleAttachment} className="bg-indigo-600 text-white">
                            Add Document
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default DocumentsAndRemarksStage;