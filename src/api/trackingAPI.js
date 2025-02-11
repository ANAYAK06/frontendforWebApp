// services/trackingApi.js

import axios from 'axios';

const API_BASE_URL = '/api/tracking';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if(!token) {
        throw new Error('No token found');
    }
    return { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json' 
    };
};

// Process natural language query
export const processTrackingQuery = async (query) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/query`,
            { query },
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Process query error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Get document status
export const getDocumentStatus = async (documentType, referenceId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/status/${documentType}/${referenceId}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Get document status error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};


