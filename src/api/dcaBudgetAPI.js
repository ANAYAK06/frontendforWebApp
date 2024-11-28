import axios from "axios";

const API_BASE_URL = '/api/dcabudgetaccount'

const getAuthHeader = () => {
    const token = localStorage.getItem('token')
    if(!token) {
        throw new Error('No token found')
    }
    return {Authorization: `Bearer ${token}`}
}



export const fetchEligibleCCs = async (ccid, subId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/eligible-ccs`, {
            params: {ccid, subId}
        });
        return response.data
    } catch (error) {
        throw error.response.data
    }
}

export const fetchDCAForCC = async(ccid, subId, ccNo) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/dca-for-ccs`, {
            params: {ccid, subId, ccNo}
        })
        return response.data
    } catch (error) {
        throw error.response.data
        
    }
}

export const assignDCABudget = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/assigndcabudget`, data,  {
            headers:getAuthHeader()

        })
        return response.data
    } catch (error) {
        throw error.response.data
        
    }
}

export const fetchFiscalYearsForCC = async (ccNo) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/fiscal-years-for-budget`, {
            params: { ccNo },
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const fetchBudgetForCCAndFiscalYear = async (ccNo, fiscalYear) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/cc-budget-in-fiscalyears`, {
            params: { ccNo, fiscalYear },
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const getDCABudgetForVerification = async (userRoleId, ccidFilter) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/getdcabudget-for-verification`, {

            headers:getAuthHeader(),

            params:{userRoleId,
                    ccidFilter
            },
            
        })
        return response.data
    } catch (error) {
        throw error.response.data
        
    }
}   

export const updateDCABudget = async(referenceNumber, remarks) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/update-dca-budget`,
            {referenceNumber, remarks},
            {headers:getAuthHeader()}

        )
        return response.data
    } catch (error) {
        throw error.response.data
        
    }
}

export const rejectDCABudget = async ( referenceNumber, remarks) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/reject-dca-budget`,
            {referenceNumber, remarks},
            {headers: getAuthHeader()}
        )
        return response.data
    } catch (error) {
        throw error.response.data
        
    }
}