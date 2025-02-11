import axios from 'axios';

const API_BASE_URL = '/api/clientboq';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if(!token) {
        throw new Error('No token found');
    }
    return { Authorization: `Bearer ${token}` };
};

// Get BOQs ready for final status
export const getTenderForFinalStatus = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/get-tender-for-final-status`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Fetch tenders for final status error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Create tender final status with file upload support
export const createTenderStatus = async (formData) => {
    try {
        // If wonDetails exists in formData, ensure it's properly stringified
        const wonDetailsData = formData.get('wonDetails');
        if (wonDetailsData) {
            // Parse the current wonDetails to modify it
            const wonDetails = JSON.parse(wonDetailsData);
            
            // Remove the existing wonDetails from formData
            formData.delete('wonDetails');
            
            // Add back the modified wonDetails
            formData.append('wonDetails', JSON.stringify({
                ...wonDetails,
                // Ensure these fields are explicitly included
                tenderNumber: wonDetails.tenderNumber || '',
                originalBOQAmount: Number(wonDetails.originalBOQAmount),
                negotiatedAmount: Number(wonDetails.negotiatedAmount || wonDetails.finalAmount),
                originalVariationPercentage: Number(wonDetails.originalVariationPercentage),
                finalVariationPercentage: Number(wonDetails.finalVariationPercentage),
                finalVariationAmount: Number(wonDetails.finalVariationAmount),
                finalAcceptedAmount: Number(wonDetails.finalAcceptedAmount || wonDetails.finalAmount)
            }));
        }

        const response = await axios.post(
            `${API_BASE_URL}/create-tender-status`,
            formData,
            {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Create tender status error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};
// Get tender statuses for verification
export const fetchTenderStatusForVerification = async (userRoleId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/get-tender-status-verification`,
            {
                params: { userRoleId },
                headers: getAuthHeader()
            }
        );
        return response.data;
    } catch (error) {
        console.error('Fetch tender status verification error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Update tender status
export const updateTenderStatus = async (id, remarks) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/update-tender-status/${id}`,
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
        console.error('Update tender status error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Reject tender status
export const rejectTenderStatus = async (id, remarks) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/reject-tender-status/${id}`,
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
        console.error('Reject tender status error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};