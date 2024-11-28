import axios from "axios";

const API_BASE_URL = '/api/bankaccount'

const getAuthHeader = () => {
    const token = localStorage.getItem('token')
    if(!token) {
        throw new Error('No token found')
    }
    return {Authorization: `Bearer ${token}`}
}

export const createBankAccount = async (bankAccountData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/createbankaccount`, 
            bankAccountData,
            {
                headers: getAuthHeader(),
            }
        )
        return response.data
    } catch (error) {
        throw error.response.data;
    }
}

export const checkBankAccountExists = async (accountNumber) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/checkbankaccountexists`,
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

export const fetchBankAccountsForVerification = async (userRoleId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/getbankaccountsforverification`,
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

export const updateBankAccountStatus = async (id, updateData) => {
    try {
        console.log('Updating bank account with ID:', id);
        const response = await axios.put(
            `${API_BASE_URL}/verifybankaccount/${id}`,
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

export const rejectBankAccount = async (id, remarks) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/rejectbankaccount/${id}`,
            { id, remarks },
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Reject Bank Account Error:', error.response || error);
        throw error.response.data;
    }
};
export const getAllBankAccounts = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/getallbankaccounts`,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};