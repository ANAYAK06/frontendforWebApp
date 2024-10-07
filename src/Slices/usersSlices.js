import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'

import {fetchUsers as fetchUsersAPI,
         createUser as creatUserAPI,
         updateUser as updateUserAPI,
         toggleUserStatus as toggleUserStatusAPI,
         deleteUser as deleteUserAPI

 } from '../api/usersAPI'




export const fetchUsers = createAsyncThunk('users/fetchUsers', fetchUsersAPI)
export const createUser = createAsyncThunk('users/createUser', creatUserAPI)
export const updateUser = createAsyncThunk('users/updateUser', updateUserAPI)
export const toggleUserStatus = createAsyncThunk('users/toggleUserStatus', toggleUserStatusAPI)
export const deleteUser = createAsyncThunk('user/deleteUser', deleteUserAPI)


const userSlice = createSlice({
    name :'users',

    initialState : {
        users:[]
    },
    reducers:{

    },
    extraReducers:(builder)=> {
        builder
        .addCase(fetchUsers.fulfilled, (state, action)=>{
            state.users = action.payload
        })
        .addCase(createUser.fulfilled, (state, action)=>{
            const newUser = action.payload
            state.users.push(newUser)
            
        })
        .addCase(updateUser.fulfilled, (state, action)=>{
            const updatedUser = action.payload
            const index = state.users.findIndex(user=>user._id === updatedUser._id)
            if(index !== -1){
                state.users[index] = updatedUser
            }

        })
        .addCase(toggleUserStatus.fulfilled, (state, action)=>{
            const updatedUser = action.payload
            const index =state.users.findIndex(user=>user._id === updatedUser._id)
            if(index !== -1){
                state.users[index] = updatedUser
            }
        })
        .addCase(deleteUser.fulfilled, (state, action)=>{
           const  deletedUser = action.payload
           state.users = state.users.filter((user)=>user._id !==deletedUser)

        })

    }



})

export default userSlice.reducer