import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaSearch, FaTrash, FaEdit, FaInfoCircle, FaTags, FaBuilding, FaRupeeSign } from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from '../../../Components/Card';
import CustomDatePicker from '../../../Components/CustomDatePicker';
import { showToast } from '../../../utilities/toastUtilities';
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
import {
    createMaterialRequisitionThunk,
    clearOperationState,
    searchItemsThunk
} from '../../../Slices/inventoryModuleSlices/materialRequisitionSlice';

const MaterialRequisition = () => {
    const dispatch = useDispatch();
    
    // Selectors
    const { searchResults, availableMakes, loading: mrLoading } = useSelector(state => state.materialRequisition);
    const { 
        loading: { create: isCreating, search: isSearching },
        errors: { create: createError, search: searchError },
        success: { create: createSuccess }
    } = useSelector(state => state.materialRequisition);

    // State for search
    const [searchMode, setSearchMode] = useState('code'); // 'code' or 'name'
    const [searchText, setSearchText] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedMake, setSelectedMake] = useState('');
    const [selectedSpec, setSelectedSpec] = useState('');

    // State for requisition
    const [requisitionItems, setRequisitionItems] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [requisitionDate, setRequisitionDate] = useState(new Date());
    const [requiredDate, setRequiredDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Default to a week later
    const [currentQuantity, setCurrentQuantity] = useState(1);
    const [currentUnit, setCurrentUnit] = useState('');
    const [priority, setPriority] = useState('NORMAL');

    // Error handling effect
    useEffect(() => {
        if (createError) {
            showToast('error', createError);
            dispatch(clearOperationState('create'));
        }
        
        if (searchError) {
            showToast('error', searchError);
            dispatch(clearOperationState('search'));
        }
    }, [createError, searchError, dispatch]);

    // Success handling effect
    useEffect(() => {
        if (createSuccess) {
            showToast('success', 'Material requisition created successfully');
            handleReset();
            dispatch(clearOperationState('create'));
        }
    }, [createSuccess, dispatch]);

    // Reset form
    const handleReset = useCallback(() => {
        setRequisitionItems([]);
        setRemarks('');
        setRequisitionDate(new Date());
        setRequiredDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
        setPriority('NORMAL');
        setEditingIndex(null);
        setShowSearch(false);
        setSearchText('');
        setSelectedItem(null);
        setSelectedMake('');
        setSelectedSpec('');
        setSearchMode('code');
        setCurrentQuantity(1);
        setCurrentUnit('');
    }, []);

    // Enhanced search with debouncing and search mode parameter
    const handleSearch = useCallback((e) => {
        const value = e.target.value;
        setSearchText(value);
        
        if (value.trim().length >= 3) {
            // Build search parameters
            const params = {
                query: value.trim(),
                searchMode: searchMode // Add search mode parameter
            };
            
            // Add optional filters
            if (selectedMake) params.make = selectedMake;
            if (selectedSpec) params.specification = selectedSpec;
            
            // Dispatch search action with debounce
            const timeoutId = setTimeout(() => {
                dispatch(searchItemsThunk(params));
                setShowSearch(true);
            }, 300);
            
            return () => clearTimeout(timeoutId);
        } else {
            setShowSearch(false);
        }
    }, [dispatch, searchMode, selectedMake, selectedSpec]);

    // Set current unit when selected item changes
    useEffect(() => {
        if (selectedItem) {
            setCurrentUnit(selectedItem.unitSymbol || '');
        } else {
            setCurrentUnit('');
        }
    }, [selectedItem]);

    // Add item to requisition
    const handleAddItem = useCallback(() => {
        if (!selectedItem) {
            showToast('error', 'Please select an item first');
            return;
        }

        if (!currentQuantity || currentQuantity <= 0) {
            showToast('error', 'Please enter a valid quantity');
            return;
        }
        
        // Find the selected unit info from allowed units
        const selectedUnitInfo = selectedItem.allowedUnits?.find(unit => unit.symbol === currentUnit) || {
            _id: selectedItem.primaryUnit,
            symbol: selectedItem.unitSymbol,
            conversionFactor: 1
        };
        
        // Create new item with all details
        const newItem = {
            itemCode: selectedItem.fullCode || selectedItem.code,
            itemName: selectedItem.itemName,
            primaryUnit: selectedItem.primaryUnit,
            currentUnit: selectedUnitInfo._id,
            unitSymbol: selectedUnitInfo.symbol,
            quantity: parseFloat(currentQuantity),
            basePrice: selectedItem.basePrice || 0,
            conversionFactor: selectedUnitInfo.conversionFactor || 1,
            totalPrice: (selectedItem.basePrice || 0) * parseFloat(currentQuantity) * (selectedUnitInfo.conversionFactor || 1),
            dca: selectedItem.dca || selectedItem.dcaCode || '',
            subDca: selectedItem.subDca || selectedItem.subDcaCode || '',
            make: selectedItem.make || selectedMake,
            specification: selectedItem.specification || selectedSpec,
            id: selectedItem._id || selectedItem.id,
            allowedUnits: selectedItem.allowedUnits || []
        };

        if (editingIndex !== null) {
            // Update existing item
            const updatedItems = [...requisitionItems];
            updatedItems[editingIndex] = newItem;
            setRequisitionItems(updatedItems);
            setEditingIndex(null);
        } else {
            // Add new item
            setRequisitionItems(prev => [...prev, newItem]);
        }

        // Reset selection state
        setSelectedItem(null);
        setSearchText('');
        setSelectedMake('');
        setSelectedSpec('');
        setCurrentQuantity(1);
        setCurrentUnit('');
        setShowSearch(false);
    }, [
        selectedItem, 
        currentQuantity,
        currentUnit,
        selectedMake, 
        selectedSpec, 
        editingIndex, 
        requisitionItems
    ]);

    // Edit item
    const handleEditItem = useCallback((index) => {
        const item = requisitionItems[index];
        setSelectedItem({
            ...item,
            fullCode: item.itemCode,
            _id: item.id
        });
        setCurrentQuantity(item.quantity);
        setCurrentUnit(item.unitSymbol);
        setSelectedMake(item.make);
        setSelectedSpec(item.specification);
        setEditingIndex(index);
        setShowSearch(false);
    }, [requisitionItems]);

    // Remove item
    const handleRemoveItem = useCallback((index) => {
        setRequisitionItems(prev => prev.filter((_, i) => i !== index));
    }, []);

    // Change unit in item details form
    const handleUnitChange = useCallback((e) => {
        setCurrentUnit(e.target.value);
    }, []);

    // Unit change in the requisition items list
    const handleUnitChangeInList = useCallback((index, unitSymbol) => {
        const item = requisitionItems[index];
        const selectedUnit = item.allowedUnits?.find(unit => unit.symbol === unitSymbol);
        
        if (!selectedUnit) return;
        
        const updatedItems = [...requisitionItems];
        updatedItems[index] = {
            ...updatedItems[index],
            currentUnit: selectedUnit._id,
            unitSymbol: selectedUnit.symbol,
            conversionFactor: selectedUnit.conversionFactor || 1,
            totalPrice: item.basePrice * item.quantity * (selectedUnit.conversionFactor || 1)
        };
        setRequisitionItems(updatedItems);
    }, [requisitionItems]);

    // Submit requisition
    const handleSubmit = useCallback(() => {
        if (requisitionItems.length === 0) {
            showToast('error', 'Please add at least one item to the requisition');
            return;
        }

        const requisitionData = {
            items: requisitionItems.map(item => ({
                itemId: item.id,
                quantity: item.quantity,
                unit: item.currentUnit,
                dca: item.dca,
                subDca: item.subDca
            })),
            requisitionDate: requisitionDate.toISOString(),
            requiredDate: requiredDate.toISOString(),
            priority,
            remarks
        };

        dispatch(createMaterialRequisitionThunk(requisitionData));
    }, [dispatch, requisitionItems, requisitionDate, requiredDate, priority, remarks]);

    // Calculate total value
    const totalValue = useMemo(() => {
        return requisitionItems.reduce((sum, item) => sum + item.totalPrice, 0);
    }, [requisitionItems]);

    // Update quantity
    const handleQuantityChange = useCallback((index, value) => {
        const quantity = parseFloat(value);
        if (isNaN(quantity) || quantity <= 0) return;

        const updatedItems = [...requisitionItems];
        updatedItems[index] = {
            ...updatedItems[index],
            quantity,
            totalPrice: updatedItems[index].basePrice * quantity * updatedItems[index].conversionFactor
        };
        setRequisitionItems(updatedItems);
    }, [requisitionItems]);

    return (
        <div className="container mx-auto p-4 space-y-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Material Requisition</h2>

            {/* Requisition Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Requisition Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Requisition Date</label>
                            <CustomDatePicker
                                selected={requisitionDate}
                                onChange={date => setRequisitionDate(date)}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Required By Date</label>
                            <CustomDatePicker
                                selected={requiredDate}
                                onChange={date => setRequiredDate(date)}
                                className="w-full p-2 border rounded"
                                minDate={new Date()}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="LOW">Low</option>
                                <option value="NORMAL">Normal</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Enhanced Item Search */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Search Items</CardTitle>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                className={`px-4 py-2 rounded-md ${searchMode === 'code' ? 'bg-indigo-600 text-white' : 'border border-gray-300 text-gray-700'}`}
                                onClick={() => {
                                    setSearchMode('code');
                                    setSelectedMake('');
                                    setSelectedSpec('');
                                    if (searchText.trim().length >= 3) {
                                        handleSearch({ target: { value: searchText } });
                                    }
                                }}
                            >
                                Search by Code
                            </button>
                            <button
                                type="button"
                                className={`px-4 py-2 rounded-md ${searchMode === 'name' ? 'bg-indigo-600 text-white' : 'border border-gray-300 text-gray-700'}`}
                                onClick={() => {
                                    setSearchMode('name');
                                    if (searchText.trim().length >= 3) {
                                        handleSearch({ target: { value: searchText } });
                                    }
                                }}
                            >
                                Search by Name
                            </button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {searchMode === 'code' ? (
                            <div className="relative">
                                <div className="flex items-center">
                                    <FaSearch className="absolute left-3 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchText}
                                        onChange={handleSearch}
                                        placeholder="Type at least 3 characters to search by code"
                                        className="w-full pl-10 p-2 border rounded"
                                    />
                                </div>
                                
                                {/* Enhanced Search Results Dropdown for Code Search */}
                                {showSearch && searchResults && searchResults.length > 0 && (
                                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border overflow-y-auto max-h-60">
                                        {searchResults.map((item, idx) => (
                                            <div 
                                                key={idx} 
                                                className="p-3 hover:bg-indigo-50 cursor-pointer border-b"
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setShowSearch(false);
                                                }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="font-medium text-indigo-700">{item.fullCode || item.code}</div>
                                                    <div className="text-xs bg-indigo-100 px-2 py-1 rounded">
                                                        {item.unitSymbol}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-800 mt-1">{item.itemName}</div>
                                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                    <div className="flex items-center">
                                                        <FaBuilding className="mr-1" /> {item.make || 'N/A'}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <FaRupeeSign className="mr-1" /> {(item.basePrice || 0).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="relative">
                                        <label className="block text-sm font-medium mb-1">Item Name</label>
                                        <FaSearch className="absolute left-3 top-9 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchText}
                                            onChange={handleSearch}
                                            placeholder="Type at least 3 characters to search"
                                            className="w-full pl-10 p-2 border rounded"
                                        />
                                        
                                        {/* Enhanced Search Results Dropdown for Name Search */}
                                        {showSearch && searchResults && searchResults.length > 0 && (
                                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border overflow-y-auto max-h-60">
                                                {searchResults.map((item, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className="p-3 hover:bg-indigo-50 cursor-pointer border-b"
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            setSelectedMake(item.make || '');
                                                            setSelectedSpec(item.specification || '');
                                                            setShowSearch(false);
                                                        }}
                                                    >
                                                        <div className="font-medium text-indigo-700">{item.itemName}</div>
                                                        <div className="text-sm text-gray-800 mt-1">{item.fullCode || item.code}</div>
                                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                            <div className="flex items-center">
                                                                <FaBuilding className="mr-1" /> {item.make || 'N/A'}
                                                            </div>
                                                            <div className="flex items-center">
                                                                <FaTags className="mr-1" /> {item.specification ? (item.specification.length > 30 ? item.specification.substring(0, 30) + '...' : item.specification) : 'N/A'}
                                                            </div>
                                                            <div className="flex items-center">
                                                                <FaRupeeSign className="mr-1" /> {(item.basePrice || 0).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Make (Optional Filter)</label>
                                        <select
                                            value={selectedMake}
                                            onChange={(e) => {
                                                setSelectedMake(e.target.value);
                                                if (searchText.trim().length >= 3) {
                                                    handleSearch({ target: { value: searchText } });
                                                }
                                            }}
                                            className="w-full p-2 border rounded"
                                        >
                                            <option value="">All Makes</option>
                                            {availableMakes.map((make, idx) => (
                                                <option key={idx} value={make}>{make}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Specification (Optional Filter)</label>
                                        <input
                                            type="text"
                                            value={selectedSpec}
                                            onChange={(e) => {
                                                setSelectedSpec(e.target.value);
                                                if (searchText.trim().length >= 3) {
                                                    handleSearch({ target: { value: searchText } });
                                                }
                                            }}
                                            placeholder="Filter by specification"
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Search Status Indicator */}
                        {isSearching && (
                            <div className="mt-2 text-sm text-gray-500 flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent mr-2"></div>
                                Searching...
                            </div>
                        )}
                        
                        {showSearch && searchResults && searchResults.length === 0 && searchText.trim().length >= 3 && !isSearching && (
                            <div className="mt-2 text-sm text-red-500">
                                No items found. Please try a different search term.
                            </div>
                        )}

                        {/* Enhanced Selected Item Form with Unit Selection */}
                        {selectedItem && (
                            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                                <h3 className="font-medium mb-3">Item Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Item Code</label>
                                        <input
                                            type="text"
                                            value={selectedItem.fullCode || selectedItem.code || ''}
                                            readOnly
                                            className="w-full p-2 border rounded bg-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Item Name</label>
                                        <input
                                            type="text"
                                            value={selectedItem.itemName || ''}
                                            readOnly
                                            className="w-full p-2 border rounded bg-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Make</label>
                                        <input
                                            type="text"
                                            value={selectedItem.make || ''}
                                            readOnly
                                            className="w-full p-2 border rounded bg-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Unit</label>
                                        <select
                                            value={currentUnit}
                                            onChange={handleUnitChange}
                                            className="w-full p-2 border rounded"
                                        >
                                            <option value={selectedItem.unitSymbol || ''}>{selectedItem.unitSymbol || 'Select Unit'}</option>
                                            {selectedItem.allowedUnits && selectedItem.allowedUnits
                                                .filter(unit => unit.symbol !== selectedItem.unitSymbol)
                                                .map((unit, idx) => (
                                                    <option key={idx} value={unit.symbol}>{unit.symbol}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Quantity</label>
                                        <input
                                            type="number"
                                            value={currentQuantity}
                                            onChange={(e) => setCurrentQuantity(e.target.value)}
                                            min="1"
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Rate (₹)</label>
                                        <input
                                            type="text"
                                            value={(selectedItem.basePrice || 0).toFixed(2)}
                                            readOnly
                                            className="w-full p-2 border rounded bg-gray-100"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedItem(null);
                                            setCurrentQuantity(1);
                                            setCurrentUnit('');
                                            setEditingIndex(null);
                                        }}
                                        className="px-4 py-2 mr-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                    >
                                        {editingIndex !== null ? 'Update Item' : 'Add Item'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Requisition Items */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Requisition Items</CardTitle>
                        <div className="text-sm text-gray-600">
                            Total Items: {requisitionItems.length}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {requisitionItems.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Make</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specification</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DCA</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {requisitionItems.map((item, idx) => (
                                        <tr key={idx} className={editingIndex === idx ? "bg-indigo-50" : ""}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">{item.itemCode}</td>
                                            <td className="px-4 py-3 text-sm">{item.itemName}</td>
                                            <td className="px-4 py-3 text-sm">{item.make || '-'}</td>
                                            <td className="px-4 py-3 text-sm max-w-xs truncate">
                                                {item.specification 
                                                    ? (item.specification.length > 50 
                                                        ? item.specification.substring(0, 50) + '...' 
                                                        : item.specification)
                                                    : '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(idx, e.target.value)}
                                                    className="w-20 p-1 border rounded"
                                                />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <select
                                                    value={item.unitSymbol}
                                                    onChange={(e) => handleUnitChangeInList(idx, e.target.value)}
                                                    className="p-1 border rounded"
                                                >
                                                    <option value={item.unitSymbol}>{item.unitSymbol}</option>
                                                    {item.allowedUnits && item.allowedUnits
                                                        .filter(unit => unit.symbol !== item.unitSymbol)
                                                        .map((unit, i) => (
                                                            <option key={i} value={unit.symbol}>
                                                                {unit.symbol}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">{item.dca || '-'}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {(item.basePrice * item.conversionFactor).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {item.totalPrice.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditItem(idx)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-2"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(idx)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50 font-medium">
                                        <td colSpan="8" className="px-4 py-3 text-right">Total Value:</td>
                                        <td colSpan="2" className="px-4 py-3">{totalValue.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500 border-2 border-dashed rounded-lg">
                            <FaInfoCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                            <p>No items added to this requisition yet.</p>
                            <p className="text-sm mt-2">Search for items above and add them to your requisition.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Remarks */}
            <Card>
                <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div>
                        <label className="block text-sm font-medium mb-1">Remarks</label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            rows="3"
                            className="w-full p-2 border rounded"
                            placeholder="Enter any additional remarks or special instructions..."
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 mt-6">
                <button
                    type="button"
                    onClick={() => requisitionItems.length > 0 && setShowResetDialog(true)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={isCreating || requisitionItems.length === 0}
                >
                    Reset
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    disabled={isCreating || requisitionItems.length === 0}
                >
                    {isCreating ? 'Submitting...' : 'Submit Requisition'}
                </button>
            </div>

            {/* Reset Confirmation Dialog */}
            <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reset Requisition?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will clear all items and data from your requisition. Are you sure you want to continue?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReset}>
                            Yes, Reset Requisition
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Loading Overlay */}
            {isCreating && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-5 rounded-lg flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                        <span>Creating requisition...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialRequisition;