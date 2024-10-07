import axios from "axios";


export const loginUser = async (email, password) => {

    try {
        const response = await axios.post('/api/loginuser/userlogin', { email, password })
        return response.data
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;

    }


}