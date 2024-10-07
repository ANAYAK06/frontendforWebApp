import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'

import {
    fetchUserRoles as fetchUserRolesAPI,
    updateUserRoles as updateUserRolesAPI,
    deleteUserRole as deleteUserRolesAPI,
    createUserRole as createUserRolesAPI

} from '../api/userRolesAPI'

export const fetchUserRoles = createAsyncThunk('userRoles/fetchUserRoles',fetchUserRolesAPI)
export const updateUserRoles = createAsyncThunk('userRoles/updateUserRoles', updateUserRolesAPI)
export const deleteUserRole = createAsyncThunk('userRoles/deleteUserRole', deleteUserRolesAPI)
export const createUserRole = createAsyncThunk('userRoles/createUserRole',createUserRolesAPI)






const userRolesSlice = createSlice({
    name:'userRoles',
    initialState :{
        userRoles:[],
        selectedRole:null,
        editRole:false,
        editRoleName:'',
        selectedCostCentreType:[],
        roleToDelete:null,
        roleName:'',
        isCostCentreApplicable:false,
        isCostCentreChangeApplicable:false,
    },
    reducers: {
        setSelectedRole: (state, action)=>{
            state.selectedRole = action.payload
        },
        setEditRole: (state, action) =>{
            state.editRole = action.payload
        },
        setEditRoleName: (state, action)=>{
            state.editRoleName = action.payload
        },
        setSelectedCostCentreType :(state, action)=>{
            state.selectedCostCentreType = action.payload
        },
      
      
        setRoleToDelete: (state, action)=>{
            state.roleToDelete = action.payload
        },
        setRoleName : (state, action)=>{
            state.roleName = action.payload
        },
        setIsCostCentreApplicable :(state, action)=>{
            state.isCostCentreApplicable = action.payload
        },
        setIsCostCentreChangeApplicable:(state, action)=>{
            state.isCostCentreChangeApplicable = action.payload
        }
        

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserRoles.fulfilled, (state, action)=>{
                state.userRoles =action.payload
            })
          
            .addCase(updateUserRoles.fulfilled, (state, action)=>{
                const updatedRole = action.payload
                state.userRoles = state.userRoles.map((role) => role._id === updatedRole._id ? updatedRole : role)
            })
            .addCase(deleteUserRole.fulfilled, (state, action)=>{
                const deletedRoleId = action.payload
                state.userRoles = state.userRoles.filter((role)=> role._id !== deletedRoleId)
            })
            .addCase(createUserRole.fulfilled, (state, action)=>{
                const newRole = action.payload
                state.userRoles.push(newRole)
                state.roleName = ''
                state.selectedCostCentreType = []
                state.isCostCentreApplicable =false

            })
    }
})

export const {
    setSelectedRole,
    setEditRole,
    setEditRoleName,
    setSelectedCostCentreType,
    setRoleToDelete,
    setRoleName,
    setIsCostCentreApplicable,
    setIsCostCentreChangeApplicable
    
} = userRolesSlice.actions;

export default userRolesSlice.reducer