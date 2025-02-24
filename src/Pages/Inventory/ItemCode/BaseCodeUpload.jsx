import React, { useState } from 'react';
import { FaFileExcel, FaCheckCircle, FaDownload, FaExclamationTriangle } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { showToast } from '../../../utilities/toastUtilities';
import { useDispatch, useSelector } from 'react-redux';
import {createBaseCode} from '../../../Slices/inventoryModuleSlices/itemCodeSlices';
import { Card, CardContent, CardHeader, CardTitle } from '../../../Components/Card';

const BaseCodeUpload = ({ itemType, onBack }) => {
    const dispatch = useDispatch();
    const [excelFile, setExcelFile] = useState(null);
    const [excelData, setExcelData] = useState(null);
    const [errors, setErrors] = useState([]);
    const { loading:{createBaseCode:loading},
    error:{createBaseCode:error},
    success:{createBaseCode:createSuccess}
} = useSelector(state => state.itemCode);
const [remarks, setRemarks] = useState('')


const requiredColumns = [
    'Type', 'Category Code', 'Major Group Code', 
    'Item Name', 'Primary Unit', 'HSN/SAC',
    'DCA Code', 'Sub DCA Code'
];

const downloadTemplate = () => {
    const template = {
        'Type': 'MATERIAL',
        'Category Code': '3',
        'Major Group Code': 'OC',
        'Item Name': 'HAND GLOVES',
        'Primary Unit': 'PCS',
        'HSN/SAC': '85365020',
        'DCA Code': 'DCA-11',
        'Sub DCA Code': 'SDCA-11.1',
        'Is Asset': 'No',
        'Asset Category': ''
    };

    const ws = XLSX.utils.json_to_sheet([template]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Base Code Template');
    XLSX.writeFile(wb, 'base_code_template.xlsx');
};

const validateHeaders = (headers) => {
    const missingColumns = requiredColumns.filter(col => 
        !headers.find(header => header === col)
    );
    if (missingColumns.length > 0) {
        setErrors(missingColumns.map(col => `Missing column: ${col}`));
        return false;
    }
    return true;
};

const validateRow = (row, index) => {
    const errors = [];
    if (!row['Type'] || !row['Type'].toString().trim()) {
        errors.push(`Row ${index + 2}: Type is required`);
    }
    if (!row['Category Code'] || !row['Category Code'].toString().trim()) {
        errors.push(`Row ${index + 2}: Category Code is required`);
    }
    if (!row['Major Group Code'] || !row['Major Group Code'].toString().trim()) {
        errors.push(`Row ${index + 2}: Major Group Code is required`);
    }
    if (!row['Item Name'] || !row['Item Name'].toString().trim()) {
        errors.push(`Row ${index + 2}: Item Name is required`);
    }
    if (!row['Primary Unit'] || !row['Primary Unit'].toString().trim()) {
        errors.push(`Row ${index + 2}: Primary Unit is required`);
    }
    if (!row['HSN/SAC'] || !row['HSN/SAC'].toString().trim()) {
        errors.push(`Row ${index + 2}: HSN/SAC is required`);
    }
    if (!row['DCA Code'] || !row['DCA Code'].toString().trim()) {
        errors.push(`Row ${index + 2}: DCA Code is required`);
    }
    if (!row['Sub DCA Code'] || !row['Sub DCA Code'].toString().trim()) {
        errors.push(`Row ${index + 2}: Sub DCA Code is required`);
    }
    return errors;
};

const parseExcel = async (buffer) => {
    try {
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        if (!rawData.length) {
            setErrors(['Excel file is empty']);
            return null;
        }

        if (!validateHeaders(Object.keys(rawData[0]))) {
            return null;
        }

        const allErrors = [];
        const mappedData = rawData.map((row, index) => {
            const rowErrors = validateRow(row, index);
            if (rowErrors.length > 0) {
                allErrors.push(...rowErrors);
            }

            return {
                type: row['Type']?.trim().toUpperCase(),
                categoryCode: row['Category Code']?.trim(),
                majorGroupCode: row['Major Group Code']?.trim(),
                itemName: row['Item Name']?.trim(),
                primaryUnit: row['Primary Unit']?.trim(),
                hsnSac: row['HSN/SAC']?.trim(),
                dcaCode: row['DCA Code']?.trim(),
                subDcaCode: row['Sub DCA Code']?.trim(),
                isAsset: row['Is Asset']?.toLowerCase() === 'yes',
                assetCategory: row['Asset Category']?.trim() || '',
                status: 'Verification',
                levelId: 1,
                active: true
            };
        });

        if (allErrors.length > 0) {
            setErrors(allErrors);
            return null;
        }

        // Log the first row of mapped data for debugging
        console.log('First row of mapped data:', mappedData[0]);

        return {
            headers: [
                'type', 'categoryCode', 'majorGroupCode', 
                'itemName', 'primaryUnit', 'hsnSac',
                'dcaCode', 'subDcaCode', 'isAsset', 'assetCategory'
            ],
            rows: mappedData
        };
    } catch (error) {
        console.error('Excel parsing error:', error);
        setErrors(['Failed to parse Excel file']);
        return null;
    }
};

const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file?.name.match(/\.(xlsx|xls)$/)) {
        showToast('error', 'Please upload a valid Excel file');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const data = await parseExcel(e.target.result);
        if (data) {
            setExcelFile(file);
            setExcelData(data);
            setErrors([]);
        }
    };
    reader.readAsArrayBuffer(file);
};

