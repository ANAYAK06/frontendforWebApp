import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'


import {fetchCCState as ccStateAPI} from '../api/ccStateAPI'


export const fetchStates = createAsyncThunk('ccstate/fetchStates', ccStateAPI)


const indianStateSlice = createSlice({
    name:'ccstate',
    initialState: {
        ccstate:[]
    },
    reducers:{

    },
    extraReducers:(builder)=>{
        builder
        .addCase(fetchStates.fulfilled,(state, action)=>{
            state.ccstate = action.payload
        })
    }

})

export default indianStateSlice.reducer