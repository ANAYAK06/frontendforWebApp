import React, { useMemo } from 'react';
import { FaInfoCircle } from "react-icons/fa";

const ConversionHelper = ({ baseUnit, targetUnit, factor }) => {
    // Only calculate if we have valid inputs
    const isValidInputs = useMemo(() => (
        baseUnit && 
        targetUnit && 
        typeof factor === 'number' && 
        !isNaN(factor) && 
        factor > 0
    ), [baseUnit, targetUnit, factor]);

    const exampleValues = [1, 10, 100, 1000];
    
    const getConvertedValue = (value) => {
        if (!isValidInputs) return '---';
        const result = value * factor;
        return result.toFixed(3);
    };

    return (
        <div className="bg-blue-50 p-4 rounded-lg mt-2">
            <div className="flex items-center text-indigo-800 mb-2">
                <FaInfoCircle className="mr-2" />
                <span className="font-medium">Conversion Preview</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {exampleValues.map(value => (
                    <div key={value} className="flex items-center justify-between text-sm text-indigo-700 border p-2">
                        <span className="font-medium">{value} {baseUnit}</span>
                        <span className="mx-2">=</span>
                        <span className="font-medium">
                            {getConvertedValue(value)} {targetUnit}
                        </span>
                    </div>
                ))}
            </div>
            {!isValidInputs && (
                <p className="text-xs text-blue-600 mt-2">
                    Enter a valid conversion factor to see preview
                </p>
            )}
        </div>
    );
};

export default ConversionHelper;