import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getBudgetForVerification as getBugetForVerificationAPI,
    assignCCBudget as assignCCBudgetAPI,
    updateCCBudget as updateCCBudgetAPI
} from '../api/ccBudgetAPI';

// Modified fetch thunk with better error handling
export const fetchCCBudgetForVerification = createAsyncThunk(
    'ccBudget/fetchForVerification',
    async (payload, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            const response = await getBugetForVerificationAPI(payload.userRoleId, token);
            // Add validation for the response
            if (!response || !response.ccBudgets) {
                throw new Error('Invalid response format');
            }
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch budgets');
        }
    }
);

export const assignCCBudget = createAsyncThunk(
    'ccBudget/assign',
    async (budgetData, { rejectWithValue }) => {
        try {
            const result = await assignCCBudgetAPI(budgetData);
            return result;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to assign budget');
        }
    }
);

export const updateCCBudget = createAsyncThunk(
    'ccBudget/update',
    async ({ id, action, remarks }, { rejectWithValue }) => {
        try {
            const result = await updateCCBudgetAPI(id, action, remarks);
            if (!result) {
                throw new Error('No response from update API');
            }
            return result;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update budget');
        }
    }
);

const ccBudgetSlice = createSlice({
    name: 'ccBudget',
    initialState: {
        verificationBudgets: [],
        loading: false,
        error: null,
        assignmentSuccess: false,
        initialLoadComplete: false, // New state to track initial load
    },
    reducers: {
        resetAssignmentSuccess: (state) => {
            state.assignmentSuccess = false;
        },
        resetError: (state) => {
            state.error = null;
        },
        resetState: (state) => {
            state.verificationBudgets = [];
            state.loading = false;
            state.error = null;
            state.assignmentSuccess = false;
            state.initialLoadComplete = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch cases
            .addCase(fetchCCBudgetForVerification.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCCBudgetForVerification.fulfilled, (state, action) => {
                state.loading = false;
                state.verificationBudgets = action.payload.ccBudgets;
                state.error = null;
                state.initialLoadComplete = true; // Mark initial load as complete
            })
            .addCase(fetchCCBudgetForVerification.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
                state.initialLoadComplete = true; // Mark as complete even on error
            })
            // Assign cases
            .addCase(assignCCBudget.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.assignmentSuccess = false;
            })
            .addCase(assignCCBudget.fulfilled, (state) => {
                state.loading = false;
                state.assignmentSuccess = true;
                state.error = null;
            })
            .addCase(assignCCBudget.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
                state.assignmentSuccess = false;
            })
            // Update cases
            .addCase(updateCCBudget.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCCBudget.fulfilled, (state, action) => {
                state.loading = false;
                state.verificationBudgets = state.verificationBudgets.filter(
                    budget => budget._id !== action.payload._id
                );
                state.error = null;
            })
            .addCase(updateCCBudget.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    }
});

export const { resetAssignmentSuccess, resetError, resetState } = ccBudgetSlice.actions;

export default ccBudgetSlice.reducer;