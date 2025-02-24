import axios from 'axios';

const API_BASE_URL = '/api/clientpo';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if(!token) {
        throw new Error('No token found');
    }
    return { Authorization: `Bearer ${token}` };
};

// Get performing cost centres
export const getPerformingCostCentres = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/cost-centres`,
            {
                headers: getAuthHeader()
            }
        );
        return response.data;
    } catch (error) {
        console.error('Fetch cost centres error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Get won BOQs
export const getWonBOQs = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/boq/won`,
            {
                headers: getAuthHeader()
            }
        );
        return response.data;
    } catch (error) {
        console.error('Fetch won BOQs error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Get client details
export const getClientDetails = async (clientId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/client/${clientId}`,
            {
                headers: getAuthHeader()
            }
        );
        return response.data;
    } catch (error) {
        console.error('Fetch client details error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Create new client PO
export const createClientPO = async (poData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/create`,
            poData,
            {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Create client PO error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Get POs for verification
export const getPOsForVerification = async (userRoleId) => {
    try {
        console.log('Fetching POs with userRoleId:', userRoleId);
        const response = await axios.get(
            `${API_BASE_URL}/verification`,
            {
                params: { userRoleId },
                headers: getAuthHeader()
            }
        );
        console.log('API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Fetch POs verification error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Verify client PO
export const verifyClientPO = async (id, remarks) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/verify/${id}`,
            { remarks },
            {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Verify client PO error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Reject client PO
export const rejectClientPO = async (id, remarks) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/reject/${id}`,
            { remarks },
            {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Reject client PO error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Utility function to format API errors
export const handleApiError = (error) => {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'An unexpected error occurred';
    return {
        success: false,
        message: errorMessage
    };
};

// Export all API functions
export const clientPOApi = {
    getPerformingCostCentres,
    getWonBOQs,
    getClientDetails,
    createClientPO,
    getPOsForVerification,
    verifyClientPO,
    rejectClientPO,
    handleApiError
};