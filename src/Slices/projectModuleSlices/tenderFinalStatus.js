import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as tenderStatusAPI from '../../api/ProjectModuleAPI/tenderFinalStatusAPI';

// Async thunks
export const fetchTendersForFinalStatus = createAsyncThunk(
    'tenderStatus/fetchTendersForFinalStatus',
    async (_, { rejectWithValue }) => {
        try {
            const response = await tenderStatusAPI.getTenderForFinalStatus();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch tenders');
        }
    }
);

export const createTenderStatus = createAsyncThunk(
    'tenderStatus/create',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await tenderStatusAPI.createTenderStatus(formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create tender status');
        }
    }
);

export const fetchTenderStatusForVerification = createAsyncThunk(
    'tenderStatus/fetchForVerification',
    async (userRoleId, { rejectWithValue }) => {
        try {
            const response = await tenderStatusAPI.fetchTenderStatusForVerification(userRoleId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch tender statuses');
        }
    }
);

export const updateTenderStatus = createAsyncThunk(
    'tenderStatus/update',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await tenderStatusAPI.updateTenderStatus(id, remarks);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update tender status');
        }
    }
);

export const rejectTenderStatus = createAsyncThunk(
    'tenderStatus/reject',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await tenderStatusAPI.rejectTenderStatus(id, remarks);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to reject tender status');
        }
    }
);

const initialState = {
    tendersForFinalStatus: [],
    tenderStatusesForVerification: [],
    selectedTenderStatus: null,
    loading: {
        fetchTenders: false,
        create: false,
        fetchVerification: false,
        update: false,
        reject: false
    },
    error: {
        fetchTenders: null,
        create: null,
        fetchVerification: null,
        update: null,
        reject: null
    },
    success: {
        create: false,
        update: false,
        reject: false
    }
};

const tenderStatusSlice = createSlice({
    name: 'tenderStatus',
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = initialState.error;
        },
        clearSuccess: (state) => {
            state.success = initialState.success;
        },
        setSelectedTenderStatus: (state, action) => {
            state.selectedTenderStatus = action.payload;
        }
    },
    extraReducers: (builder) => {
        // Fetch tenders for final status
        builder
            .addCase(fetchTendersForFinalStatus.pending, (state) => {
                state.loading.fetchTenders = true;
                state.error.fetchTenders = null;
            })
            .addCase(fetchTendersForFinalStatus.fulfilled, (state, action) => {
                state.loading.fetchTenders = false;
                state.tendersForFinalStatus = action.payload;
            })
            .addCase(fetchTendersForFinalStatus.rejected, (state, action) => {
                state.loading.fetchTenders = false;
                state.error.fetchTenders = action.payload;
            })

        // Create tender status
            .addCase(createTenderStatus.pending, (state) => {
                state.loading.create = true;
                state.error.create = null;
                state.success.create = false;
            })
            .addCase(createTenderStatus.fulfilled, (state, action) => {
                state.loading.create = false;
                state.success.create = true;
                state.tendersForFinalStatus = state.tendersForFinalStatus.filter(
                    tender => tender._id !== action.payload.boq
                );
            })
            .addCase(createTenderStatus.rejected, (state, action) => {
                state.loading.create = false;
                state.error.create = action.payload;
                state.success.create = false;
            })

        // Fetch for verification
            .addCase(fetchTenderStatusForVerification.pending, (state) => {
                state.loading.fetchVerification = true;
                state.error.fetchVerification = null;
            })
            .addCase(fetchTenderStatusForVerification.fulfilled, (state, action) => {
                state.loading.fetchVerification = false;
                state.tenderStatusesForVerification = action.payload;
            })
            .addCase(fetchTenderStatusForVerification.rejected, (state, action) => {
                state.loading.fetchVerification = false;
                state.error.fetchVerification = action.payload;
            })

        // Update tender status
            .addCase(updateTenderStatus.pending, (state) => {
                state.loading.update = true;
                state.error.update = null;
                state.success.update = false;
            })
            .addCase(updateTenderStatus.fulfilled, (state, action) => {
                state.loading.update = false;
                state.success.update = true;
                state.tenderStatusesForVerification = state.tenderStatusesForVerification.filter(
                    status => status._id !== action.payload._id
                );
            })
            .addCase(updateTenderStatus.rejected, (state, action) => {
                state.loading.update = false;
                state.error.update = action.payload;
                state.success.update = false;
            })

        // Reject tender status
            .addCase(rejectTenderStatus.pending, (state) => {
                state.loading.reject = true;
                state.error.reject = null;
                state.success.reject = false;
            })
            .addCase(rejectTenderStatus.fulfilled, (state, action) => {
                state.loading.reject = false;
                state.success.reject = true;
                state.tenderStatusesForVerification = state.tenderStatusesForVerification.filter(
                    status => status._id !== action.payload._id
                );
            })
            .addCase(rejectTenderStatus.rejected, (state, action) => {
                state.loading.reject = false;
                state.error.reject = action.payload;
                state.success.reject = false;
            });
    }
});

export const { clearErrors, clearSuccess, setSelectedTenderStatus } = tenderStatusSlice.actions;
export default tenderStatusSlice.reducer;