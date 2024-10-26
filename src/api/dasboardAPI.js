import axios from "axios";

const API_BASE_URL = '/api/dashboard'

const getAuthHeader = () => {
    const token = localStorage.getItem('token')
    if(!token) {
        throw new Error('No token found')
    }
    return {Authorization: `Bearer ${token}`}
}

export const fetchDashboardPreferences = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/dashboard-preferences`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard preferences:', error);
        throw error;
    }
}

export const saveDashboardPreferences = async (preferences) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/dashboard-preferences`, 
            { components: preferences },
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error saving dashboard preferences:', error);
        throw error;
    }
}
