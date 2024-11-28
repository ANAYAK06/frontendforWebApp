import axios from "axios";

const API_BASE_URL = '/api/businessoppertunity';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if(!token) {
        throw new Error('No token found');
    }
    return {Authorization: `Bearer ${token}`};
};

export const createBusinessOpportunity = async (opportunityData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/createoppertunity`,
            opportunityData,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const fetchOpportunitiesForVerification = async (userRoleId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/getoppertunityforverification`,
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

export const updateOpportunityStatus = async (id, updateData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/updateoppertunity/${id}`,
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

export const rejectOpportunity = async (id, remarks) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/rejectoppertunity/${id}`,
            { remarks },
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Reject Business Opportunity Error:', error.response || error);
        throw error.response.data;
    }
};

export const getAllOpportunities = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/getalloppertunity`,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const getAllAcceptedOppertunity = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/getacceptedoppertunity`,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};