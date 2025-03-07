import axios from "axios";

const API_BASE_URL = '/api/materialrequisition';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token found');
    }
    return { Authorization: `Bearer ${token}` };
};

// Create new material requisition
export const createMaterialRequisition = async (requisitionData) => {
    try {
        console.log('Sending material requisition data to API:', requisitionData);
        const response = await axios.post(
            `${API_BASE_URL}/create`,
            requisitionData,
            {
                headers: getAuthHeader(),
            }
        );
        console.log('API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('API Error Details:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        if (error.response) {
            throw new Error(
                error.response.data.message || 
                JSON.stringify(error.response.data)
            ) 
        } else if (error.request) {
            throw new Error('No response received from server');
        } else {
            throw new Error(error.message);
        }
    }
};

// Get material requisitions for verification
export const getMaterialRequisitionsForVerification = async (userRoleId) => {
    try {
        console.log('Calling API with userRoleId:', userRoleId);
        const response = await axios.get(
            `${API_BASE_URL}/verification`,
            {
                params: { userRoleId, type: 'batch' }, // Added type=batch to get batch-grouped results
                headers: getAuthHeader(),
            }
        );
        console.log('API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching requisitions for verification:', {
            userRoleId,
            error: error.response?.data || error.message
        });
        if (error.response) {
            throw new Error(
                error.response.data.message || 
                JSON.stringify(error.response.data)
            );
        } else {
            throw new Error('Failed to fetch requisitions for verification');
        }
    }
};

// Verify batch of material requisitions
export const updateMaterialRequisitionStatus = async (batchId, remarks) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/update/${batchId}`,
            { remarks },
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating batch requisitions:', {
            batchId,
            error: error.response?.data || error.message
        });
        if (error.response) {
            throw new Error(
                error.response.data.message || 
                JSON.stringify(error.response.data)
            );
        } else {
            throw new Error('Failed to update batch requisitions');
        }
    }
};

// Reject batch of material requisitions
export const rejectMaterialRequisition = async (batchId, remarks) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/reject/${batchId}`,
            { remarks },
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error rejecting batch requisitions:', {
            batchId,
            error: error.response?.data || error.message
        });
        if (error.response) {
            throw new Error(
                error.response.data.message || 
                JSON.stringify(error.response.data)
            );
        } else {
            throw new Error('Failed to reject batch requisitions');
        }
    }
};

export const searchItemCodes = async (params) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/material/search-items`,
            {
                params: params,  
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error searching item codes:', error);
        throw error;
    }
};