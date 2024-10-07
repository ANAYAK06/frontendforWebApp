import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'


import {loginUser as userLoginAPI} from '../api/userAuthAPI'


export const loginUser  = createAsyncThunk('auth/loginUser', async({email, password}, {rejectWithValue})=>{
    try {
        const data = await userLoginAPI(email,password)
        if(data.token){
            localStorage.setItem('token', data.token)
        }
        return data 
        
    } catch (error) {
        if(error.response && error.response.data){
            return rejectWithValue(error.response.data.message)
        }
        rejectWithValue('An Error occured while login')
        
    }
});

const authSlice = createSlice({
    name:'auth',
    initialState: {
        isLoggedIn:false,
        userInfo:{},
        error:null
    },
    reducers:{
        logout(state){
            state.isLoggedIn = false
            state.userInfo = {}
            state.error = null

            localStorage.removeItem('token')
        },

    },
    extraReducers:(builder)=>{
        builder
        .addCase(loginUser.fulfilled, (state, action)=>{
            state.isLoggedIn = true
            state.userInfo =action.payload.user
            state.error = null
        })
        .addCase(loginUser.rejected, (state, action)=>{
            state.isLoggedIn = false
            state.userInfo = {}
            state.error = action.payload
        })
    }
})

export const {logout} = authSlice.actions;

export default authSlice.reducer