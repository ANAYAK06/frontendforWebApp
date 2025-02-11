// components/ExpandableMessage.js
import React, { useState } from 'react';
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { TypeWriter } from './TypeWriter';
import { documentTypes } from './config/documentTypeConfig';

export const ExpandableMessage = ({ message, details }) => {
  const [expanded, setExpanded] = useState(false);

  if (message.type === 'user') {
    return <span>{message.content}</span>;
  }

  const formattedDetails = details && 
    documentTypes[details.documentType]?.detailsFormatter?.(details);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        <TypeWriter text={message.content} />
        {formattedDetails && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="ml-2 text-indigo-600 hover:text-indigo-800"
          >
            {expanded ? <IoChevronUp size={16} /> : <IoChevronDown size={16} />}
          </button>
        )}
      </div>
      {expanded && formattedDetails && (
        <div className="mt-2 p-2 bg-gray-50 rounded">
          {Object.entries(formattedDetails).map(([groupName, group]) => (
            <div key={groupName} className="mb-3 last:mb-0">
              <div className="font-medium text-gray-700 mb-1">{groupName}</div>
              {Object.entries(group).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm py-1 border-b last:border-b-0 pl-2">
                  <span className="text-gray-600">{key}:</span>
                  <span className="text-gray-900 ml-4">{value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};