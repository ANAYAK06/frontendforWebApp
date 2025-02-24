import axios from "axios";

const API_BASE_URL = '/api/itemcode';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token found');
    }
    return { Authorization: `Bearer ${token}` };
};

// Base Code Operations
// ------------------

export const createBaseCode = async (data, isExcelUpload = false) => {
    try {
        const headers = {
            ...getAuthHeader(),
            'Content-Type': 'application/json'
        };

        // For bulk upload, data is already properly structured
        // For single item, use as is
        const requestData = isExcelUpload ? data : {
            ...data,
            isExcelUpload: 'false'
        };

        console.log('API sending data:', requestData);

        const response = await axios.post(
            `${API_BASE_URL}/base-code`,
            requestData,
            { headers }
        );
        
        return response.data;
    } catch (error) {
        console.error('API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

export const getAllBaseCodes = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/base-codes`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getBaseCodeById = async (id) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/base-code/${id}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getBaseCodesForVerification = async (userRoleId, type = 'single') => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/base-code/verification`,
            {
                params: { userRoleId, type },
                headers: getAuthHeader()
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const verifyBaseCode = async (data) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/base-code/verify`,
            data,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const rejectBaseCode = async (data) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/base-code/reject`,
            data,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Specification Operations
// ----------------------

export const createSpecification = async (data, isExcelUpload = false) => {
    try {
        const headers = {
            ...getAuthHeader(),
            'Content-Type': 'application/json'
        };

        // For bulk upload, data is already properly structured
        // For single item, use as is
        const requestData = isExcelUpload ? {
            isExcelUpload: 'true',
            data: JSON.stringify(data),
            remarks: data.remarks || 'Bulk upload'
        } : {
            ...data,
            isExcelUpload: 'false'
        };

        console.log('API sending specification data:', requestData);

        const response = await axios.post(
            `${API_BASE_URL}/base-code/specification`,
            requestData,
            { headers }
        );
        
        return response.data;
    } catch (error) {
        console.error('API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};


export const getSpecificationsByBaseCode = async (baseCodeId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/base-code/${baseCodeId}/specifications`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getSpecificationsForVerification = async (userRoleId, type = 'single') => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/specification/verification`,
            {
                params: { userRoleId, type },
                headers: getAuthHeader()
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const verifySpecification = async (data) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/specification/verify`,
            data,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const rejectSpecification = async (data) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/specification/reject`,
            data,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Search and Full Code Operations
// -----------------------------

export const getAllItemCodes = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/full-codes`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const searchItemCodes = async (params) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/search`,
            {
                params,
                headers: getAuthHeader()
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Supporting Operations
// -------------------

export const getDCAForItemCode = async (itemType) => {
    try {

       
        const response = await axios.get(
            `${API_BASE_URL}/dca-for-itemcode`,
            { 
                params: { itemType },  
                headers: getAuthHeader() 
            }
        );
        
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getSubDCAForItemCode = async (dcaCode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/get-subdca-for-itemcode`,
            {
                params: { dcaCode },
                headers: getAuthHeader()
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};