import axios from "axios";



 export const fetchCostCentreTypes = async () => {
    const response = await axios.get('/api/cctype/costcentres')
    return response.data.map(option =>({
        value:option.ccid,
        label:option.ccType,
        subType:option.subType.map(sub=>({
            value:sub.subId,
            label:sub.sType
        }))
    }))
}