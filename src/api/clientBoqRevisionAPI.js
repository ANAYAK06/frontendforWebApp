
import axios from "axios";

const API_BASE_URL = '/api/clientboq';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if(!token) {
        throw new Error('No token found');
    }
    return {Authorization: `Bearer ${token}`};
};



// Update BOQ rates
export const updateBOQRates = async (id, updateData) => {
    try {
        console.log('Updating BOQ rates:', { id, updateData });
        const response = await axios.put(
            `${API_BASE_URL}/reviseboqrates/${id}`,
            updateData,
            {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Update BOQ rates error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Get BOQs for revision verification
export const fetchBOQsForRevisionVerification = async (userRoleId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/boqrevisionforverification`,
            {
                params: { userRoleId },
                headers: getAuthHeader()
            }
        );
        return response.data;
    } catch (error) {
        console.error('Fetch BOQ revisions error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Verify BOQ revision
export const verifyBOQRevision = async (id, remarks) => {
    try {
        console.log('Verifying BOQ revision:', { id, remarks });
        const response = await axios.put(
            `${API_BASE_URL}/verifyboqrevision/${id}`,
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
        console.error('Verify BOQ revision error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Reject BOQ revision
export const rejectBOQRevision = async (id, remarks) => {
    try {
        console.log('Rejecting BOQ revision:', { id, remarks });
        const response = await axios.put(
            `${API_BASE_URL}/rejectboqrevision/${id}`,
            { id, remarks },
            {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Reject BOQ revision error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

export const fetchPreviousRates = async (boqId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/boqpreviousrates/${boqId}`,
            {
                headers: getAuthHeader()
            }
        );
        return response.data;
    } catch (error) {
        console.error('Fetch previous rates error:', error);
        throw error.response?.data || error;
    }
};

export const fetchRateHistory = async (boqId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/rate-history/${boqId}`,
            {
                headers: getAuthHeader()
            }
        );
        return response.data;
    } catch (error) {
        console.error('Fetch rate history error:', error);
        throw error.response?.data || error;
    }
};
