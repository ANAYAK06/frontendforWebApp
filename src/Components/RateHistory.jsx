// components/Common/RateHistory.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaHistory, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import PropTypes from 'prop-types';

// Internal Tooltip Component
const RateHistoryTooltip = ({ 
    isVisible, 
    history, 
    title,
    dateFormat,
    showPercentageChange,
    placement 
}) => {
    if (!isVisible || !history?.length) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getPositionClasses = () => {
        const baseClasses = 'absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80';
        switch (placement) {
            case 'top':
                return `${baseClasses} bottom-full mb-2`;
            case 'bottom':
                return `${baseClasses} top-full mt-2`;
            case 'left':
                return `${baseClasses} right-full mr-2`;
            case 'right':
                return `${baseClasses} left-full ml-2`;
            default:
                return `${baseClasses} top-full mt-2`;
        }
    };

    return (
        <div className={getPositionClasses()}>
            <div className="text-sm font-semibold mb-3 text-gray-700 border-b pb-2">
                {title}
            </div>
            <div className="space-y-3">
                {history.map((record, index) => {
                    const previousRate = index > 0 ? history[index - 1].rate : null;
                    const percentageChange = previousRate 
                        ? ((record.rate - previousRate) / previousRate) * 100 
                        : 0;

                    return (
                        <div 
                            key={index}
                            className="flex flex-col space-y-1 border-b border-gray-100 pb-2 last:border-0"
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-800">
                                    {formatCurrency(record.rate)}
                                </span>
                                {showPercentageChange && index > 0 && (
                                    <span className={`text-xs font-medium flex items-center ${
                                        percentageChange > 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {Math.abs(percentageChange).toFixed(2)}%
                                        {percentageChange > 0 
                                            ? <FaArrowUp className="ml-1" />
                                            : <FaArrowDown className="ml-1" />
                                        }
                                    </span>
                                )}
                            </div>
                            {dateFormat && (
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>{formatDate(record.date)}</span>
                                    {record.type === 'current' && (
                                        <span className="text-blue-600 font-medium">Current Rate</span>
                                    )}
                                </div>
                            )}
                            {record.remarks && (
                                <span className="text-xs text-gray-500 italic">
                                    "{record.remarks}"
                                </span>
                            )}
                            {record.updatedBy && (
                                <span className="text-xs text-gray-500">
                                    Updated by: {record.updatedBy}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Main Icon Component
const RateHistoryIcon = ({ 
    history, 
    currentRate,
    title = "Rate History",
    dateFormat = true,
    showPercentageChange = true,
    placement = "bottom"
}) => {
    const [showTooltip, setShowTooltip] = useState(false);

    // Sort history by date if available
    const sortedHistory = useCallback(() => {
        if (!history?.length) return [];
        
        const allRates = [
            ...history.map(item => ({
                ...item,
                type: 'historical'
            })),
            {
                rate: currentRate,
                date: new Date(),
                type: 'current'
            }
        ].sort((a, b) => new Date(a.date) - new Date(b.date));

        return allRates;
    }, [history, currentRate]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.rate-history-container')) {
                setShowTooltip(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className="rate-history-container relative inline-block">
            <button
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="View rate history"
            >
                <FaHistory className="cursor-pointer" />
            </button>
            <RateHistoryTooltip
                isVisible={showTooltip}
                history={sortedHistory()}
                title={title}
                dateFormat={dateFormat}
                showPercentageChange={showPercentageChange}
                placement={placement}
            />
        </div>
    );
};

// Common PropTypes
const historyItemShape = {
    rate: PropTypes.number.isRequired,
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    remarks: PropTypes.string,
    updatedBy: PropTypes.string
};

RateHistoryIcon.propTypes = {
    history: PropTypes.arrayOf(PropTypes.shape(historyItemShape)).isRequired,
    currentRate: PropTypes.number.isRequired,
    title: PropTypes.string,
    dateFormat: PropTypes.bool,
    showPercentageChange: PropTypes.bool,
    placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right'])
};

RateHistoryTooltip.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    history: PropTypes.arrayOf(PropTypes.shape({
        ...historyItemShape,
        type: PropTypes.string
    })).isRequired,
    title: PropTypes.string.isRequired,
    dateFormat: PropTypes.bool,
    showPercentageChange: PropTypes.bool,
    placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right'])
};

export { RateHistoryIcon };