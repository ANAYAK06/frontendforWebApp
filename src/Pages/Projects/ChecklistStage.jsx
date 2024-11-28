import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaList, FaPlus, FaTrash } from 'react-icons/fa';
import {
    createNewChecklist,
    addChecklistItemsThunk,
    fetchChecklists,
    updateChecklistThunk,
    deleteChecklistThunk,
    fetchChecklistById
} from '../../Slices/clientBoqSlices';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogAction,
    AlertDialogCancel,
} from '../../Components/DailogComponent';
import { showToast } from '../../utilities/toastUtilities';

const ChecklistStage = ({ opportunity, checklist, checklistItems, onUpdate, onNext, onBack }) => {
    const dispatch = useDispatch();
    const { checklists = [], checklistLoading, checklistError } = useSelector(state => state.boq);
    const [showNewChecklistDialog, setShowNewChecklistDialog] = useState(false);
    const [newChecklistName, setNewChecklistName] = useState('');
    const [newItemDescription, setNewItemDescription] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Debug logging for props and state
    useEffect(() => {
        console.log('Component Props:', {
            opportunity,
            checklist,
            checklistItems,
        });
        console.log('Redux State - Checklists:', checklists);
    }, [opportunity, checklist, checklistItems, checklists]);


    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };


    // Fetch checklists on component mount
    useEffect(() => {
        const loadChecklists = async () => {
            try {
                setIsLoading(true);
                const result = await dispatch(fetchChecklists()).unwrap();
                console.log('Fetched checklists:', result);
            } catch (error) {
                console.error('Error fetching checklists:', error);
                showToast('error', 'Failed to fetch checklists');
            } finally {
                setIsLoading(false);
            }
        };

        loadChecklists();
    }, [dispatch]);

    const handleChecklistChange = async (selectedValue) => {
        if (selectedValue === 'new') {
            setShowNewChecklistDialog(true);
            return;
        }

        if (selectedValue === '') {
            onUpdate({ checklist: null, checklistItems: [] });
            return;
        }

        try {
            const selectedChecklist = checklists.find(c => c.name === selectedValue);
            if (!selectedChecklist) {
                showToast('error', 'Failed to find selected checklist');
                return;
            }

            // Fetch the complete checklist data by ID
            const fetchedChecklist = await dispatch(fetchChecklistById(selectedChecklist._id)).unwrap();

            // Map the items with required properties
            const mappedItems = fetchedChecklist.items.map(item => ({
                _id: item._id,
                description: item.description || '',
                checked: false,
                comments: '',
                createdAt: item.createdAt
            }));

            onUpdate({
                checklist: fetchedChecklist,
                checklistItems: mappedItems
            });
        } catch (error) {
            console.error('Error fetching checklist details:', error);
            showToast('error', 'Failed to load checklist details');
        }
    };


    const handleCreateNewChecklist = async () => {
        if (!newChecklistName.trim()) {
            showToast('error', 'Please enter a checklist name');
            return;
        }

        try {
            const newChecklist = await dispatch(createNewChecklist({
                name: newChecklistName,
                items: []
            })).unwrap();

            onUpdate({
                checklist: newChecklist,
                checklistItems: []
            });
            setShowNewChecklistDialog(false);
            setNewChecklistName('');
            showToast('success', 'Checklist created successfully');
        } catch (err) {
            console.error('Error creating checklist:', err);
            showToast('error', 'Failed to create checklist');
        }
    };

    const handleAddChecklistItem = async () => {
        if (!newItemDescription.trim() || !checklist) return;

        try {
            const newItem = {
                description: newItemDescription,
                comments: ''
            };

            const updatedItems = [...(checklistItems || []), {
                ...newItem,
                checked: false
            }];

            onUpdate({
                checklist,
                checklistItems: updatedItems
            });

            await dispatch(addChecklistItemsThunk({
                checklistId: checklist._id,
                items: [newItem]
            }));

            setNewItemDescription('');
            showToast('success', 'Item added successfully');
        } catch (err) {
            console.error('Error adding checklist item:', err);
            showToast('error', 'Failed to add item');
        }
    };

    

    // Update function with proper async handling
    const handleUpdateChecklist = async (updatedItems, showMessage = false) => {
        if (!checklist) return;

        try {
            // Use unwrap() to properly handle the Promise
            await dispatch(updateChecklistThunk({
                checklistId: checklist._id,
                updateData: {
                    ...checklist,
                    items: updatedItems
                }
            })).unwrap(); // Add .unwrap() here

            if (showMessage) {
                showToast('success', 'Checklist updated successfully');
            }
        } catch (err) {
            console.error('Error updating checklist:', err);
            showToast('error', 'Failed to update checklist');
        }
    };

    // Update the checkbox handler to properly handle the async update
    const handleCheckboxChange = async (index, item) => {
        try {
            const updatedItems = [...checklistItems];
            updatedItems[index] = {
                ...item,
                checked: !item.checked
            };

            // First update the UI
            onUpdate({
                checklist,
                checklistItems: updatedItems
            });

            
        } catch (error) {
            console.error('Error updating checkbox:', error);
            showToast('error', 'Failed to update checklist');
        }
    };

    // Update the comments handler to properly handle the async update
    const handleCommentsChange = async (index, item, newComment) => {
        try {
            const updatedItems = [...checklistItems];
            updatedItems[index] = {
                ...item,
                comments: newComment
            };

            // First update the UI
            onUpdate({
                checklist,
                checklistItems: updatedItems
            });

          
        } catch (error) {
            console.error('Error updating comments:', error);
            showToast('error', 'Failed to update checklist');
        }
    };
    const handleDeleteChecklist = async (checklistId) => {
        try {
            await dispatch(deleteChecklistThunk(checklistId));
            onUpdate({ checklist: null, checklistItems: [] });
            showToast('success', 'Checklist deleted successfully');
        } catch (err) {
            console.error('Error deleting checklist:', err);
            showToast('error', 'Failed to delete checklist');
        }
    };

    const handleNext = () => {
        if (!checklist) {
            showToast('error', 'Please select a checklist');
            return;
        }
        if (!checklistItems?.every(item => item.checked)) {
            showToast('error', 'Please complete all checklist items');
            return;
        }
        onNext();
    };

    if (isLoading) {
        return (
            <div className="p-6 flex justify-center items-center">
                <div className="text-gray-500">Loading checklists...</div>
            </div>
        );
    }

    if (checklistError) {
        return (
            <div className="p-6 flex justify-center items-center">
                <div className="text-red-500">
                    Error loading checklists. Please try again.
                    {checklistError && `: ${checklistError}`}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header with Opportunity Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
                {/* Primary Info */}
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Selected Opportunity</h3>
                        <div className="mt-1">
                            <p className="text-lg font-medium text-gray-900">{opportunity?.client?.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="px-2.5 py-0.5 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800">
                                    {opportunity?.opportunityNumber}
                                </span>
                                <span className="px-2.5 py-0.5 text-sm font-medium rounded-full bg-green-100 text-green-800">
                                    {opportunity?.businessCategory}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-medium text-gray-900">
                            ₹{opportunity?.estimatedValue?.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">Estimated Value</div>
                    </div>
                </div>

                {/* Tender Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 mt-4">
                    {/* Tender Details */}
                    <div>
                        <h4 className="text-xs font-medium text-gray-500 mb-1">Tender Details</h4>
                        <p className="text-sm font-medium text-gray-900">
                            {opportunity?.tenderDetails?.tenderNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                            Date: {formatDate(opportunity.tenderDetails?.tenderDate)}
                        </p>
                    </div>

                    {/* Ultimate Customer */}
                    <div>
                        <h4 className="text-xs font-medium text-gray-500 mb-1">Ultimate Customer</h4>
                        <p className="text-sm font-medium text-gray-900">
                            {opportunity?.ultimateCustomer?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                            {opportunity?.ultimateCustomer?.industry} | {opportunity?.ultimateCustomer?.sector}
                        </p>
                    </div>

                    {/* Client Contact */}
                    <div>
                        <h4 className="text-xs font-medium text-gray-500 mb-1">Client Contact</h4>
                        <p className="text-sm font-medium text-gray-900">
                            {opportunity?.client?.contactPerson}
                        </p>
                        <p className="text-xs text-gray-500">
                            {opportunity?.client?.phone}
                        </p>
                    </div>

                    {/* Type Info */}
                    <div>
                        <h4 className="text-xs font-medium text-gray-500 mb-1">Type Info</h4>
                        <p className="text-sm font-medium text-gray-900">
                            {opportunity?.type} - {opportunity?.opportunityType}
                        </p>
                        <p className="text-xs text-gray-500">
                            Work: {opportunity?.descriptionOfWork}
                        </p>
                    </div>

                    {/* Submission Info */}
                    <div>
                        <h4 className="text-xs font-medium text-gray-500 mb-1">Submission Details</h4>
                        <p className="text-sm font-medium text-gray-900">
                            {formatDate(opportunity.submissionDate)}
                        </p>
                        <div className="flex space-x-2 text-xs mt-1">
                            <span className={`px-2 py-0.5 rounded-full ${opportunity?.status === 'Approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'}`}>
                                {opportunity?.status}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                                Level {opportunity?.levelId}
                            </span>
                        </div>
                    </div>

                    {/* EMD Details */}
                    <div>
                        <h4 className="text-xs font-medium text-gray-500 mb-1">EMD Details</h4>
                        <p className="text-sm font-medium text-gray-900">
                            {opportunity?.tenderDetails?.emdRequired ? (
                                <>
                                    ₹{opportunity?.tenderDetails?.emdDetails?.amount?.toLocaleString() || 0}
                                    <span className="text-xs text-gray-500 ml-1">
                                        ({opportunity?.tenderDetails?.emdDetails?.type})
                                    </span>
                                </>
                            ) : (
                                <span className="text-sm text-gray-500">Not Required</span>
                            )}
                        </p>
                        <p className="text-xs text-gray-500">
                            JV Acceptable: {opportunity?.jointVentureAcceptable ? 'Yes' : 'No'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Checklist Selection */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <FaList className="text-indigo-600 w-6 h-6" />
                        <h2 className="text-xl font-semibold text-gray-900">Checklist</h2>
                    </div>
                </div>

                <div className="flex space-x-4">
                    <select
                        className="flex-1 px-3 py-2 border rounded-md"
                        value={checklist?.name || ''}
                        onChange={(e) => handleChecklistChange(e.target.value)}
                    >
                        <option value="">Select a checklist</option>
                        {Array.isArray(checklists) && checklists.map(c => (
                            <option key={c._id} value={c.name}>{c.name}</option>
                        ))}
                        <option value="new">+ Add New Checklist</option>
                    </select>

                    {checklist && (
                        <button
                            onClick={() => handleDeleteChecklist(checklist._id)}
                            className="px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50"
                        >
                            Delete Checklist
                        </button>
                    )}
                </div>

                {/* Debug Info */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-500 mt-2">
                        Selected Checklist: {checklist?.name || 'None'}<br />
                        Items Count: {checklistItems?.length || 0}
                    </div>
                )}

                {checklist && (
                    <div className="space-y-4 bg-white rounded-lg border p-4">
                        {Array.isArray(checklistItems) && checklistItems.length > 0 ? (
                            checklistItems.map((item, index) => (
                                <div key={item._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                    <div className="flex items-center space-x-3 flex-1">
                                        <input
                                            type="checkbox"
                                            checked={item.checked || false}
                                            onChange={() => handleCheckboxChange(index, item)}
                                            className="h-4 w-4 text-indigo-600"
                                        />
                                        <span className="text-sm flex-1">{item.description}</span>

                                        <input
                                            type="text"
                                            value={item.comments || ''}
                                            onChange={(e) => handleCommentsChange(index, item, e.target.value)}
                                            placeholder="Add remarks"
                                            className="px-2 py-1 border rounded-md text-sm flex-1 ml-2"
                                        />

                                        <button
                                            onClick={async () => {
                                                try {
                                                    const updatedItems = checklistItems.filter((_, i) => i !== index);

                                                    // First update the UI
                                                    onUpdate({
                                                        checklist,
                                                        checklistItems: updatedItems
                                                    });

                                                    // Then update the backend and show success message
                                                    await handleUpdateChecklist(updatedItems, true);
                                                } catch (error) {
                                                    console.error('Error deleting item:', error);
                                                    showToast('error', 'Failed to delete item');
                                                }
                                            }}
                                            className="ml-2 text-red-600 hover:text-red-700"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-500 text-center py-4">
                                No items in this checklist
                            </div>
                        )}

                        <div className="flex space-x-2 mt-4">
                            <input
                                type="text"
                                value={newItemDescription}
                                onChange={(e) => setNewItemDescription(e.target.value)}
                                placeholder="Add new item"
                                className="flex-1 px-3 py-2 border rounded-md"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddChecklistItem();
                                    }
                                }}
                            />
                            <button
                                onClick={handleAddChecklistItem}
                                disabled={checklistLoading || !newItemDescription.trim()}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaPlus />
                            </button>
                        </div>
                    </div>
                )}
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

            {/* New Checklist Dialog */}
            <AlertDialog open={showNewChecklistDialog} onOpenChange={setShowNewChecklistDialog}>
                <AlertDialogContent className='bg-slate-50'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Create New Checklist</AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <input
                            type="text"
                            value={newChecklistName}
                            onChange={(e) => setNewChecklistName(e.target.value)}
                            placeholder="Enter checklist name"
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowNewChecklistDialog(false)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCreateNewChecklist}
                            className='bg-indigo-600 text-slate-50'
                            disabled={checklistLoading}
                        >
                            Create
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ChecklistStage;