const handleSubmit = async () => {
    try {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks');
            return;
        }

        const requestData = {
            formData: {
                isExcelUpload: 'true',
                data: JSON.stringify(excelData.rows), 
                remarks: remarks,
                type: itemType
            },
            isExcelUpload: true
        };

        console.log('Sending data:', requestData);
        
        const result = await dispatch(createBaseCode(requestData)).unwrap();
        
        if (result.success) {
            showToast('success', `Successfully created ${result.data.results.success.length} base codes`);
            if (result.data.results.errors.length > 0) {
                showToast('warning', `${result.data.results.errors.length} items failed`);
            }
            setExcelFile(null);
            setExcelData(null);
            setErrors([]);
            setRemarks('');
        }
    } catch (err) {
        console.error('Upload error:', err);
        showToast('error', err.message || 'Failed to upload base codes');
    }
};

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Base Code Excel Upload
            </h2>

            <div className="mb-4 flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <span className="text-sm text-gray-600">
                    Download the template for correct format
                </span>
                <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                    <FaDownload className="text-gray-500" />
                    <span>Template</span>
                </button>
            </div>

            {errors.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                        <FaExclamationTriangle />
                        <span className="font-semibold">Missing Required Columns:</span>
                    </div>
                    <ul className="list-disc list-inside text-sm text-red-600">
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex justify-center mb-4">
                <label className="flex flex-col items-center justify-center w-96 h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center p-4">
                        {excelFile ? (
                            <>
                                <FaCheckCircle className="w-8 h-8 text-green-500 mb-2" />
                                <p className="text-sm text-gray-500 truncate max-w-xs">
                                    {excelFile.name}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setExcelFile(null);
                                        setExcelData(null);
                                        setErrors([]);
                                        
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

            {excelData && (
                <div className="border rounded-lg overflow-auto max-h-[calc(100vh-300px)] mb-4">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {excelData.headers.map((header, index) => (
                                    <th key={index} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {excelData.rows.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-gray-50">
                                    {excelData.headers.map((header, colIndex) => (
                                        <td key={`${rowIndex}-${colIndex}`} className="px-4 py-2 text-sm whitespace-nowrap">
                                            {typeof row[header] === 'boolean' ? 
                                    (row[header] ? 'Yes' : 'No') : 
                                    row[header]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

              <Card>
                                    <CardHeader>
                                        <CardTitle>Additional Information</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Remarks
                                            </label>
                                            <textarea
                                                name="remarks"
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                                rows={4}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2"
                                                placeholder="Enter any additional remarks..."
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

            <div className="flex justify-between mt-6">
                <button
                    onClick={onBack}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                    Back
                </button>

                {excelData && (
                    <button
                        onClick={handleSubmit}
                        disabled={loading || errors.length > 0}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Uploading...' : 'Submit Data'}
                    </button>
                )}
            </div>
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-5 rounded-lg flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                        <span>Processing...</span>
                    </div>
                </div>
            )}

        </div>
    );
};

export default BaseCodeUpload;