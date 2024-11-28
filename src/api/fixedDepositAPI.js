import axios from "axios";

const API_BASE_URL = '/api/fixeddeposit';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token found');
    }
    return { Authorization: `Bearer ${token}` };
};

export const createFixedDeposit = async (fixedDepositData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/createfixeddeposit`,
            fixedDepositData,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const checkFDAccountExists = async (accountNumber) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/checkfdaccountexists`,
            {
                params: { accountNumber },
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const fetchFDsForVerification = async (userRoleId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/getfdsforverification`,
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

export const updateFixedDepositStatus = async (id, updateData) => {
    try {
        console.log('Updating fixed deposit with ID:', id ,'Data:', updateData);
        const response = await axios.put(
            `${API_BASE_URL}/verifyfixeddeposit/${id}`,
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

export const rejectFixedDeposit = async (id, remarks) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/rejectfixeddeposit/${id}`,
            { id, remarks },
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Reject Fixed Deposit Error:', error.response || error);
        throw error.response.data;
    }
};

export const getAllFixedDeposits = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/getallfixeddeposits`,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};