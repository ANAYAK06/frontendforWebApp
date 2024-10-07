import axios from "axios";

export const fetchAllCostCentreData = async ()=>{
    const response = await axios.get('/api/costcentres/allcostcentredata')
    return response.data
}