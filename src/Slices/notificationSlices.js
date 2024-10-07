import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {getuserNotificationCount as usernotificationcountAPI} from '../api/notificationAPI'


export const fetchNotificationCount = createAsyncThunk('notification/fetchNotificationCount',
    async(payload)=>{
        const token = localStorage.getItem('token')
        const count = await usernotificationcountAPI(payload.userRoleId, token)
        return count
    }
)

const notificationSlice = createSlice({
    name:'notification',
    initialState:{
        notificationCount:{count:0}
    },
    reducers:{
        updateNotificationCount(state, action){
            
            state.notificationCount = action.payload
        }

    },
    extraReducers:(builder)=>{
        builder
        .addCase(fetchNotificationCount.fulfilled, (state, action)=>{
            
            state.notificationCount = action.payload
        })
    }
})

export const {updateNotificationCount} = notificationSlice.actions


export default notificationSlice.reducer