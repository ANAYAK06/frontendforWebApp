import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    createTenderStatus,
    fetchTenderStatusForVerification,
    updateTenderStatus,
    rejectTenderStatus
} from '../api/ProjectModuleAPI/tenderFinalStatusAPI';

// Async Thunk Actions
export const createTenderStatusThunk = createAsyncThunk(
    'tenderStatus/create',
    async ({ boqId, tenderStatus, details, remarks }, { rejectWithValue }) => {
        try {
            
            const response = await createTenderStatus(boqId, tenderStatus, details, remarks);
            return response.tenderStatus;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.message || 
                'Failed to create tender status'
            );
        }
    }
);

export const fetchTenderStatusForVerificationThunk = createAsyncThunk(
    'tenderStatus/fetchForVerification',
    async (userRoleId, { rejectWithValue }) => {
        try {
            const response = await fetchTenderStatusForVerification(userRoleId);
            return response.tenderStatuses;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.message || 
                'Failed to fetch tender statuses'
            );
        }
    }
);

export const updateTenderStatusThunk = createAsyncThunk(
    'tenderStatus/update',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await updateTenderStatus(id, remarks);
            return { ...response.tenderStatus, _id: id };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.message || 
                'Failed to update tender status'
            );
        }
    }
);

export const rejectTenderStatusThunk = createAsyncThunk(
    'tenderStatus/reject',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await rejectTenderStatus(id, remarks);
            return { ...response.tenderStatus, _id: id };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.message || 
                'Failed to reject tender status'
            );
        }
    }
);

// Initial State
const initialState = {
    tenderStatuses: [],
    statusesForVerification: [],
    currentStatus: null,
    loading: false,
    error: null,
    successMessage: null,
    createSuccess: false,
    updateSuccess: false,
    rejectSuccess: false,
    lastAction: null // Tracks the last successful action for better UI handling
};

// Slice
const tenderStatusSlice = createSlice({
    name: 'tenderStatus',
    initialState,
    reducers: {
        // Reset all state
        resetTenderState: (state) => {
            return { ...initialState };
        },
        // Reset specific flags
        resetSuccess: (state) => {
            state.createSuccess = false;
            state.updateSuccess = false;
            state.rejectSuccess = false;
            state.successMessage = null;
            state.lastAction = null;
        },
        // Reset error state
        resetError: (state) => {
            state.error = null;
        },
        // Clear current status
        clearCurrentStatus: (state) => {
            state.currentStatus = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Tender Status
            .addCase(createTenderStatusThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTenderStatusThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.createSuccess = true;
                state.currentStatus = action.payload;
                state.tenderStatuses.push(action.payload);
                state.successMessage = 'Tender status created successfully';
                state.lastAction = 'create';
            })
            .addCase(createTenderStatusThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Tender Statuses for Verification
            .addCase(fetchTenderStatusForVerificationThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTenderStatusForVerificationThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.statusesForVerification = action.payload;
            })
            .addCase(fetchTenderStatusForVerificationThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Tender Status
            .addCase(updateTenderStatusThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateTenderStatusThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.updateSuccess = true;
                state.statusesForVerification = state.statusesForVerification.filter(
                    status => status._id !== action.payload._id
                );
                state.successMessage = 'Tender status updated successfully';
                state.lastAction = 'update';
            })
            .addCase(updateTenderStatusThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Reject Tender Status
            .addCase(rejectTenderStatusThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectTenderStatusThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.rejectSuccess = true;
                state.statusesForVerification = state.statusesForVerification.filter(
                    status => status._id !== action.payload._id
                );
                state.successMessage = 'Tender status rejected successfully';
                state.lastAction = 'reject';
            })
            .addCase(rejectTenderStatusThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

// Export actions
export const {
    resetTenderState,
    resetSuccess,
    resetError,
    clearCurrentStatus
} = tenderStatusSlice.actions;

// Export reducer
export default tenderStatusSlice.reducer;