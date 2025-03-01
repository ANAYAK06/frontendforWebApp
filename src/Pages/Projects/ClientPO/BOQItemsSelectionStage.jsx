import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../Components/Card';
import { FaCheck, FaEdit, FaChevronDown, FaChevronUp, FaTags } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const BOQItemsSelectionStage = ({ formData, onUpdate, onNext, onBack, wonBOQs, loading }) => {
    const [errors, setErrors] = useState({
        boqId: '',
        items: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [expandedItems, setExpandedItems] = useState({});

    // Toggle expanded state for an item
    const toggleExpand = (index) => {
        setExpandedItems(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // Update a single item type (service, manufacturing, supply)
    const toggleItemType = (itemIndex, type) => {
        const updatedItems = [...formData.items];
        const currentTypes = new Set(updatedItems[itemIndex].itemTypes);
        
        if (currentTypes.has(type)) {
            currentTypes.delete(type);
        } else {
            currentTypes.add(type);
        }
        
        updatedItems[itemIndex].itemTypes = Array.from(currentTypes);
        onUpdate({ items: updatedItems });
    };

    // Toggle sublet option for an item
    const toggleSublet = (itemIndex) => {
        const updatedItems = [...formData.items];
        updatedItems[itemIndex].isSublet = !updatedItems[itemIndex].isSublet;
        onUpdate({ items: updatedItems });
    };

    // Handle rate change for an item
    const handleRateChange = (itemIndex, value) => {
        // Convert to number, defaults to 0 if not a valid number
        const rate = value === '' ? 0 : Number(value);
        if (isNaN(rate) || rate < 0) return;

        const updatedItems = [...formData.items];
        updatedItems[itemIndex].rate = rate;
        updatedItems[itemIndex].totalValue = rate * updatedItems[itemIndex].quantity;
        onUpdate({ items: updatedItems });
    };

    // Handle BOQ selection
    const handleBOQChange = (e) => {
        const boqId = e.target.value;
        onUpdate({ boqId });
        
        // Clear errors
        if (boqId) {
            setErrors(prev => ({ ...prev, boqId: '' }));
        }

        // Reset items array when BOQ changes
        if (boqId !== formData.boqId) {
            onUpdate({ items: [] });
        }
    };

    // Fetch BOQ items when BOQ ID changes
    useEffect(() => {
        const fetchBOQItems = async () => {
            if (formData.boqId) {
                setIsLoading(true);
                try {
                    // Find the selected BOQ from the wonBOQs array
                    const selectedBOQ = wonBOQs.find(boq => boq._id === formData.boqId);
                    
                    if (selectedBOQ && selectedBOQ.items && selectedBOQ.items.length > 0) {
                        // Map the BOQ items to the required format based on the actual structure
                        const formattedItems = selectedBOQ.items.map(item => {
                            // Make sure to explicitly parse the unitRate value as a number
                            const unitRateValue = parseFloat(item.unitRate) || 0;
                            
                            return {
                                boqItemId: item._id,
                                description: item.description || '',
                                unit: item.unit || 'Nos.',
                                quantity: parseInt(item.qty) || 1,
                                rate: unitRateValue,
                                totalValue: (parseInt(item.qty) || 1) * unitRateValue,
                                itemTypes: [],
                                isSublet: false,
                                // Store original values for reference
                                originalUnitRate: unitRateValue,
                                // Include itemCode if available in the data
                                itemCode: item.itemCode || ''
                            };
                        });
                        
                        // Pre-populate the items in the form if the form doesn't already have items
                        if (formData.items.length === 0) {
                            onUpdate({ items: formattedItems });
                        }
                    }
                    
                    setIsLoading(false);
                } catch (error) {
                    console.error("Error fetching BOQ items:", error);
                    setIsLoading(false);
                }
            }
        };
        
        fetchBOQItems();
    }, [formData.boqId, wonBOQs, onUpdate]);

    const validateForm = () => {
        const newErrors = {
            boqId: formData.boqId ? '' : 'BOQ selection is required',
            items: []
        };

        // Validate each item
        if (formData.items.length > 0) {
            formData.items.forEach((item, index) => {
                const itemError = {};
                
                if (item.itemTypes.length === 0) {
                    itemError.itemTypes = 'At least one item type is required';
                }
                
                if (parseFloat(item.rate) <= 0) {
                    itemError.rate = 'Rate must be greater than 0';
                }
                
                newErrors.items[index] = itemError;
            });
        } else {
            newErrors.items = ['No items available'];
        }

        setErrors(newErrors);
        
        // Check if any errors exist
        return !newErrors.boqId && !newErrors.items.some(item => Object.keys(item || {}).length > 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onNext();
        }
    };

    // Set initial rates from original unitRate if rate is not set
    useEffect(() => {
        if (formData.items && formData.items.length > 0) {
            const updatedItems = formData.items.map(item => {
                if (typeof item.rate === 'undefined' && item.originalUnitRate) {
                    return { ...item, rate: item.originalUnitRate };
                }
                return item;
            });
            
            if (JSON.stringify(updatedItems) !== JSON.stringify(formData.items)) {
                onUpdate({ items: updatedItems });
            }
        }
    }, [formData.items, onUpdate]);
    
    // Format numbers with commas and proper decimal places
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    // Function to truncate text with ellipsis
    const truncateText = (text, maxLength = 65) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Function to create type badges
    const TypeBadge = ({ active, label }) => (
        <div 
            className={`px-3 py-1 rounded-full text-xs font-medium ${
                active 
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}
        >
            {label}
        </div>
    );

   

    return (
        <div className="p-6">
            <form onSubmit={handleSubmit}>
                <Card className="shadow-md">
                    <CardHeader className="bg-gray-50 border-b">
                        <CardTitle className="text-xl font-semibold text-gray-800">BOQ Selection</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div>
                            <label htmlFor="boqId" className="block text-sm font-medium text-gray-700">
                                BOQ <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="boqId"
                                name="boqId"
                                value={formData.boqId}
                                onChange={handleBOQChange}
                                className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md ${errors.boqId ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={loading?.wonBOQs}
                            >
                                <option value="">Select BOQ</option>
                                {wonBOQs.map(boq => (
                                    <option key={boq._id} value={boq._id}>
                                        {boq.offerNumber || boq.boqNumber}
                                    </option>
                                ))}
                            </select>
                            {errors.boqId && (
                                <p className="mt-1 text-sm text-red-500">{errors.boqId}</p>
                            )}
                            {loading?.wonBOQs && (
                                <p className="mt-1 text-sm text-gray-500">Loading BOQs...</p>
                            )}
                        </div>
                        
                        {formData.boqId && (
                            <div className="mt-4 flex justify-between items-center bg-indigo-50 p-3 rounded-md">
                                <div className="text-sm text-indigo-800">
                                    <span className="font-medium">Selected BOQ: </span>
                                    {wonBOQs.find(boq => boq._id === formData.boqId)?.offerNumber || formData.boqId}
                                </div>
                                <div className="text-sm text-indigo-800">
                                    <span className="font-medium">Items: </span>
                                    {formData.items.length}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {formData.boqId && (
                    <Card className="mt-6 shadow-md overflow-hidden">
                        <CardHeader className="bg-gray-50 border-b">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xl font-semibold text-gray-800">BOQ Items</CardTitle>
                                <div className="text-sm text-gray-500">
                                    Select item types for each BOQ item
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
                                    <p className="mt-4 text-gray-600">Loading BOQ Items...</p>
                                </div>
                            ) : formData.items.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="text-5xl mb-4">📋</div>
                                    <p>No items available for this BOQ</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b">
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    SL No
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    Item Description
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    Unit
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    QTY
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    Rate
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.items.map((item, index) => (
                                                <React.Fragment key={index}>
                                                    <tr className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors duration-150`}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            <div className="line-clamp-2">{truncateText(item.description)}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {item.unit}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center justify-end group">
                                                                <div className="relative w-28">
                                                                    <input
                                                                        type="number"
                                                                        value={parseFloat(item.rate) || ''}
                                                                        onChange={(e) => handleRateChange(index, e.target.value)}
                                                                        className={`w-full px-3 py-2 border rounded-md text-right bg-white group-hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                                            errors.items[index]?.rate ? 'border-red-500' : 'border-gray-300'
                                                                        }`}
                                                                        min="0"
                                                                        step="0.01"
                                                                        placeholder="Enter rate"
                                                                    />
                                                                    <FaEdit className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-indigo-500" />
                                                                </div>
                                                                {errors.items[index]?.rate && (
                                                                    <p className="ml-2 text-xs text-red-500">{errors.items[index].rate}</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                                                            <div className="bg-gray-50 px-3 py-1 rounded border border-gray-200">
                                                                {(item.quantity && item.rate) 
                                                                    ? formatCurrency(parseFloat(item.quantity) * parseFloat(item.rate))
                                                                    : 'N/A'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <button 
                                                                type="button"
                                                                onClick={() => toggleExpand(index)}
                                                                className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-150"
                                                            >
                                                                {expandedItems[index] ? (
                                                                    <FaChevronUp className="text-gray-500" />
                                                                ) : (
                                                                    <FaChevronDown className="text-gray-500" />
                                                                )}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {expandedItems[index] && (
                                                        <tr className="bg-gray-50 border-b border-gray-200">
                                                            <td colSpan="7" className="px-6 py-4">
                                                                <div className="space-y-4">
                                                                    {item.itemCode && (
                                                                        <div className="flex items-center">
                                                                            <FaTags className="text-gray-400 mr-2" />
                                                                            <span className="text-sm font-medium text-gray-600">Item Code:</span>
                                                                            <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">{item.itemCode}</span>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    <div>
                                                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Complete Description</h4>
                                                                        <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                                                                            {item.description}
                                                                        </p>
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Applicable Types</h4>
                                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                                            <TypeBadge active={item.itemTypes.includes('Service')} label="Service" />
                                                                            <TypeBadge active={item.itemTypes.includes('Manufacturing')} label="Manufacturing" />
                                                                            <TypeBadge active={item.itemTypes.includes('Supply')} label="Supply" />
                                                                            <TypeBadge active={item.isSublet} label="Allow Sublet Item" />
                                                                        </div>
                                                                        
                                                                        <div className="flex flex-wrap gap-4 mt-4 bg-white p-3 rounded border border-gray-200">
                                                                            <label className="flex items-center gap-2 cursor-pointer hover:bg-indigo-50 px-3 py-2 rounded transition-colors duration-150">
                                                                                <div 
                                                                                    className={`w-5 h-5 border rounded flex items-center justify-center ${
                                                                                        item.itemTypes.includes('Service') 
                                                                                            ? 'bg-indigo-100 border-indigo-500' 
                                                                                            : 'border-gray-300'
                                                                                    }`}
                                                                                    onClick={() => toggleItemType(index, 'Service')}
                                                                                >
                                                                                    {item.itemTypes.includes('Service') && (
                                                                                        <FaCheck className="h-3 w-3 text-indigo-600" />
                                                                                    )}
                                                                                </div>
                                                                                <span className="text-sm">Service</span>
                                                                            </label>
                                                                            
                                                                            <label className="flex items-center gap-2 cursor-pointer hover:bg-indigo-50 px-3 py-2 rounded transition-colors duration-150">
                                                                                <div 
                                                                                    className={`w-5 h-5 border rounded flex items-center justify-center ${
                                                                                        item.itemTypes.includes('Manufacturing') 
                                                                                            ? 'bg-indigo-100 border-indigo-500' 
                                                                                            : 'border-gray-300'
                                                                                    }`}
                                                                                    onClick={() => toggleItemType(index, 'Manufacturing')}
                                                                                >
                                                                                    {item.itemTypes.includes('Manufacturing') && (
                                                                                        <FaCheck className="h-3 w-3 text-indigo-600" />
                                                                                    )}
                                                                                </div>
                                                                                <span className="text-sm">Manufacturing</span>
                                                                            </label>
                                                                            
                                                                            <label className="flex items-center gap-2 cursor-pointer hover:bg-indigo-50 px-3 py-2 rounded transition-colors duration-150">
                                                                                <div 
                                                                                    className={`w-5 h-5 border rounded flex items-center justify-center ${
                                                                                        item.itemTypes.includes('Supply') 
                                                                                            ? 'bg-indigo-100 border-indigo-500' 
                                                                                            : 'border-gray-300'
                                                                                    }`}
                                                                                    onClick={() => toggleItemType(index, 'Supply')}
                                                                                >
                                                                                    {item.itemTypes.includes('Supply') && (
                                                                                        <FaCheck className="h-3 w-3 text-indigo-600" />
                                                                                    )}
                                                                                </div>
                                                                                <span className="text-sm">Supply</span>
                                                                            </label>
                                                                            
                                                                            <label className="flex items-center gap-2 cursor-pointer hover:bg-indigo-50 px-3 py-2 rounded transition-colors duration-150">
                                                                                <div 
                                                                                    className={`w-5 h-5 border rounded flex items-center justify-center ${
                                                                                        item.isSublet 
                                                                                            ? 'bg-indigo-100 border-indigo-500' 
                                                                                            : 'border-gray-300'
                                                                                    }`}
                                                                                    onClick={() => toggleSublet(index)}
                                                                                >
                                                                                    {item.isSublet && (
                                                                                        <FaCheck className="h-3 w-3 text-indigo-600" />
                                                                                    )}
                                                                                </div>
                                                                                <span className="text-sm">Allow Sublet Item</span>
                                                                            </label>
                                                                        </div>
                                                                        
                                                                        {errors.items[index]?.itemTypes && (
                                                                            <p className="mt-1 text-xs text-red-500">{errors.items[index].itemTypes}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-indigo-50 border-t border-indigo-200">
                                                <td colSpan="5" className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                                                    Total Amount
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                                                    <div className="bg-white px-3 py-2 rounded border border-indigo-200 inline-block min-w-[120px]">
                                                        {formData.items && formData.items.length > 0
                                                            ? formatCurrency(
                                                                formData.items.reduce((sum, item) => {
                                                                    const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0);
                                                                    return sum + (isNaN(itemTotal) ? 0 : itemTotal);
                                                                }, 0)
                                                            )
                                                            : 'N/A'}
                                                    </div>
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-between mt-6">
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
            </form>
        </div>
    );
};

export default BOQItemsSelectionStage;