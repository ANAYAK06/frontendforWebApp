import React, { useCallback, useState, useMemo } from 'react';
import { FaInfoCircle, FaTrash,FaPlus } from "react-icons/fa";
import ConversionHelper from '../ConversionHelper';

const UnitConversionSection = ({ 
  formData, 
  handleConversionChange, 
  handleAddConversion, 
  availableUnits,
  isFetchingTypes 
}) => {
  // Keep track of selected units for proper dropdown behavior
  const selectedUnits = useMemo(() => {
    const units = new Set();
    formData.conversions.forEach(conv => {
      if (conv.toUnitSymbol) {
        units.add(conv.toUnitSymbol);
      }
    });
    return units;
  }, [formData.conversions]);


  // Filter available units excluding already selected ones
  const getAvailableUnitsForIndex = useCallback((currentUnitSymbol) => {
    return availableUnits.filter(unit => 
      !selectedUnits.has(unit.symbol) || unit.symbol === currentUnitSymbol
    );
  }, [availableUnits, selectedUnits]);

  const handleDelete = useCallback((idx) => {
    const updatedConversions = formData.conversions.filter((_, i) => i !== idx);
    // Update parent state
    handleConversionChange(idx, 'delete', null, updatedConversions);
  }, [formData.conversions, handleConversionChange]);
  const handleUnitChange = useCallback((idx, value) => {
    const selectedUnit = availableUnits.find(unit => unit.symbol === value);
    if (selectedUnit) {
      handleConversionChange(idx, 'toUnitSymbol', value, null, {
        toUnit: selectedUnit._id,
        toUnitSymbol: selectedUnit.symbol,
        toUnitName: selectedUnit.name
      });
    }
  }, [availableUnits, handleConversionChange]);

  const remainingUnits = availableUnits.length - selectedUnits.size;

  return (
    <div className="space-y-4">
      {formData.conversions.map((conv, idx) => (
        <div key={idx} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg bg-white relative group">
          <div className="col-span-5">
            <label className="block text-sm font-medium mb-1">
              To Unit
              <span className="text-xs text-gray-500 ml-1">(Select Target unit)</span>
            </label>
            <select
              value={conv.toUnitSymbol || ''}
              onChange={(e) => handleUnitChange(idx, e.target.value)}
              className="w-full p-2 border rounded"
              required
              disabled={!formData.type || isFetchingTypes}
            >
              <option value="">Select Unit</option>
              {getAvailableUnitsForIndex(conv.toUnitSymbol).map(unit => (
                <option
                  key={unit._id}
                  value={unit.symbol}
                  data-unit-id={unit._id}
                >
                  {unit.name} ({unit.symbol}) {unit.baseUnit ? '- Base Unit' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-5">
            <label className="block text-sm font-medium mb-1">
              Conversion Factor
              <span className="text-xs text-gray-500 ml-1">
                (e.g., 0.001 for KG to MT)
              </span>
            </label>
            <input
              type="number"
              step="0.000001"
              value={conv.factor}
              onChange={(e) => handleConversionChange(idx, 'factor', e.target.value)}
              className="w-full p-2 border rounded"
              required
              min="0.000001"
              placeholder="Enter conversion factor"
            />
          </div>

          <div className="col-span-2 flex justify-center">
            <button
              type="button"
              onClick={() => handleDelete(idx)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200 h-10 w-10 flex items-center justify-center rounded-full hover:bg-red-50"
              title="Delete conversion"
            >
              <FaTrash />
            </button>
          </div>

          {conv.toUnitSymbol && conv.factor && (
            <div className="col-span-12">
              <ConversionHelper
                baseUnit={formData.symbol}
                targetUnit={conv.toUnitSymbol}
                factor={parseFloat(conv.factor)}
              />
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddConversion}
        className="w-full p-3 border-2 border-dashed rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-500 flex items-center justify-center"
        disabled={availableUnits.length === selectedUnits.size || isFetchingTypes}
      >
        <span className="mr-2"><FaPlus/> </span> Add Conversion
        {remainingUnits > 0 && ` (${remainingUnits} units available)`}
      </button>
    </div>
  );
};

export default UnitConversionSection;