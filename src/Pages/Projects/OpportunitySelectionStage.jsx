import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaSearch, FaBuilding, FaCalendar, FaUser, FaIndustry, FaFileContract } from 'react-icons/fa';
import { fetchAllAcceptedOppertunity } from '../../Slices/businessOppertunitySlices';



const OpportunitySelectionStage = ({ selectedOpportunity, onSelect }) => {
    const dispatch = useDispatch();
    const { acceptedOppertunities, loading } = useSelector(state => state.businessOpportunity);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchAllAcceptedOppertunity());
    }, [dispatch]);


    useEffect(() => {
        console.log('Loaded opportunities:', acceptedOppertunities);
    }, [acceptedOppertunities]);

    const filteredOpportunities = acceptedOppertunities?.filter(opp =>
        opp.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.businessCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.opportunityNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.ultimateCustomer?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Format date function
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Format currency function
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
                    <FaBuilding className="text-indigo-600 w-6 h-6" />
                    <h2 className="text-xl font-semibold text-gray-900">Select Business Opportunity</h2>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by client, category, opportunity number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-md w-80"
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredOpportunities?.map((opportunity) => (
                    <div
                        key={opportunity._id}
                        onClick={() => onSelect(opportunity)}
                        className={`
                            cursor-pointer rounded-lg border p-6 hover:border-indigo-500 transition-all
                            ${selectedOpportunity?._id === opportunity._id 
                                ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                                : 'border-gray-200 hover:shadow-md'}
                        `}
                    >
                        {/* Header Section */}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="text-lg font-semibold text-gray-900">
                                    {opportunity.client?.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {opportunity.opportunityNumber}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-semibold text-indigo-600">
                                    {formatCurrency(opportunity.estimatedValue)}
                                </div>
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                    {opportunity.businessCategory}
                                </span>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {/* Left Column */}
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <FaFileContract className="text-gray-400" />
                                    <div>
                                        <div className="text-xs text-gray-500">Type</div>
                                        <div className="text-sm font-medium">
                                            {opportunity.type} - {opportunity.opportunityType}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <FaUser className="text-gray-400" />
                                    <div>
                                        <div className="text-xs text-gray-500">Contact Person</div>
                                        <div className="text-sm font-medium">
                                            {opportunity.client?.contactPerson}
                                            <div className="text-xs text-gray-500">
                                                {opportunity.client?.phone}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <FaIndustry className="text-gray-400" />
                                    <div>
                                        <div className="text-xs text-gray-500">Ultimate Customer</div>
                                        <div className="text-sm font-medium">
                                            {opportunity.ultimateCustomer?.name}
                                            <div className="text-xs text-gray-500">
                                                {opportunity.ultimateCustomer?.industry} | {opportunity.ultimateCustomer?.sector}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <FaCalendar className="text-gray-400" />
                                    
                                    <div>
                                        <div className="text-xs text-gray-500">Tender Details</div>
                                        <div className="text-sm font-medium">
                                            {opportunity.tenderDetails?.tenderNumber}
                                            <div className="text-xs text-gray-500">
                                                Date: {formatDate(opportunity.tenderDetails?.tenderDate)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Section */}
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                            <div className="text-sm text-gray-500">
                                Submission: {formatDate(opportunity.submissionDate)}
                            </div>
                            <div className="flex space-x-2">
                                <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                                    {opportunity.status}
                                </span>
                                <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">
                                    Level {opportunity.levelId}
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

            {!loading && filteredOpportunities?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No opportunities found matching your search criteria
                </div>
            )}
        </div>
    );
};

export default OpportunitySelectionStage;