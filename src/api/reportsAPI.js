import axios from "axios";

const API_BASE_URL = '/api/reports'


export const getBalanceSheetReport = async(fiscalYear)=> {
    try {
        const response = await axios.get(`${API_BASE_URL}/balance-sheet`, {
            params:{fiscalYear}
        })
        return response.data

        
    } catch (error) {
        console.error('Error fetching balance sheet:', error);
        throw error;
        
    }
}


export const getProfitandLossReport = async (fiscalYear) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/profit-and-loss`, {
            params: { fiscalYear }
        });
        console.log('API Response:', response.data);
        return response.data; // Return just the data, not the entire response
    } catch (error) {
        console.error('Error fetching profit and loss:', error);
        throw error;
    }
};
