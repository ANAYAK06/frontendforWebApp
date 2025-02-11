// components/BOQRevision/BOQPreviewExport.jsx
import React, { useRef, useState } from 'react';
import { FaArrowLeft, FaDownload,FaUpload, FaFileAlt } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { usePDF } from 'react-to-pdf';
import CustomDatePicker from '../../Components/CustomDatePicker';
import { createClientBOQThunk } from '../../Slices/projectModuleSlices/clientFinalBoqSlices';
import { showToast } from '../../utilities/toastUtilities';
import { useDispatch } from 'react-redux';

const BOQPreviewExport = ({ boq, mergedData, originalWorkbook, onBack }) => {
    const { toPDF, targetRef } = usePDF({
        filename: `${boq?.offerNumber}_clientFile.pdf`,
        page: { margin: 20 }
    });

    const dispatch = useDispatch();

    const [sendToClientDate, setSendToClientDate] = useState(new Date());
    const [attachments, setAttachments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(prev => [...prev, ...files]);
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setIsSubmitting(true);
    
            // Validate required fields
            if (!boq?._id) {
                showToast('error', 'BOQ ID is required');
                return;
            }
    
            if (!sendToClientDate) {
                showToast('error', 'Send to client date is required');
                return;
            }
    
            // Create FormData object
            const formData = new FormData();
            formData.append('tenderId', boq._id);
            formData.append('sendToClientDate', sendToClientDate.toISOString());
            
            // Append files if any
            if (attachments.length > 0) {
                attachments.forEach((file) => {
                    formData.append('attachments', file);
                });
            }
    
            await dispatch(createClientBOQThunk({ 
                boqData: { 
                    tenderId: boq._id,
                    sendToClientDate: sendToClientDate
                }, 
                files: attachments 
            })).unwrap();
            
            showToast('success', 'Client BOQ created successfully');
            onBack();
    
        } catch (error) {
            showToast('error', error.message || 'Failed to create Client BOQ');
        } finally {
            setIsSubmitting(false);
        }
    };
    const getColumnStyles = (columnIndex) => {
        const baseStyles = "border p-2 text-sm align-top";
        
        switch(columnIndex) {
            case 0: // Sl. No.
                return `${baseStyles} w-16`;
            case 1: // Description
                return `${baseStyles} w-[300px]`;
            case 2: // Unit
                return `${baseStyles} w-20`;
            case 3: // Qty
                return `${baseStyles} w-20`;
            case 4: // Scope of Supply
                return `${baseStyles} w-28`;
            case 5: // Installation
                return `${baseStyles} w-28`;
            case 6: // Unit Rate
                return `${baseStyles} w-24`;
            case 7: // Erection Supervision
                return `${baseStyles} w-32`;
            case 8: // Remarks
                return `${baseStyles} w-28`;
            case 9: // Spec
                return `${baseStyles} w-20`;
            case 10: // Amount
                return `${baseStyles} w-24`;
            default:
                return baseStyles;
        }
    };
    const formatCellContent = (content, columnIndex) => {
        // If content is numeric, right-align it
        const isNumeric = !isNaN(content) && content !== '';
        const alignment = isNumeric ? 'text-right' : 'text-left';
        
        return (
            <div className={`whitespace-pre-line break-words ${alignment}`}>
                {content}
            </div>
        );
    };


    const exportMappedData = async (format = 'excel') => {
        try {
            if (format === 'excel') {
                const newWorkbook = XLSX.utils.book_new();
                
                originalWorkbook.SheetNames.forEach((sheetName, index) => {
                    if (index === 0) {
                        const ws = XLSX.utils.aoa_to_sheet(mergedData);
                        XLSX.utils.book_append_sheet(newWorkbook, ws, sheetName);
                    } else {
                        const ws = originalWorkbook.Sheets[sheetName];
                        XLSX.utils.book_append_sheet(newWorkbook, ws, sheetName);
                    }
                });

                XLSX.writeFile(newWorkbook, `${boq.offerNumber}_revised.xlsx`);
            } else if (format === 'pdf') {
                await toPDF();
            }
        } catch (err) {
            console.error('Error exporting file:', err);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                >
                    <FaArrowLeft className="mr-2" />
                    Back to Mapping
                </button>
                <h2 className="text-xl font-semibold">Preview and Export - {boq.offerNumber}</h2>
            </div>

            {/* BOQ Details Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Client</span>
                    <span className="font-medium">{boq.businessOpportunity?.client?.name}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500">BOQ Number</span>
                    <span className="font-medium">{boq.offerNumber}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Total Items</span>
                    <span className="font-medium">{boq.items?.length || 0}</span>
                </div>
            </div>
            


            {/* Preview Table */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Preview</h3>
                        <div className="flex gap-4">
                            <button
                                onClick={() => exportMappedData('excel')}
                                className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
                            >
                                <FaDownload className="mr-2" />
                                Export Excel
                            </button>
                            <button
                                onClick={() => exportMappedData('pdf')}
                                className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                            >
                                <FaDownload className="mr-2" />
                                Export PDF
                            </button>
                        </div>
                    </div>

                    {/* Table with PDF Export Reference */}
                    <div className="overflow-x-auto" ref={targetRef}>
                    <style type="text/css" media="print">
                    {`
                        @page {
                            size: landscape;
                            margin: 20mm;
                        }
                        table {
                            page-break-inside: auto;
                        }
                        tr {
                            page-break-inside: avoid;
                            page-break-after: auto;
                        }
                        td, th {
                            word-wrap: break-word;
                            white-space: pre-line !important;
                        }
                    `}
                </style>
                        <table className="min-w-full bg-white border border-collapse">
                            <thead>
                                <tr>
                                    {mergedData[0].map((header, index) => (
                                        <th 
                                            key={index} 
                                            className={`${getColumnStyles(index)} bg-gray-100 font-semibold`}
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {mergedData.slice(1).map((row, rowIndex) => (
                                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : ''}>
                                        {row.map((cell, cellIndex) => (
                                            <td 
                                                key={cellIndex} 
                                                className={getColumnStyles(cellIndex)}
                                                // style={{
                                                //     maxWidth: '200px',
                                                //     overflow: 'hidden',
                                                //     textOverflow: 'ellipsis',
                                                //     whiteSpace: 'nowrap'
                                                // }}
                                            >
                                               {formatCellContent(cell, cellIndex)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
                <h3 className="text-lg font-semibold mb-4">Submit BOQ Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date Picker */}
                    <div>
                      
                        <CustomDatePicker
                            selectedDate={sendToClientDate}
                            onChange={(date) => setSendToClientDate(date)}
                            label="Send to Client Date"
                            minDate={new Date()}
                            placeholder="Select date"
                        />
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Attachments
                        </label>
                        <div className="space-y-2">
                            <button
                            type='button'
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <FaUpload className="mr-2" />
                                Upload Files
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".pdf"
                                multiple
                                className="hidden"
                            />
                        </div>
                    </div>
                </div>

                {/* Attached Files List */}
                {attachments.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Attached Files</h4>
                        <div className="space-y-2">
                            {attachments.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex items-center">
                                        <FaFileAlt className="text-gray-400 mr-2" />
                                        <span className="text-sm">{file.name}</span>
                                    </div>
                                    <button
                                        onClick={() => removeAttachment(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                 <button
                        type='submit'
                        disabled={isSubmitting || !sendToClientDate|| !boq?._id}
                        className={`flex items-center px-6 py-2 rounded text-white ${
                            isSubmitting ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
                        }`}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit BOQ'}
                    </button>
            </form>

            {/* Footer Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                >
                    <FaArrowLeft className="mr-2" />
                    Back to Mapping
                </button>
               
            </div>

            {/* Loading Indicator - Optional */}
            {isSubmitting && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-lg">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                        <p className="mt-2 text-sm">Creating Client BOQ for Submission...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BOQPreviewExport;