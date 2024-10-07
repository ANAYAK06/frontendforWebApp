import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {getBudgetForVerification as getBugetForVerificationAPI} from '../api/ccBudgetAPI'
import {assignCCBudget as assignCCBudgetAPI} from '../api/ccBudgetAPI'
import {updateCCBudget as updateCCBudgetAPI} from '../api/ccBudgetAPI'

export const fetchCCBudgetForVerification = createAsyncThunk(
    'ccBudget/fetchForVerification',
    async(payload) => {
        const token = localStorage.getItem('token');
        const ccBudgets = await getBugetForVerificationAPI(payload.userRoleId, token)
        return ccBudgets
    }
)

export const assignCCBudget = createAsyncThunk(
    'ccBudget/assign',
    async(budgetData)=> {
        const result = await assignCCBudgetAPI(budgetData)
        return result
    }

)

export const updateCCBudget = createAsyncThunk(
    'ccBudget/update',
    async({id, action, remarks}, {rejectWithValue}) => {
        try {
            return await updateCCBudgetAPI(id, action, remarks);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update budget');
        }
    }
)

const ccBudgetSlice = createSlice({
    name: 'ccBudget',
    initialState : {
        verificationBudgets: [],
        loading: false,
        error: null,
        assignmentSuccess:false
    },
    reducers: {
        resetAssignmentSuccess: (state) => {
            state.assignmentSuccess = false
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchCCBudgetForVerification.pending, (state) => {
            state.loading = true;
            state.error = null
        })
        .addCase(fetchCCBudgetForVerification.fulfilled, (state, action) => {
            state.loading = false
            state.verificationBudgets = action.payload.ccBudgets
            console.log('Updated verification budgets:', state.verificationBudgets)
        })
        .addCase(fetchCCBudgetForVerification.rejected, (state, action) => {
            state.loading = false
            state.error = action.error.message
        })
        .addCase(assignCCBudget.pending, (state) => {
            state.loading = true
            state.error = null
            state.assignmentSuccess = false
        })
        .addCase(assignCCBudget.fulfilled, (state) => {
            state.loading = false
            state.assignmentSuccess = true

        })
        .addCase(assignCCBudget.rejected, (state, action) => {
            state.loading = false
            state.error = action.error.message
            state.assignmentSuccess = false
        })
        .addCase(updateCCBudget.pending, (state) => {
            state.loading = false
            state.error = null
        })
        .addCase(updateCCBudget.fulfilled, (state, action)=> {
            state.loading = false
            state.verificationBudgets = state.verificationBudgets.filter(
                budget => budget._id !==action.payload._id
            )
        })
        .addCase(updateCCBudget.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })



    }

})

export const {resetAssignmentSuccess} = ccBudgetSlice.actions

export default ccBudgetSlice.reducer