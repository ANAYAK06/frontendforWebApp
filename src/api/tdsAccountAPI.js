import axios from "axios";

const API_BASE_URL = '/api/tdsaccount';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if(!token) {
        throw new Error('No token found');
    }
    return {Authorization: `Bearer ${token}`};
};

export const createTdsAccount = async (tdsAccountData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/createtdsaccount`,
            tdsAccountData,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const checkTdsAccountExists = async (tdsAccountName) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/checktdsaccountexist`,
            {
                params: { tdsAccountName },
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const fetchTdsAccountsForVerification = async (userRoleId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/gettdsaccountforverification`,
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

export const updateTdsAccountStatus = async (id, updateData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/verifytdsaccount/${id}`,
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

export const rejectTdsAccount = async (id, remarks) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/rejecttdsaccount/${id}`,
            { id, remarks },
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Reject TDS Account Error:', error.response || error);
        throw error.response.data;
    }
};

export const getAllTdsAccounts = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/getalltdsaccount`,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};