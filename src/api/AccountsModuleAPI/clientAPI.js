import axios from 'axios';

const API_BASE_URL = '/api/client';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if(!token) {
        throw new Error('No token found');
    }
    return { Authorization: `Bearer ${token}` };
};

// Create new client
export const createClient = async (clientData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/create`,
            clientData,
            {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Create client error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Get clients for verification
export const getClientsForVerification = async (userRoleId) => {
    try {
        console.log('Fetching clients with userRoleId:', userRoleId)
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
        console.error('Fetch clients verification error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Verify client
export const verifyClient = async (id, remarks) => {
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
        console.error('Verify client error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Reject client
export const rejectClient = async (id, remarks) => {
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
        console.error('Reject client error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Get active clients
export const getActiveClients = async (params = {}) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/active`,
            {
                params,
                headers: getAuthHeader()
            }
        );
        return response.data;
    } catch (error) {
        console.error('Fetch active clients error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Get active client by ID
export const getActiveClientById = async (id) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/active/${id}`,
            {
                headers: getAuthHeader()
            }
        );
        return response.data;
    } catch (error) {
        console.error('Fetch active client by ID error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// SubClient API Functions
// ---------------------

// Create new subclient
export const createSubClient = async (subClientData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/subclient/create`,
            subClientData,
            {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Create subclient error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Get subclients for verification
export const getSubClientsForVerification = async (userRoleId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/subclient/verification`,
            {
                params: { userRoleId },
                headers: getAuthHeader()
            }
        );
        return response.data;
    } catch (error) {
        console.error('Fetch subclients verification error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Verify subclient
export const verifySubClient = async (id, remarks) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/subclient/verify/${id}`,
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
        console.error('Verify subclient error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Reject subclient
export const rejectSubClient = async (id, remarks) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/subclient/reject/${id}`,
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
        console.error('Reject subclient error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};
