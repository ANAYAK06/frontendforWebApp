import axios from "axios";
const API_BASE_URL = '/api/costcentres';





const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token found');
    }
    return { Authorization: `Bearer ${token}` };
};

export const createCostCentre = async (costCentreData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/createnewcostcentre`, costCentreData, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const checkCCNoExists = async (ccNo) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/checkccno/${ccNo}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const fetchCostCentresForVerification = async (userRoleId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/getccforverification`, {
            params: { userRoleId },
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const updateCostCentreStatus = async (id, updateData) => {
    try {
        console.log('Updating cost centre with ID:', id);
        const response = await axios.put(`${API_BASE_URL}/updatecostcentre/${id}`, updateData, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const rejectCostCentre = async (id, remarks) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/rejectcostcentre/${id}`, 
            { remarks },
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const getAllCostCentres = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/getallcostcentres`, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const getEligibleCCForBudgetAssign = async (ccid, subId, fiscalYear) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/geteligibleccforbudgetassign`, {
            params: { ccid, subId, fiscalYear },
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const fetchCCCodesAPI = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/getcccodes`, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const fetchAllCostCentreData = async ()=>{
    try {
        const response = await axios.get(`${API_BASE_URL}/allcostcentredata`,
            {
                headers: getAuthHeader(),
    });
    return response.data;
    } catch (error) {
        throw error.response.data;
        
    }
    
    
}