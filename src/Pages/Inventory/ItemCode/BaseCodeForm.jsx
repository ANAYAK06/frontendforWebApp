import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../../Components/Card';
import { FaBarcode } from "react-icons/fa";
import {createBaseCode, getDCAForItemCode, getSubDCAForItemCode} from '../../../Slices/inventoryModuleSlices/itemCodeSlices';
import { getAllApprovedHSNThunk } from '../../../Slices/taxModuleSlices/hsnSacCodeSlices';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '../../../Components/DailogComponent';
import { showToast } from '../../../utilities/toastUtilities';
import { MATERIAL_CATEGORIES, MATERIAL_MAJOR_GROUPS, ASSET_CATEGORIES } from '../../../constents/materialConstants';
import { SERVICE_CATEGORIES, SERVICE_MAJOR_GROUPS } from '../../../constents/serviceConstants';
import {getUnitsByTypeThunk} from '../../../Slices/inventoryModuleSlices/itemCodeUnitSlices'

const BaseCodeForm = ({ itemType, onBack }) => {

   
    const dispatch = useDispatch();
    const { loading:{createBaseCode:loading},
        error:{createBaseCode:error},
        success:{createBaseCode:createSuccess}
    } = useSelector(state => state.itemCode);
    const { 
        dcaCodes,
        subDcaCodes, 
        loading: { 
            getDcaCodes: dcaLoading,
            getSubDcaCodes: subDCALoading 
        },
        error: {
            getDcaCodes: dcaError,
            getSubDcaCodes: subDcaError
        }
    } = useSelector((state) => state.itemCode);
    const { 
        unitsByType,
        loading: unitLoading,
        error: unitError 
    } = useSelector((state) => state.unit);
 
    const { approvedHSNCodes } = useSelector((state) => state.hsnsac)
    const [showResetDialog, setShowResetDialog] = useState(false);

    const initialFormState = useMemo(() => ({
        type: itemType,
        categoryCode: '',
        majorGroupCode: '',
        itemName: '',
        primaryUnit: '',
        hsnSac: '',
        dcaCode: '',
        subDcaCode: '',
        isAsset: false,
        assetCategory: '',
        remarks: ''
    }), [itemType]);

    const [formData, setFormData] = useState(initialFormState);
    const [isFormDirty, setIsFormDirty] = useState(false);
   

    const getCategories = useCallback(() => {
        return itemType === 'MATERIAL' ? MATERIAL_CATEGORIES : SERVICE_CATEGORIES;
    }, [itemType]);

    const getMajorGroups = useCallback(() => {
        return itemType === 'MATERIAL' ? MATERIAL_MAJOR_GROUPS : SERVICE_MAJOR_GROUPS;
    }, [itemType]);


    useEffect(() => {
        if (itemType === 'MATERIAL' && formData.categoryCode) {
            const category = MATERIAL_CATEGORIES.find(cat => cat.code === formData.categoryCode);
            setFormData(prev => ({
                ...prev,
                isAsset: category?.isAsset || false,
                assetCategory: category?.isAsset ? prev.assetCategory : ''
            }));
        }
    }, [formData.categoryCode, itemType]);

    useEffect(() => {
        
        dispatch(getAllApprovedHSNThunk());
       
    }, [dispatch]);

    useEffect(() => {
        if (itemType) {
            dispatch(getUnitsByTypeThunk({ 
                type: itemType,
                excludeUnit: null // Pass null or the unit to exclude if needed
            }));
        }
    }, [dispatch, itemType]);

    const getUnits = useCallback(() => {
        return unitsByType || [];
    }, [unitsByType]);


    useEffect(() => {
        if (error) showToast('error', error);
        if (dcaError) showToast('error', dcaError);
        if (subDcaError) showToast('error', subDcaError);
    }, [error, dcaError, subDcaError]);

    useEffect(() => {
        if (createSuccess) {
            showToast('success', 'Base code created successfully');
            setFormData(initialFormState);
        }
    }, [createSuccess, initialFormState]);

    useEffect(() => {
        if(itemType){
            
            // Validate the itemType before dispatch
            if (typeof itemType === 'string' && itemType.trim()) {
                dispatch(getDCAForItemCode(itemType));
                
            } else {
                console.error('Invalid itemType:', itemType);
            }
        }
    }, [dispatch, itemType]);

    useEffect(() => {
        if(formData.dcaCode){
            dispatch(getSubDCAForItemCode(formData.dcaCode));
        }   
    }, [dispatch, formData.dcaCode]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'dcaCode' ? { subDcaCode: '' } : {})
        }));
        setIsFormDirty(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(createBaseCode({
                formData: {
                    ...formData,
                    status: 'Verification',
                    levelId: 1
                },
                isExcelUpload: false
            })).unwrap();

            if (!error) {
                showToast('success', 'Base code created successfully');
                setFormData(initialFormState);
            }
        } catch (err) {
            showToast('error', err.message || 'Failed to create base code');
        }
    };

    const handleResetConfirmation = () => {
        setFormData(initialFormState);
        setIsFormDirty(false);
        setShowResetDialog(false);
        showToast('success', 'Form reset successfully');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Details */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <FaBarcode className="w-5 h-5 text-indigo-600" />
                        <CardTitle>Basic Details</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Category Code <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="categoryCode"
                                value={formData.categoryCode}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                required
                            >
                                <option value="">Select Category</option>
                                {getCategories().map(category => (
                                    <option key={category.code} value={category.code}>
                                        {category.code} - {category.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Major Group <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="majorGroupCode"
                                value={formData.majorGroupCode}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                required
                            >
                                <option value="">Select Major Group</option>
                                {getMajorGroups().map(group => (
                                    <option key={group.code} value={group.code}>
                                        {group.code} - {group.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {formData.isAsset && (
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Asset Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="assetCategory"
                                    value={formData.assetCategory}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                    required
                                >
                                    <option value="">Select Asset Category</option>
                                    {ASSET_CATEGORIES.map(category => (
                                        <option key={category} value={category}>
                                            {category.replace(/_/g, ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Item Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="itemName"
                                value={formData.itemName}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                required
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Unit & HSN/SAC Details */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <FaBarcode className="w-5 h-5 text-indigo-600" />
                        <CardTitle>Unit & HSN/SAC Details</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Primary Unit <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="primaryUnit"
                                value={formData.primaryUnit}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                required
                            >
                                <option value="">
                                {unitLoading ? 'Loading Units...' : 'Select Unit'}
                                </option>
                               {Array.isArray(getUnits()) && getUnits().map(unit => (
                                    <option key={unit._id} value={unit.symbol}
                                    className={unit.baseUnit ? 'font-semibold text-indigo-600' : ''}>
                                        {unit.symbol} - {unit.name}
                                        {unit.baseUnit && '- (Base Unit)'}

                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                HSN/SAC Code <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="hsnSac"
                                value={formData.hsnSac}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                required
                            >
                                <option value="">Select HSN/SAC Code</option>
                                {approvedHSNCodes
                                    .filter(hsn => hsn.applicableType === itemType || hsn.applicableType === 'BOTH')
                                    .map(hsn => (
                                        <option key={hsn._id} value={hsn._id}>
                                            {hsn.code} - {hsn.description}
                                            ({hsn.taxRateHistory && hsn.taxRateHistory.length > 0 ?
                                             `GST: ${hsn.taxRateHistory
                                                .sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom))[0]
                                             .igst}%` : 'No tax rate'})
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* DCA Details */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <FaBarcode className="w-5 h-5 text-indigo-600" />
                        <CardTitle>DCA Details</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* DCA Code Dropdown */}
<div>
    <label className="block text-sm font-medium text-gray-700">
        DCA Code <span className="text-red-500">*</span>
    </label>
    <select
        name="dcaCode"
        value={formData.dcaCode}
        onChange={handleChange}
        className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
        required
        disabled={dcaLoading}
    >
        <option value="">
            {dcaLoading ? 'Loading DCAs...' : 'Select DCA'}
        </option>
        {Array.isArray(dcaCodes) && dcaCodes.length > 0 && dcaCodes
          
            .map(dca => (
                <option key={dca._id} value={dca.code}>
                    {dca.code} - {dca.name}
                </option>
            ))}
    </select>
    {dcaError && <p className="mt-1 text-sm text-red-500">{dcaError}</p>}
</div>
                                    

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Sub-DCA Code <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="subDcaCode"
                                value={formData.subDcaCode}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-white border rounded-md"
                                required
                                disabled={!formData.dcaCode || subDCALoading}
                            >
                                <option value="">
                                    {subDCALoading ? 'Loading SubDCAs...' : 'Select Sub-DCA Code'}
                                </option>
                                {Array.isArray(subDcaCodes) && subDcaCodes.map(subDca => (
                                    <option key={subDca._id} value={subDca.subCode}>
                                        {subDca.subCode} - {subDca.subdcaName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>
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
                                                value={formData.remarks}
                                                onChange={handleChange}
                                                rows={4}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2"
                                                placeholder="Enter any additional remarks..."
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

            {/* Form Actions */}
            <div className="flex justify-between mt-6">
                <button
                    type="button"
                    onClick={onBack}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                    Back
                </button>
                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={() => {
                            if (isFormDirty) setShowResetDialog(true);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Base Code'}
                    </button>
                </div>
            </div>

            {/* Reset Dialog */}
            <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <AlertDialogContent className="bg-white">
                    
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                            Reset Form
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-gray-600">
                            Are you sure you want to reset the form? All entered data will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleResetConfirmation}
                            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md"
                        >
                            Yes, Reset Form
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-5 rounded-lg flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                        <span>Processing...</span>
                    </div>
                </div>
            )}
        </form>
    );
};

export default BaseCodeForm;