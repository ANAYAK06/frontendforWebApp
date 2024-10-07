import axios from "axios";

 export const fetchCCState = async ()=>{
    const response = await axios.get('/api/ccstate/countrystate')
    return response.data

  

 }