import axios from 'axios';


export const userMenu = async(userRoleId) =>{
    try {
        const response = await axios.get(`/api/usermenudata/getrolemenu`,{params:{userRoleId}})
        return response.data
        
    } catch (error) {
        console.error('Error fetching user menu:', error);
        throw error
        
    }
    
    
}