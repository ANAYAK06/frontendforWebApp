import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import { getBalanceSheetReport as getBalanceSheetReportAPI,
    getProfitandLossReport as getProfitAndLossAPI
 } from '../api/reportsAPI'


export const fetchBalanceSheet = createAsyncThunk(
    'reports/fetchBalanceSheet',
    async(fiscalYear, {rejectWithValue}) => {
        try {
            const response = await getBalanceSheetReportAPI(fiscalYear)
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'An error occurred')
            
        }
    }
)

export const fetchProfitAndLoss = createAsyncThunk(
    'reports/fetchProfitAndLoss',
    async (fiscalYear, { rejectWithValue }) => {
        try {
            const data = await getProfitAndLossAPI(fiscalYear);
            console.log('Thunk response:', data);
            return data; // Return the data directly
        } catch (error) {
            return rejectWithValue(error.response?.data || 'An error occurred');
        }
    }
);



const reportSlices = createSlice({
    name:'reports',
    initialState: {
        balanceSheet:null,
        loading:false,
        error:null,
        profitAndLoss: null,
        loadingPL:false,
        errorPL:null
       
    },
    reducers: {
        resetBalanceSheet: (state) => {
            state.balanceSheet = null
            state.error = null
        },
        resetProfitAndLoss: (state) => {
            state.profitAndLoss = null;
            state.errorPL = null;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchBalanceSheet.pending, (state) => {
            state.loading = true
            state.error = null
            
        })
        .addCase(fetchBalanceSheet.fulfilled, (state, action) => {
            state.loading = false
            state.balanceSheet = action.payload
            

        })
        .addCase(fetchBalanceSheet.rejected, (state, action) => {
            state.loadingPL = false
            state.errorPL = action.payload
            
        })
        .addCase(fetchProfitAndLoss.pending, (state) => {
            state.loadingPL = true;
            state.errorPL = null;
        })
        .addCase(fetchProfitAndLoss.fulfilled, (state, action) => {
            console.log('Slice payload:', action.payload);
            state.loadingPL = false;
            state.profitAndLoss = action.payload;
        })
        .addCase(fetchProfitAndLoss.rejected, (state, action) => {
            state.loadingPL = false;
            state.errorPL = action.payload;
        });
    }
})


export const {resetBalanceSheet, resetProfitAndLoss} = reportSlices.actions

export default reportSlices.reducer