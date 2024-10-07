import axios from "axios";


export const fetchUserCostCentres = async(req,res)=>{
    const response = await axios.get('/api/userscostcentres/viewuserassignedcostcentres')
    return response.data
}