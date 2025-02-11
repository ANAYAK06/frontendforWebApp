// components/BOQRevision/BOQUploadMapping.jsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaArrowLeft, FaUpload, FaFileExcel, FaSave, FaTrash } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const BOQUploadMapping = ({ boq, onBack, onMappingComplete }) => {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [clientColumns, setClientColumns] = useState([]);
    const [mappings, setMappings] = useState({});
    const [templateName, setTemplateName] = useState('');
    const [savedTemplates, setSavedTemplates] = useState([]);
    const [error, setError] = useState(null);
    const [originalFileData, setOriginalFileData] = useState(null);
    const [originalWorkbook, setOriginalWorkbook] = useState(null);

    // Standard BOQ columns
    const standardColumns = [
        { key: 'slNo', label: 'Sl No' },
        { key: 'description', label: 'Description' },
        { key: 'unit', label: 'Unit' },
        { key: 'qty', label:'Quantity'},
        { key: 'unitRate', label: 'Unit Rate' },
        { key: 'amount', label: 'Amount' }
    ];

    // File upload handler
    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];
        setUploadedFile(file);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                setOriginalWorkbook(workbook);

                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                setOriginalFileData(jsonData);

                if (jsonData.length === 0) {
                    throw new Error('File appears to be empty');
                }

                const headers = jsonData[0];
                setClientColumns(headers.map((header, index) => ({
                    key: `col_${index}`,
                    label: String(header)
                })));
                setError(null);
            } catch (err) {
                setError('Error reading file. Please ensure it\'s a valid Excel file.');
                setUploadedFile(null);
                setClientColumns([]);
            }
        };
        reader.readAsArrayBuffer(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        multiple: false
    });

    // Handle mapping changes
    const handleMappingChange = (standardKey, clientKey) => {
        setMappings(prev => ({
            ...prev,
            [standardKey]: clientKey
        }));
    };

    // Apply mapping and proceed to preview
    const applyMapping = () => {
        if (!boq.items || !clientColumns.length) {
            setError('No data to map');
            return;
        }

        try {
            // Create mapped data
            const mapped = boq.items.map((item) => {
                const newRow = {};
                clientColumns.forEach(clientCol => {
                    const standardKey = Object.entries(mappings)
                        .find(([_, value]) => value === clientCol.key)?.[0];

                    if (standardKey) {
                        let value = item[standardKey];
                        if (standardKey === 'amount' || standardKey === 'unitRate') {
                            value = typeof value === 'number' ? value.toFixed(2) : value;
                        }
                        newRow[clientCol.label] = value;
                    } 
                });
                return newRow;
            });

            // Create merged data
            const mergedRows = [...originalFileData];
            const dataStartRow = 1;

            mapped.forEach((mappedRow, index) => {
                if (!mergedRows[dataStartRow + index]) {
                    mergedRows[dataStartRow + index] = Array(originalFileData[0].length).fill('');
                }

                Object.entries(mappedRow).forEach(([header, value]) => {
                    const columnIndex = originalFileData[0].findIndex(h => h === header);
                    if (columnIndex !== -1 && value !== undefined && value !== '') {
                        mergedRows[dataStartRow + index][columnIndex] = value;
                    }
                });
            });

            onMappingComplete(mapped, mergedRows, originalWorkbook);
        } catch (err) {
            setError('Error applying mapping');
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
                    Back to List
                </button>
                <h2 className="text-xl font-semibold">Upload Template - {boq.offerNumber}</h2>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                    {error}
                </div>
            )}

            {/* File Upload Area */}
            <div
                {...getRootProps()}
                className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                    ${uploadedFile ? 'bg-green-50 border-green-500' : ''}
                `}
            >
                <input {...getInputProps()} />
                <FaFileExcel className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                {uploadedFile ? (
                    <div className="text-green-700">
                        <p className="font-semibold">{uploadedFile.name}</p>
                        <p className="text-sm">File loaded successfully</p>
                    </div>
                ) : isDragActive ? (
                    <p>Drop the Excel file here ...</p>
                ) : (
                    <p>Drag and drop client's Excel template, or click to select</p>
                )}
            </div>

            {/* Mapping Interface */}
            {clientColumns.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Column Mapping</h3>
                    
                    <div className="grid gap-4">
                        {standardColumns.map(standardCol => (
                            <div key={standardCol.key} className="flex items-center gap-4">
                                <label className="w-1/4 font-medium">{standardCol.label}</label>
                                <select
                                    className="flex-1 border rounded p-2"
                                    value={mappings[standardCol.key] || ''}
                                    onChange={(e) => handleMappingChange(standardCol.key, e.target.value)}
                                >
                                    <option value="">Select matching column</option>
                                    {clientColumns.map(clientCol => (
                                        <option key={clientCol.key} value={clientCol.key}>
                                            {clientCol.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>

                    {/* Action Button */}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={applyMapping}
                            className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                        >
                            <FaUpload className="mr-2" />
                            Continue to Preview
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BOQUploadMapping;