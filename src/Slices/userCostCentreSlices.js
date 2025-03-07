import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userCostCentreAPI from '../api/userCostCentreAPI';

// Fetch all assigned cost centres
export const fetchUserCostCentresThunk = createAsyncThunk(
    'userCostCentre/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await userCostCentreAPI.fetchUserCostCentres();
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Fetch users with cost centre applicable but not yet assigned
export const fetchUsersWithCostCentreApplicableThunk = createAsyncThunk(
    'userCostCentre/fetchApplicableUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await userCostCentreAPI.fetchUsersWithCostCentreApplicable();
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Get unassigned cost centres for a specific user
export const fetchUnassignedCostCentresThunk = createAsyncThunk(
    'userCostCentre/fetchUnassigned',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await userCostCentreAPI.fetchUnassignedCostCentres(userId);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Assign cost centres to a user
export const assignCostCentreThunk = createAsyncThunk(
    'userCostCentre/assign',
    async (data, { rejectWithValue }) => {
        try {
            const response = await userCostCentreAPI.assignCostCentre(data);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Update cost centres for a user (add/remove)
export const updateUserCostCentresThunk = createAsyncThunk(
    'userCostCentre/update',
    async (data, { rejectWithValue }) => {
        try {
            const response = await userCostCentreAPI.updateUserCostCentres(data);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Delete all cost centres for a user
export const deleteUserCostCentresThunk = createAsyncThunk(
    'userCostCentre/delete',
    async (data, { rejectWithValue }) => {
        try {
            const response = await userCostCentreAPI.deleteUserCostCentres(data);
            return { ...response, userId: data.userId };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    // Data states
    assignedCostCentres: [],
    applicableUsers: [],
    unassignedCostCentres: [],
    
    // Loading states
    loading: {
        fetchAll: false,
        fetchApplicableUsers: false,
        fetchUnassigned: false,
        assign: false,
        update: false,
        delete: false
    },
    
    // Error states
    errors: {
        fetchAll: null,
        fetchApplicableUsers: null,
        fetchUnassigned: null,
        assign: null,
        update: null,
        delete: null
    },
    
    // Success states
    success: {
        assign: false,
        update: false,
        delete: false
    }
};

const userCostCentreSlice = createSlice({
    name: 'userCostCentre',
    initialState,
    reducers: {
        // Reset entire state
        resetUserCostCentreState: () => initialState,
        
        // Reset all errors
        clearErrors: (state) => {
            state.errors = initialState.errors;
        },
        
        // Reset all success flags
        clearSuccess: (state) => {
            state.success = initialState.success;
        },
        
        // Reset specific states
        clearOperationState: (state, action) => {
            const operation = action.payload;
            if (operation) {
                state.loading[operation] = false;
                state.errors[operation] = null;
                if (state.success[operation] !== undefined) {
                    state.success[operation] = false;
                }
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch all assigned cost centres
            .addCase(fetchUserCostCentresThunk.pending, (state) => {
                state.loading.fetchAll = true;
                state.errors.fetchAll = null;
            })
            .addCase(fetchUserCostCentresThunk.fulfilled, (state, action) => {
                state.loading.fetchAll = false;
                state.assignedCostCentres = action.payload;
            })
            .addCase(fetchUserCostCentresThunk.rejected, (state, action) => {
                state.loading.fetchAll = false;
                state.errors.fetchAll = action.payload;
            })

            // Fetch users with cost centre applicable
            .addCase(fetchUsersWithCostCentreApplicableThunk.pending, (state) => {
                state.loading.fetchApplicableUsers = true;
                state.errors.fetchApplicableUsers = null;
            })
            .addCase(fetchUsersWithCostCentreApplicableThunk.fulfilled, (state, action) => {
                state.loading.fetchApplicableUsers = false;
                state.applicableUsers = action.payload;
            })
            .addCase(fetchUsersWithCostCentreApplicableThunk.rejected, (state, action) => {
                state.loading.fetchApplicableUsers = false;
                state.errors.fetchApplicableUsers = action.payload;
            })

            // Fetch unassigned cost centres
            .addCase(fetchUnassignedCostCentresThunk.pending, (state) => {
                state.loading.fetchUnassigned = true;
                state.errors.fetchUnassigned = null;
            })
            .addCase(fetchUnassignedCostCentresThunk.fulfilled, (state, action) => {
                state.loading.fetchUnassigned = false;
                state.unassignedCostCentres = action.payload;
            })
            .addCase(fetchUnassignedCostCentresThunk.rejected, (state, action) => {
                state.loading.fetchUnassigned = false;
                state.errors.fetchUnassigned = action.payload;
            })

            // Assign cost centre
            .addCase(assignCostCentreThunk.pending, (state) => {
                state.loading.assign = true;
                state.errors.assign = null;
                state.success.assign = false;
            })
            .addCase(assignCostCentreThunk.fulfilled, (state) => {
                state.loading.assign = false;
                state.success.assign = true;
                // We'll fetch the updated list rather than trying to update the state directly
            })
            .addCase(assignCostCentreThunk.rejected, (state, action) => {
                state.loading.assign = false;
                state.errors.assign = action.payload;
                state.success.assign = false;
            })

            // Update cost centre
            .addCase(updateUserCostCentresThunk.pending, (state) => {
                state.loading.update = true;
                state.errors.update = null;
                state.success.update = false;
            })
            .addCase(updateUserCostCentresThunk.fulfilled, (state) => {
                state.loading.update = false;
                state.success.update = true;
                // We'll fetch the updated list rather than trying to update the state directly
            })
            .addCase(updateUserCostCentresThunk.rejected, (state, action) => {
                state.loading.update = false;
                state.errors.update = action.payload;
                state.success.update = false;
            })

            // Delete cost centre
            .addCase(deleteUserCostCentresThunk.pending, (state) => {
                state.loading.delete = true;
                state.errors.delete = null;
                state.success.delete = false;
            })
            .addCase(deleteUserCostCentresThunk.fulfilled, (state, action) => {
                state.loading.delete = false;
                state.success.delete = true;
                // Update assignedCostCentres by removing entries for the deleted userId
                if (action.payload.userId) {
                    state.assignedCostCentres = state.assignedCostCentres.filter(
                        item => item.userId !== action.payload.userId
                    );
                }
            })
            .addCase(deleteUserCostCentresThunk.rejected, (state, action) => {
                state.loading.delete = false;
                state.errors.delete = action.payload;
                state.success.delete = false;
            })
    }
});

export const {
    resetUserCostCentreState,
    clearErrors,
    clearSuccess,
    clearOperationState
} = userCostCentreSlice.actions;

export default userCostCentreSlice.reducer;