import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'

import { userMenu as userMenuAPI} from '../api/userMenuAPI'


export const fetchUserMenu = createAsyncThunk('userMenu/fetchUserMenu',
    async(payload)=>{
        const response = await userMenuAPI(payload.userRoleId)
        return response
    }
)


const userMenuSlice = createSlice({

    name:'userMenu',
    initialState:{
        userMenu:[]
    },
    reducers:{

    },
    extraReducers:(builder)=>{
        builder
        .addCase(fetchUserMenu.fulfilled, (state, action)=>{
            state.userMenu = action.payload

        })
    }



})

export default userMenuSlice.reducer