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
        'Item Name', 'Primary Unit', 'HSN/SAC Code',
        'DCA Code', 'Sub DCA Code'
    ];
    const downloadTemplate = () => {
        const template = {
            'type': 'MATERIAL',
            'categoryCode': '3',
            'majorGroupCode': 'OC',
            'itemName': 'HAND GLOVES',
            'primaryUnit': 'PCS',
            'hsnSac': '85365020',
            'dcaCode': 'DCA-11',
            'subDcaCode': 'SDCA-11.1',
            'isAsset': 'No',
            'assetCategory': ''
        };
    
        const ws = XLSX.utils.json_to_sheet([template]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Base Code Template');
        XLSX.writeFile(wb, 'base_code_template.xlsx');
    };
    
    const validateRow = (row) => {
        const requiredFields = [
            'type',
            'categoryCode',
            'majorGroupCode',
            'itemName',
            'primaryUnit',
            'hsnSac',
            'dcaCode',
            'subDcaCode'
        ];
        
        const errors = [];
        requiredFields.forEach(field => {
            if (!row[field]?.trim()) {
                errors.push(`${field} is required`);
            }
        });
        return errors;
    };

    
    const validateHeaders = (headers) => {
        const missingColumns = requiredColumns.filter(col => 
            !headers.find(header => header.trim().toLowerCase() === col.toLowerCase())
        );
        setErrors(missingColumns);
        return missingColumns.length === 0;
    };

    const parseExcel = async (buffer) => {
        try {
            const workbook = XLSX.read(buffer, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rawData = XLSX.utils.sheet_to_json(worksheet);
            
            // Map the data using exact field names from DB schema
            const mappedData = rawData.map(row => ({
                type: row['type']?.toString().trim() || '',
                categoryCode: row['categoryCode']?.toString().trim() || '',
                majorGroupCode: row['majorGroupCode']?.toString().trim() || '',
                itemName: row['itemName']?.toString().trim() || '',
                primaryUnit: row['primaryUnit']?.toString().trim() || '',
                hsnSac: row['hsnSac']?.toString().trim() || '',
                dcaCode: row['dcaCode']?.toString().trim() || '',
                subDcaCode: row['subDcaCode']?.toString().trim() || '',
                isAsset: row['isAsset']?.toString().toLowerCase() === 'yes',
                assetCategory: row['assetCategory']?.toString().trim() || ''
            }));
    
            // Validate required fields
            const rowErrors = [];
            mappedData.forEach((row, index) => {
                const errors = validateRow(row);
                if (errors.length > 0) {
                    rowErrors.push({ row: index + 2, errors });
                }
            });
    
            if (rowErrors.length > 0) {
                setErrors(rowErrors);
                return null;
            }
    
            return {
                headers: [
                    'type',
                    'categoryCode',
                    'majorGroupCode',
                    'itemName',
                    'primaryUnit',
                    'hsnSac',
                    'dcaCode',
                    'subDcaCode',
                    'isAsset',
                    'assetCategory'
                ],
                rows: mappedData
            };
        } catch (error) {
            showToast('error', 'Failed to parse Excel file');
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
    
            // Map data before sending
            const mappedRows = excelData.rows.map(row => ({
                type: row['Type'].toUpperCase(),
                categoryCode: row['Category Code'],
                majorGroupCode: row['Major Group Code'],
                itemName: row['Item Name'],
                primaryUnit: row['Primary Unit'],
                hsnSac: row['HSN/SAC Code'],
                dcaCode: row['DCA Code'],
                subDcaCode: row['Sub DCA Code'],
                isAsset: row['Is Asset'].toLowerCase() === 'yes',
                assetCategory: row['Asset Category']
            }));
    
            const formData = new FormData();
            formData.append('excelFile', excelFile);
            formData.append('type', itemType);
            formData.append('remarks', remarks);
            formData.append('data', JSON.stringify(mappedRows));
    
            await dispatch(createBaseCode({
                formData,
                isExcelUpload: true
            })).unwrap();
    
            if (!error) {
                showToast('success', 'Base codes uploaded successfully');
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
                <div className="border rounded-lg overflow-auto max-h-[calc(100vh-300px)]">
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
                                            {row[header]}
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