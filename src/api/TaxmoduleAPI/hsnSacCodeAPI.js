import axios from "axios";

const API_BASE_URL = '/api/hsnsaccode';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token found');
    }
    return { Authorization: `Bearer ${token}` };
};

// Create new HSN code
export const createHSNCode = async (hsnData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/create`,
            hsnData,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Get HSN codes for verification
export const getHSNForVerification = async (userRoleId) => {
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
        throw error.response.data;
    }
};

// Verify HSN code
export const verifyHSNCode = async (id, remarks) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/verify/${id}`,
            { remarks },
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Reject HSN code
export const rejectHSNCode = async (id, remarks) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/reject/${id}`,
            { remarks },
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Get all approved HSN codes
export const getAllApprovedHSN = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/approved`,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Edit HSN code
export const editHSNCode = async (id, updateData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/edit/${id}`,
            updateData,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Get HSN edits for verification
export const getHSNEditsForVerification = async (userRoleId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/edit/verification`,
            {
                params: { userRoleId },
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Verify HSN edit
export const verifyHSNEdit = async (id, remarks) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/edit/verify/${id}`,
            { remarks },
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Reject HSN edit
export const rejectHSNEdit = async (id, remarks) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/edit/reject/${id}`,
            { remarks },
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        console.error('Reject HSN Edit Error:', error.response || error);
        throw error.response.data;
    }
};



