import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'

import { fetchAllCostCentreData  as costCentreAPI } from '../api/ccDataAPI'


export const fetchAllCCdata = createAsyncThunk('costCentres/fetchAllCCdata', costCentreAPI)


const costCentreSlice = createSlice({
    name:'costCentres',
    initialState: {
        allCostCentreData:[],
        status:'idle',
        error:null
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder
        .addCase(fetchAllCCdata.pending, (state)=>{
            state.status = 'loading'
        })
        .addCase(fetchAllCCdata.fulfilled, (state, action)=>{
            state.status = 'succeeded'
            state.allCostCentreData = action.payload
        })
    }

})

export default costCentreSlice.reducer