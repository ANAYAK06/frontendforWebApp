// components/BOQRevision/RevisionList.jsx

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaSearch, FaFileAlt, FaBuilding, FaCalendar, FaMoneyBill } from 'react-icons/fa';
import { fetchAcceptedBOQs } from '../../Slices/clientBoqSlices'; 

const RevisionList = ({ onSelectBOQ }) => {
    const dispatch = useDispatch();
    const { acceptedBOQs, loading } = useSelector(state => state.boq);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchAcceptedBOQs());
        
    }, [dispatch]);




    const filteredBOQs = acceptedBOQs?.filter(boq =>
        boq.businessOpportunity?.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        boq.offerNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        boq.businessOpportunity?.businessCategory?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                    <FaFileAlt className="text-indigo-600 w-6 h-6" />
                    <h2 className="text-xl font-semibold text-gray-900">BOQ Revision</h2>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by client, BOQ number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-md w-80"
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredBOQs?.map((boq) => (
                    <div
                        key={boq._id}
                        onClick={() => onSelectBOQ(boq)}
                        className="cursor-pointer rounded-lg border border-gray-200 p-6 hover:border-indigo-500 hover:shadow-md transition-all shadow-xl duration-300"
                    >
                        {/* Header Section */}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="text-lg font-semibold text-gray-900">
                                    {boq.businessOpportunity?.client?.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                    BOQ #{boq.offerNumber}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-semibold text-indigo-600">
                                    {formatCurrency(boq.totalAmount)}
                                </div>
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                    {boq.businessOpportunity?.businessCategory}
                                </span>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <FaBuilding className="text-gray-400" />
                                    <div>
                                        <div className="text-xs text-gray-500">Opportunity Number</div>
                                        <div className="text-sm font-medium">
                                            {boq.businessOpportunity?.opportunityNumber}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <FaMoneyBill className="text-gray-400" />
                                    <div>
                                        <div className="text-xs text-gray-500">Items Count</div>
                                        <div className="text-sm font-medium">
                                            {boq.items?.length || 0} items
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <FaCalendar className="text-gray-400" />
                                    <div>
                                        <div className="text-xs text-gray-500">Created Date</div>
                                        <div className="text-sm font-medium">
                                            {formatDate(boq.createdAt)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <FaFileAlt className="text-gray-400" />
                                    <div>
                                        <div className="text-xs text-gray-500">Attachments</div>
                                        <div className="text-sm font-medium">
                                            {boq.attachments?.length || 0} files
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-gray-200">
                            <div className="flex justify-end space-x-2">
                                <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                                    {boq.boqStatus}
                                </span>
                                <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">
                                    {boq.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {loading && (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                </div>
            )}

            {!loading && filteredBOQs?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No BOQs found matching your search criteria
                </div>
            )}
        </div>
    );
};

export default RevisionList;