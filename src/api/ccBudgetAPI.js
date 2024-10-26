import axios from "axios";

const API_BASE_URL = '/api/ccbudget'

const getAuthHeader = () => {
    const token = localStorage.getItem('token')
    if(!token) {
        throw new Error('No token found')
    }
    return {Authorization: `Bearer ${token}`}
}


export const getBudgetForVerification = async (userRoleId, ccidFilter) => {
    try {
        
        
        const response = await axios.get(`${API_BASE_URL}/getccbudgetforverification`,{
            headers:getAuthHeader(),
            params: {
                userRoleId,
                ccidFilter
            },

        })
        
        return response.data
    } catch (error) {
        
    throw error;
        
    }
}


export const assignCCBudget = async (budgetData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/assignccbudget`, budgetData, {
            headers: getAuthHeader()
        })
        return response.data
    } catch (error) {
        
        throw error
        
    }
}

export const updateCCBudget = async(id, action, remarks) =>{
    try {
        const response = await axios.put(`${API_BASE_URL}/updateccbudget/${id}`, 
            {action, remarks},
            {headers: getAuthHeader()}
        )
        return response.data
    } catch (error) {
       
        throw error
        
    }
}