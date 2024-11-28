import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchChecklistById } from '../../Slices/clientBoqSlices';

const ChecklistSection = ({ selectedBOQ }) => {
    const [checklistData, setChecklistData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchChecklist = async () => {
            if (!selectedBOQ?.checklist || selectedBOQ.checklist.length === 0) {
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Get unique checklistId (assuming all items have the same checklistId)
                const checklistId = selectedBOQ.checklist[0].checklistId;
                
                const response = await dispatch(fetchChecklistById(checklistId)).unwrap();
                setChecklistData(response.data);
            } catch (err) {
                setError(err.message || 'Failed to fetch checklist');
                console.error('Checklist fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChecklist();
    }, [selectedBOQ, dispatch]);

    if (isLoading) {
        return (
            <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-100 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                <div className="text-red-600 p-4 bg-red-50 rounded-lg">
                    Error: {error}
                </div>
            </div>
        );
    }

    if (!checklistData || !selectedBOQ?.checklist) {
        return null;
    }

    // Create a map of checklistItemId to comments for easy lookup
    const commentsMap = selectedBOQ.checklist.reduce((acc, item) => {
        acc[item.checklistItemId] = item.comments;
        return acc;
    }, {});

    return (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-gray-800">Checklist Items</h4>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                    {checklistData.name}
                </div>
            </div>

            <div className="grid gap-4">
                {checklistData.items.map((item, index) => {
                    const comments = commentsMap[item._id];
                    if (!comments) return null;

                    return (
                        <div 
                            key={item._id}
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-blue-800 font-semibold">{index + 1}</span>
                                    </div>
                                </div>
                                <div className="flex-grow">
                                    <p className="text-gray-800 font-medium mb-2">
                                        {item.description}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Response:</span>
                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                            {comments}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ChecklistSection;