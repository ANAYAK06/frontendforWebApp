import axios from "axios";

const API_BASE_URL = '/api/clientboq'

const getAuthHeader = (isMultipart = false) => {
    const token = localStorage.getItem('token');
    if(!token) {
        throw new Error('No token found');
    }
    const headers = {
        Authorization: `Bearer ${token}`
    };
    
    // Don't set Content-Type for multipart/form-data
    // Let browser set it automatically with boundary
    if (!isMultipart) {
        headers['Content-Type'] = 'application/json';
    }
    
    return headers;
};
export const createClientBOQ = async (boqData, files) => {
    try {
        const formData = new FormData();
        
        // Append BOQ data
        formData.append('tenderId', boqData.tenderId);
        formData.append('sendToClientDate', boqData.sendToClientDate.toISOString()); // Convert date to ISO string
        
        // Append files if they exist
        if (files && files.length > 0) {
            files.forEach(file => {
                formData.append('attachments', file);
            });
        }

        const config = {
            headers: {
                ...getAuthHeader(true),
                'Accept': 'application/json',
            }
        };

        const response = await axios.post(
            `${API_BASE_URL}/create`,
            formData,
            config
        );
        return response.data;
    } catch (error) {
        console.error('Create Client BOQ Error:', error.response || error);
        throw error.response?.data || error;
    }
};
export const getClientBOQsForVerification = async (userRoleId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/verification`,
            {
                params: { userRoleId },
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const verifyClientBOQ = async (id, remarks) => {
    try {
        console.log('Verifying BOQ with:', { id, remarks }); // Add logging
        
        const response = await axios.put(
            `${API_BASE_URL}/verify/${id}`,
            { remarks }, // Send remarks in the request body
            {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('Verify response:', response.data); // Add logging
        return response.data;
    } catch (error) {
        console.error('Verify error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

export const rejectClientBOQ = async (id, remarks) => {
    try {
        if (!remarks) {
            throw new Error('Remarks are required for rejection');
        }

        const response = await axios.put(
            `${API_BASE_URL}/reject/${id}`,
            { remarks },
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        console.error('Reject Client BOQ Error:', error.response || error);
        throw error.response?.data || error;
    }
};

export const getAllAcceptedClientBOQs = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/accepted`,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getClientBOQById = async (id) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/${id}`,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};