import axios from 'axios';


export const getNotification = async(userRoleId) =>{
    try {
        const response = await axios.get(`/api/notification/usernotification`,{params:{userRoleId}})
        return response.data
        
    } catch (error) {
        console.error('Error fetching user menu:', error);
        throw error
        
    }
    
    
}

export const getuserNotificationCount = async(userRoleId) =>{
    try {
        const token = localStorage.getItem('token')
        if(!token){
            throw new Error('No token found');
        }
        const response = await axios.get('/api/notification/notificationcount', {
            headers:{
                Authorization: `Bearer ${token}`, 
            },
            params: {
                userRoleId
            },
        });
       return response.data
    } catch (error) {
        console.error('Error fetching count', error);
        throw error
        
    }
}

