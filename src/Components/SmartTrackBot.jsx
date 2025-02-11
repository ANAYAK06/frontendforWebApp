import React, { useState, useEffect, useRef } from 'react';
import { IoClose, IoHandRight, IoRemove, IoSend, IoChevronDown, IoChevronUp } from "react-icons/io5";
import { BiLoaderCircle } from "react-icons/bi";
import { RxAvatar } from "react-icons/rx";
import { RiAliensLine } from "react-icons/ri";
import { RiRobot2Line } from "react-icons/ri";
import { VscRobot } from "react-icons/vsc";
import TrackbotIcon from './TrackbotIcon';
import { FaRobot } from "react-icons/fa";

import { useDispatch, useSelector } from 'react-redux';
import { processQuery } from '../Slices/trackingSlices';
import { documentTypes } from './config/documentTypeConfig';

// Define example suggestions
const suggestions = [
  'Track BOQ EPPL/EI/24/11/00001',
  'Check status of PO-12345',
  'Find indent IND-789',
  'Track item code 1MV001001'
];

const TypeWriter = ({ text, onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const index = useRef(0);

  useEffect(() => {
    // Reset index when text changes
    index.current = 0;
    setDisplayText('');
  }, [text]);

  useEffect(() => {
    if (index.current < text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayText(current => current + text[index.current]);
        index.current += 1;
      }, 15);
      return () => clearTimeout(timeoutId);
    } else if (onComplete) {
      onComplete();
    }
  }, [displayText, text, onComplete]);

  return <span>{displayText}</span>;
};

// Updated ExpandableMessage component with nested object handling
const ExpandableMessage = ({ message, details }) => {
  const [expanded, setExpanded] = useState(false);

  if (message.type === 'user') {
    return <span>{message.content}</span>;
  }

  const formattedDetails = details && documentTypes[details.documentType]?.detailsFormatter?.(details);

  const renderDetailValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value).map(([subKey, subValue]) => (
        <div key={subKey} className="ml-4 flex justify-between text-sm py-1">
          <span className="text-gray-600 font-medium">{subKey}:</span>
          <span className="text-gray-900 ml-4">{String(subValue)}</span>
        </div>
      ));
    }
    return String(value);
  };

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
          {Object.entries(formattedDetails).map(([sectionKey, sectionValue]) => (
            <div key={sectionKey} className="mb-3">
              <div className="font-semibold text-gray-700 mb-1">{sectionKey}</div>
              {Object.entries(sectionValue).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm py-1 border-b last:border-b-0">
                  <span className="text-gray-600 font-medium">{key}:</span>
                  <span className="text-gray-900 ml-4">{renderDetailValue(value)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SmartTrackBot = () => {
  const dispatch = useDispatch();
  const { currentStatus, loading, error } = useSelector(state => state.tracking);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setMessages([{
        type: 'bot',
        content: "Hi  I'm  your tracking assistant. I can help you track various documents including cash vouchers, POs, budgets, and more. What would you like to track?",
        showSuggestions: true
      }]);
      setShowSuggestions(true); 
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatResponse = (response) => {
    if (!response || !response.data) return 'No data available';
    
    const { documentType, ...data } = response.data;
    const config = documentTypes[documentType];
    
    if (config?.responseFormatter) {
      return config.responseFormatter(data);
    }
    
    return JSON.stringify(data, null, 2);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const cleanedInput = inputMessage.trim();
    setIsProcessing(true);
    
    setMessages(prev => [...prev, { 
      type: 'user', 
      content: cleanedInput 
    }]);
    setShowSuggestions(false);
    setInputMessage('');

    try {
      const resultAction = await dispatch(processQuery(cleanedInput));
      
      if (processQuery.fulfilled.match(resultAction)) {
        const response = resultAction.payload;
        
        if (response.success) {
          if (response.type === 'tracking' && response.data) {
            const documentType = response.data.documentType;
            const config = documentTypes[documentType];
            
            if (config?.responseFormatter) {
              setMessages(prev => [...prev, {
                type: 'bot',
                content: config.responseFormatter(response.data),
                details: response.data
              }]);
            }
          }
        } else {
          setMessages(prev => [...prev, {
            type: 'bot',
            content: response.message || 'Failed to process query',
            error: true,
            showSuggestions: response.suggestions?.length > 0
          }]);
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: error.message || 'An error occurred',
        error: true
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    setShowSuggestions(false);
  };

  const toggleTrackbot = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  if (!isOpen) return <TrackbotIcon onClick={toggleTrackbot} />;

  return (
    <div className={`fixed right-4 bottom-5 w-96 bg-white shadow-lg rounded-lg transition-all duration-300 ease-in-out text-indigo-500 ${
      isMinimized ? 'h-14' : 'h-[calc(100vh-6rem)] max-h-[600px]'
    } animate-slide-up`}>
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-indigo-600 text-white rounded-t-lg">
        <h2 className="text-lg font-semibold">Tracker AdAm</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:text-gray-300 transition-colors duration-200"
          >
            <IoRemove size={20} />
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="hover:text-gray-300 transition-colors duration-200"
          >
            <IoClose size={20} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      {!isMinimized && (
        <div className="flex flex-col h-[calc(100%-56px)]">
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((message, index) => (
              <div key={index}>
                <div className="flex items-start gap-2">
                  {/* Bot icon for bot messages */}
                  {message.type === 'bot' && (
                    <div className="flex-shrink-0 border rounded-full p-1 bg-indigo-600 border-indigo-600">
                      <RiRobot2Line className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  {/* Message content */}
                  <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} flex-1`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-indigo-100 text-indigo-900'
                        : 'bg-gray-200 text-gray-900'
                    }`}>
                      {message.type === 'bot' && index === 0 && (
                        <IoHandRight className="inline-block mr-2 text-yellow-500" />
                      )}
                      <ExpandableMessage 
                        message={message}
                        details={message.details}
                      />
                    </div>
                  </div>

                  {/* User icon for user messages */}
                  {message.type === 'user' && (
                    <div className="flex-shrink-0 border rounded-full p-1 bg-indigo-600 border-indigo-600">
                      <RxAvatar className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                
                {message.showSuggestions && showSuggestions && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-600">Try these examples:</p>
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block min-w-fit text-left p-2 bg-gray-50 hover:bg-gray-200 rounded-md transition duration-150 ease-in-out border border-indigo-700"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-gray-50 border-t">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Type your tracking request..."
                className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isProcessing}
              />
              <button
                onClick={handleSendMessage}
                disabled={isProcessing}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:bg-indigo-400"
              >
                {isProcessing ? (
                  <BiLoaderCircle className="w-5 h-5 animate-spin" />
                ) : (
                  <IoSend size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartTrackBot;