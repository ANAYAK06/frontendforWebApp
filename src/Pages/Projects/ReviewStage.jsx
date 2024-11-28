import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createNewBOQ } from '../../Slices/clientBoqSlices';
import { showToast } from '../../utilities/toastUtilities';
import { FaCheck, FaFileExcel, FaFilePdf, FaArrowLeft } from 'react-icons/fa';

const ReviewStage = ({ formData, onReset, onBack }) => {
    const dispatch = useDispatch();
    const { opportunity, checklist, excelData, checklistItems, excelFile, attachments, remarks } = formData;

    useEffect(() => {
        console.log('Review Stage Data:', {
            opportunity,
            checklist,
            checklistItems,
            excelFile,
            attachments,
            excelData,
            remarks
        });
    }, [opportunity, checklist, checklistItems, excelFile, attachments, remarks, excelData]);

    const handleSubmit = async () => {
        try {
            console.log('Starting BOQ submission...');
            const formDataToSubmit = new FormData();

            // Add business opportunity ID and excel file
            formDataToSubmit.append('businessOpportunityId', opportunity._id);
            formDataToSubmit.append('excelFile', excelFile);

            // Add checklist data
            const checklistEntries = checklistItems.map(item => ({
                checklistId: checklist._id,
                checklistItemId: item._id,
                comments: item.comments || ''
            }));
            formDataToSubmit.append('checklist', JSON.stringify(checklistEntries));

            // Process item attachments and metadata
            if (excelData && excelData.rows) {
                const itemsWithAttachments = excelData.rows.map(row => {
                    const baseItem = {
                        slNo: row['Sl No'],
                        description: row.Description,
                        unit: row.Unit,
                        qty: row.Quantity,
                        scopeOfSupply: row['Scope of Supply'],
                        installation: row.Installation,
                        erectionSupervision: row['Erection Supervision'],
                        unitRate: row['Unit Rate'],
                        minimumRate: row['Minimum Rate'],
                        amount: row.Amount,
                        remarks: row.Remarks || '',
                        attachmentRequired: row['Attachment Required']?.toLowerCase() === 'yes'
                    };

                    // If attachment is required and exists, add attachment metadata
                    if (row.attachment?.file) {
                        const attachmentFileName = `item_${row['Sl No']}_${Date.now()}.pdf`;
                        formDataToSubmit.append('itemAttachments', row.attachment.file, attachmentFileName);

                        baseItem.attachment = {
                            fileName: attachmentFileName,
                            originalName: row.attachment.file.name,
                            filePath: `public/uploads/boq/item-attachments/${attachmentFileName}`,
                            uploadedAt: new Date()
                        };
                    }

                    return baseItem;
                });

                formDataToSubmit.append('items', JSON.stringify(itemsWithAttachments));
            }

            // Process supporting documents with proper metadata
           // Process supporting documents with proper metadata
if (attachments.length > 0) {
    const attachmentMetadata = attachments.map((attachment, index) => {
        const fileName = `support_${index}_${Date.now()}_${attachment.file.name}`;
        formDataToSubmit.append('attachments', attachment.file, fileName);
        
        return {
            name: attachment.name,  // User-entered name from dialog
            originalName: attachment.file.name,
            fileName: fileName
        };
    });
    
    // Add the metadata to the form data
    formDataToSubmit.append('attachmentMetadata', JSON.stringify(attachmentMetadata));
}

            // Add remarks if present
            if (remarks) {
                formDataToSubmit.append('remarks', remarks);
            }

            // Log form data for debugging
            console.log('Form Data Contents:');
            for (let [key, value] of formDataToSubmit.entries()) {
                if (value instanceof File) {
                    console.log(key, `File: ${value.name} (${value.type})`);
                } else {
                    console.log(key, value);
                }
            }

            const response = await dispatch(createNewBOQ(formDataToSubmit)).unwrap();
            console.log('BOQ Creation Response:', response);

            showToast('success', 'BOQ created successfully');
            onReset();

        } catch (err) {
            console.error('Error creating BOQ:', err);
            showToast('error', err.message || 'Failed to create BOQ');
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Review BOQ Details</h2>
                </div>

                {/* Content Sections */}
                <div className="space-y-6">
                    {/* Business Opportunity Section */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Opportunity Details</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Client Name</label>
                                <p className="mt-1 text-base text-gray-900">{opportunity.client?.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Business Category</label>
                                <p className="mt-1 text-base text-gray-900">{opportunity.businessCategory}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Opportunity Number</label>
                                <p className="mt-1 text-base text-gray-900">{opportunity.opportunityNumber}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Estimated Value</label>
                                <p className="mt-1 text-base text-gray-900">{formatCurrency(opportunity.estimatedValue)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Checklist Section */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Checklist Details</h3>
                        <div className="space-y-4">
                            {checklistItems.map((item, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-start">
                                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 mr-4">
                                            <FaCheck className={`h-4 w-4 ${item.checked ? 'text-green-600' : 'text-gray-400'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{item.description}</p>
                                            {item.comments && (
                                                <div className="mt-2 bg-white rounded p-3 border border-gray-200">
                                                    <p className="text-sm text-gray-600">{item.comments}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BOQ File Section */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">BOQ File</h3>
                        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                            <FaFileExcel className="h-6 w-6 text-green-500" />
                            <span className="text-sm font-medium text-gray-900">{excelFile.name}</span>
                        </div>
                    </div>

                    {/* Attachments Section */}
                    {attachments.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supporting Documents</h3>
                            <div className="space-y-3">
                                {attachments.map((attachment, index) => (
                                    <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                                        <FaFilePdf className="h-6 w-6 text-red-500" />
                                        <span className="text-sm font-medium text-gray-900">{attachment.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Remarks Section */}
                    {remarks && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Remarks</h3>
                            <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">{remarks}</p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between mt-8">
                    <button
                        onClick={onBack}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <FaArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
                    >
                        Create BOQ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewStage;