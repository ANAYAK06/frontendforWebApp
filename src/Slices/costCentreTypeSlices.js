import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'

import {
    fetchCostCentreTypes as costCentreTypeAPI
} from '../api/costCentreTypeAPI'


export const fetchCostCentreTypes = createAsyncThunk('costCentreTypes/fetchCostCentreTypes', costCentreTypeAPI)

const costCentreTypeSlice = createSlice({
    name:'costCentreTypes',
    initialState:{
        costCentreTypes :[]
    },
    reducers:{

    },
    extraReducers:(builder)=>{
        builder
        .addCase(fetchCostCentreTypes.fulfilled,(state, action)=>{
            state.costCentreTypes = action.payload
        })

    }
})

export default costCentreTypeSlice.reducer