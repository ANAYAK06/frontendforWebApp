import axios from "axios";


export const fetchUsers = async ()=>{
   const response = await axios.get('/api/user/users')
    return response.data
};

export const createUser = async({userName, email, roleId})=>{
    const response = await axios.post('/api/user/users',{userName, email, roleId})
    return response.data;
}
export const updateUser = async({_id,userName, email, roleId})=>{
    const response = await axios.patch(`/api/user/users/${_id}`,{userName, email, roleId} )
    return response.data
}
export const toggleUserStatus = async(userId) =>{
    const userResponse = await axios.get(`/api/user/users/${userId}`);
    const currentStatus = userResponse.data.status
    const newStatus = currentStatus === 0 ? 1:0
    const response = await axios.patch(`/api/user/users/${userId}`, {status:newStatus})
    return response.data
}
export const deleteUser = async(id)=>{
    await axios.delete(`/api/user/users/${id}`);
    return id
}