import React, { useState } from 'react';
import { FaFileExcel, FaCheckCircle, FaPaperclip, FaTrash, FaExclamationTriangle, FaFilePdf, FaDownload } from 'react-icons/fa';
import { showToast } from '../../utilities/toastUtilities';
import * as XLSX from 'xlsx';

const BOQUploadStage = ({ excelFile, excelData, onUpdate, onNext, onBack }) => {
    const [headerErrors, setHeaderErrors] = useState([]);

    const requiredColumns = [
        'Sl No',
        'Description',
        'Unit',
        'Quantity',
        'Scope of Supply',
        'Installation',
        'Erection Supervision',
        'Unit Rate',
        'Minimum Rate',
        'Amount',
        'Attachment Required'
    ];

    const downloadTemplate = () => {
        const template = {
            'Sl No': '1',
            'Description': 'Sample Item Description',
            'Unit': 'Nos.',
            'Quantity': '1',
            'Scope of Supply': 'JSOL',
            'Installation': 'Bidder',
            'Erection Supervision': 'Bidder',
            'Unit Rate': '1000',
            'Minimum Rate': '800',
            'Amount': '1000',
            'Attachment Required': 'Yes'
        };
    
        const ws = XLSX.utils.json_to_sheet([template]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'BOQ Template');
        
        // Generate and download the file
        XLSX.writeFile(wb, 'boq_template.xlsx');
    };

    const getRateColor = (unitRate, minRate) => {
        if (!unitRate || !minRate) return '';
        if (unitRate > minRate) return 'text-green-500';
        if (unitRate < minRate) return 'text-red-500';
        return 'text-orange-500';
    };


    const validateHeaders = (headers) => {
        const missingColumns = requiredColumns.filter(
            col => !headers.find(header =>
                header.trim().toLowerCase() === col.toLowerCase())
        );
        setHeaderErrors(missingColumns);
        return missingColumns.length === 0;
    };

    const validateData = (data) => {
        const errors = [];
        data.forEach((row, index) => {
            // Validate numeric fields
            if (isNaN(row['Quantity']) || row['Quantity'] <= 0) {
                errors.push(`Row ${index + 1}: Invalid Quantity`);
            }
            if (isNaN(row['Unit Rate']) || row['Unit Rate'] <= 0) {
                errors.push(`Row ${index + 1}: Invalid Unit Rate`);
            }
            if (isNaN(row['Minimum Rate']) || row['Minimum Rate'] <= 0) {
                errors.push(`Row ${index + 1}: Invalid Minimum Rate`);
            }
            if (isNaN(row['Amount']) || row['Amount'] <= 0) {
                errors.push(`Row ${index + 1}: Invalid Amount`);
            }
            // Validate Attachment Required
            if (!['yes', 'no'].includes(row['Attachment Required']?.toString().toLowerCase())) {
                errors.push(`Row ${index + 1}: Attachment Required must be 'Yes' or 'No'`);
            }
        });
        return errors;
    };

    const parseExcel = async (buffer) => {
        try {
            const workbook = XLSX.read(buffer, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const headers = jsonData[0];

            if (!validateHeaders(headers)) {
                return null;
            }

            const rows = jsonData.slice(1);
            const formattedData = {
                headers,
                rows: rows.map(row => {
                    const rowData = {};
                    headers.forEach((header, index) => {
                        rowData[header] = row[index];
                        if (header === 'Attachment Required') {
                            rowData.attachment = null;
                        }
                    });
                    return rowData;
                })
            };

            const dataErrors = validateData(formattedData.rows);
            if (dataErrors.length > 0) {
                showToast('error', 'Invalid data in Excel file');
                setHeaderErrors(dataErrors);
                return null;
            }

            return formattedData;
        } catch (error) {
            showToast('error', 'Failed to parse Excel file');
            return null;
        }
    };

    const handleExcelUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.name.match(/\.(xlsx|xls)$/)) {
                showToast('error', 'Please upload a valid Excel file');
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = await parseExcel(e.target.result);
                if (data) {
                    onUpdate({ excelFile: file, excelData: data });
                    setHeaderErrors([]);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleAttachmentUpload = async (e, rowIndex) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                showToast('error', 'Only PDF files are allowed');
                return;
            }

            const updatedData = {
                ...excelData,
                rows: excelData.rows.map((row, index) => {
                    if (index === rowIndex) {
                        return {
                            ...row,
                            attachment: {
                                fileName: file.name,
                                file: file,
                                uploadedAt: new Date()
                            }
                        };
                    }
                    return row;
                })
            };
            onUpdate({ excelFile, excelData: updatedData });
        }
    };

    const removeAttachment = (rowIndex) => {
        const updatedData = {
            ...excelData,
            rows: excelData.rows.map((row, index) => {
                if (index === rowIndex) {
                    return {
                        ...row,
                        attachment: null
                    };
                }
                return row;
            })
        };
        onUpdate({ excelFile, excelData: updatedData });
    };

    const handleNext = () => {
        if (!excelFile) {
            showToast('error', 'Please upload BOQ Excel file');
            return;
        }

        const missingAttachments = excelData.rows.some(row =>
            row['Attachment Required']?.toString().toLowerCase() === 'yes' && !row.attachment
        );

        if (missingAttachments) {
            showToast('error', 'Please upload all required attachments');
            return;
        }

        onNext();
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        }).format(value).replace('₹', '');
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                BOQ Excel Upload
            </h2>

            {/* Format Info */}
            <div className="mb-4 flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <span className="text-sm text-gray-600">
                Download the template for correct Excel format
            </span>
            <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
                <FaDownload className="text-gray-500" />
                <span>Template</span>
            </button>
        </div>

            {/* Error Display */}
            {headerErrors.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                        <FaExclamationTriangle />
                        <span className="font-semibold">Validation Errors:</span>
                    </div>
                    <ul className="list-disc list-inside text-sm text-red-600">
                        {headerErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Upload Area */}
            <div className="flex justify-center mb-4">
                <label className="flex flex-col items-center justify-center w-96 h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center p-4">
                        {excelFile ? (
                            <>
                                <FaCheckCircle className="w-8 h-8 text-green-500 mb-2" />
                                <p className="text-sm text-gray-500 truncate max-w-xs">{excelFile.name}</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onUpdate({ excelFile: null, excelData: null });
                                        setHeaderErrors([]);
                                    }}
                                    className="mt-1 text-red-500 hover:text-red-700 text-sm"
                                >
                                    Remove
                                </button>
                            </>
                        ) : (
                            <>
                                <FaFileExcel className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">
                                    <span className="font-semibold">Upload Excel</span>
                                </p>
                                <p className="text-xs text-gray-500">.xlsx, .xls</p>
                            </>
                        )}
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleExcelUpload}
                        accept=".xlsx,.xls"
                    />
                </label>
            </div>

            {/* Data Preview */}
            {excelData && (
                <div className="border rounded-lg overflow-auto max-h-[calc(100vh-300px)]">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {excelData.headers
                                    .filter(header => header !== 'Attachment Required')
                                    .map((header, index) => (
                                        <th
                                            key={index}
                                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                <th className="px-4 py-2 w-20 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                                    File
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {excelData.rows.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-gray-50">
                                    {excelData.headers
                                        .filter(header => header !== 'Attachment Required')
                                        .map((header, colIndex) => {
                                            const cellContent = row[header];
                                            const isLongText = cellContent && cellContent.toString().length > 50;
                                            const isNumeric = ['Unit Rate', 'Minimum Rate', 'Amount'].includes(header);
                                            const isUnitRate = header === 'Unit Rate';
                                            const rateColor = isUnitRate ?
                                                getRateColor(parseFloat(cellContent), parseFloat(row['Minimum Rate'])) : '';

                                            return (
                                                <td
                                                    key={`${rowIndex}-${colIndex}`}
                                                    className={`px-4 py-2 text-sm ${isLongText
                                                            ? 'whitespace-normal break-words max-w-xs'
                                                            : 'whitespace-nowrap'
                                                        } ${isNumeric ? 'text-right' : ''
                                                        } ${rateColor}`}
                                                >
                                                    {isNumeric ? formatCurrency(cellContent) : cellContent}
                                                </td>
                                            );
                                        })}
                                    <td className="px-4 py-2 w-20">
                                        {row['Attachment Required']?.toString().toLowerCase() === 'yes' && (
                                            <div className="flex items-center justify-center gap-2">
                                                {row.attachment ? (
                                                    <>
                                                        <div className="group relative">
                                                            <FaFilePdf
                                                                className="text-red-500 cursor-pointer"
                                                                title={row.attachment.fileName}
                                                            />
                                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 mb-2 hidden group-hover:block whitespace-nowrap">
                                                                {row.attachment.fileName}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => removeAttachment(rowIndex)}
                                                            className="text-gray-400 hover:text-red-500"
                                                            title="Remove attachment"
                                                        >
                                                            <FaTrash size={14} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <label className="cursor-pointer" title="Upload PDF">
                                                        <FaPaperclip className="text-gray-400 hover:text-blue-500" />
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept=".pdf"
                                                            onChange={(e) => handleAttachmentUpload(e, rowIndex)}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {/* Navigation */}
            <div className="flex justify-between mt-6">
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
        </div>
    );
};

export default BOQUploadStage;