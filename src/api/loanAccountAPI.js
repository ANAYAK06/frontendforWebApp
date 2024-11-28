import axios from "axios";

const API_BASE_URL = '/api/loanaccounts';

const getAuthHeader = () => {
    const token = localStorage.getItem('token')
    if(!token) {
        throw new Error('No token found')
    }
    return {Authorization: `Bearer ${token}`}
}

export const createLoan = async (loanData) => {
    try {

        console.log('Creating loan with data:', JSON.stringify(loanData, null, 2));
        const response = await axios.post(
            `${API_BASE_URL}/createloan`,
            loanData,
            {
                headers: getAuthHeader(),
            }
        )
        return response.data
    } catch (error) {
        console.error('Loan creation error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                data: error.config?.data
            }
        });

        // If there's a response, throw the response data
        if (error.response?.data) {
            throw error.response.data;
        }
        // If there's no response data, throw a generic error
        throw new Error('Failed to create loan');
        
        
    }
}

export const checkLoanNumberExists = async (loanNumber) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/checkloannumberexists`,
            {
                params: { loanNumber },
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const fetchLoansForVerification = async (userRoleId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/getloansforverification`,
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

export const updateLoanStatus = async (id, updateData) => {
    try {
        console.log('Updating loan with ID:', id);
        const response = await axios.put(
            `${API_BASE_URL}/verifyloan/${id}`,
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

export const rejectLoan = async (id, remarks) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/rejectloan/${id}`,
            { id, remarks },
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Reject Loan Error:', error.response || error);
        throw error.response.data;
    }
};




export const getLoanSchedule = async (loanId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/getloanschedule/${loanId}`,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Function to get loan summary/statistics
export const getLoanSummary = async (loanId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/getloansummary/${loanId}`,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};