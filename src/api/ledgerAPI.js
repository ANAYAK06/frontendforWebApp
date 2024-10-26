import axios from "axios";

const API_BASE_URL = '/api/accountsledger'

const getAuthHeader = () => {
    const token = localStorage.getItem('token')
    if(!token) {
        throw new Error('No token found')
    }
    return {Authorization: `Bearer ${token}`}
}



export const createLedger = async (createLedger) => {
    try {
        const  response = await axios.post(`${API_BASE_URL}/creategeneralledger`, createLedger ,{
            headers:getAuthHeader(),
            
        })
        return response.data
    } catch (error) {
        throw error.response.data;
        
    }
}

export const checkLedgerNameExists = async (ledgerName) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/checkledgernameexists`, {
            params: { ledgerName },
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const fetchLedgersForVerification = async (userRoleId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/getgeneralledgerforverification`, {
            params: { userRoleId },
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const updateLedgerStatus = async (id, updateData) => {
    try {
        console.log('Updating ledger with ID:', id); // 
        const response = await axios.put(`${API_BASE_URL}/verifygeneralledger/${id}`, updateData, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const rejectLedger = async (id, remarks) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/rejectgeneralledger/${id}`, 
            
            { id, remarks },
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Reject Ledger Error:', error.response || error);
        throw error.response.data;
    }
};
