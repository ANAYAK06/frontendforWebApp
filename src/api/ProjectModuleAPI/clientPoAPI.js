import axios from 'axios';

const API_BASE_URL = '/api/clientpo';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if(!token) {
        throw new Error('No token found');
    }
    return { Authorization: `Bearer ${token}` };
};


export const getPerformingCostCentres = async () => {
    console.log('Calling getPerformingCostCentres API');
    try {
        const url = `${API_BASE_URL}/cost-centres`;
        console.log('Cost centers URL:', url);
        
        const headers = getAuthHeader();
        console.log('Using auth headers:', headers);
        
        const response = await axios.get(url, {
            headers: headers
        });
        
        console.log('Cost centers API raw response:', response);
        
        // Check if the response has the expected structure
        if (response.data) {
            if (response.data.success && response.data.data) {
                console.log('Cost centers data (success.data format):', response.data.data);
                return response.data;
            } else {
                console.log('Cost centers data (direct format):', response.data);
                return {
                    success: true,
                    data: response.data
                };
            }
        } else {
            console.error('No data in cost centers response');
            throw new Error('No data received from API');
        }
    } catch (error) {
        console.error('Fetch cost centres error:', error);
        if (error.response) {
            console.error('Error status:', error.response.status);
            console.error('Error data:', error.response.data);
        }
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
        if(response.data){
            console.log('Client Details Data:', response.data);
        }
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

// Get all clients
export const getAllClients = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/clients`,
            {
                headers: getAuthHeader()
            }
        );
        console.log('All Clients Data:', response.data);
        return response.data;
    } catch (error) {
        console.error('Fetch all clients error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Get subclients by client ID
export const getSubClientsByClientId = async (clientId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/clients/${clientId}/subclients`,
            {
                headers: getAuthHeader()
            }
        );
        console.log('Subclients Data:', response.data);
        return response.data;
    } catch (error) {
        console.error('Fetch subclients error:', error.response?.data || error);
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