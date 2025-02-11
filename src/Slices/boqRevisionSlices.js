// src/redux/slices/boqRevisionSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    updateBOQRates,
    fetchBOQsForRevisionVerification,
    verifyBOQRevision,
    rejectBOQRevision,
    fetchPreviousRates,
    fetchRateHistory
} from '../api/clientBoqRevisionAPI';

// Update BOQ rates
export const updateBOQRatesThunk = createAsyncThunk(
    'boqRevision/updateRates',
    async ({ id, updateData }, { rejectWithValue }) => {
        try {
            console.log('Updating BOQ rates:', { id, updateData });
            const response = await updateBOQRates(id, updateData);
            return response;
        } catch (error) {
            console.error('Update rates error:', error);
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Fetch BOQs for revision verification
export const fetchBOQsForRevisionVerificationThunk = createAsyncThunk(
    'boqRevision/fetchForVerification',
    async (userRoleId, { rejectWithValue }) => {
        try {
            const response = await fetchBOQsForRevisionVerification(userRoleId);
            return response.boqs;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Verify BOQ revision
export const verifyBOQRevisionThunk = createAsyncThunk(
    'boqRevision/verify',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            console.log('Verifying BOQ revision:', { id, remarks });
            const response = await verifyBOQRevision(id, remarks);
            return { ...response.boq, _id: id };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Reject BOQ revision
export const rejectBOQRevisionThunk = createAsyncThunk(
    'boqRevision/reject',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            console.log('Rejecting BOQ revision:', { id, remarks });
            const response = await rejectBOQRevision(id, remarks);
            return { ...response.boq, _id: id };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchPreviousRatesThunk = createAsyncThunk(
    'boqRevision/fetchPreviousRates',
    async (boqId, { rejectWithValue }) => {
        try {
            const response = await fetchPreviousRates(boqId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchRateHistoryThunk = createAsyncThunk(
    'boqRevision/fetchRateHistory',
    async (boqId, { rejectWithValue }) => {
        try {
            const response = await fetchRateHistory(boqId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);


const boqRevisionSlice = createSlice({
    name: 'boqRevision',
    initialState: {
        revisedBOQs: [],
        boqsForRevisionVerification: [],
        currentRevision: null,
        loading: false,
        error: null,
        updateSuccess: false,
        verifySuccess: false,
        rejectSuccess: false,
        previousRates: [],
        rateHistoryLoading: false,
        rateHistoryError: null,
        rateHistorySummary: null,
        rateHistory: [],

    },
    reducers: {
        resetRevisionState: (state) => {
            state.currentRevision = null;
            state.loading = false;
            state.error = null;
        },
        resetUpdateSuccess: (state) => {
            state.updateSuccess = false;
        },
        resetVerifySuccess: (state) => {
            state.verifySuccess = false;
        },
        resetRejectSuccess: (state) => {
            state.rejectSuccess = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Update BOQ Rates
            .addCase(updateBOQRatesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBOQRatesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.updateSuccess = true;
                state.currentRevision = action.payload.boq;
                state.revisedBOQs = state.revisedBOQs.map(boq => 
                    boq._id === action.payload.boq._id ? action.payload.boq : boq
                );
            })
            .addCase(updateBOQRatesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch BOQs for Revision Verification
            .addCase(fetchBOQsForRevisionVerificationThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBOQsForRevisionVerificationThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.boqsForRevisionVerification = action.payload;
            })
            .addCase(fetchBOQsForRevisionVerificationThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Verify BOQ Revision
            .addCase(verifyBOQRevisionThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyBOQRevisionThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.verifySuccess = true;
                state.boqsForRevisionVerification = state.boqsForRevisionVerification.filter(
                    boq => boq._id !== action.payload._id
                );
            })
            .addCase(verifyBOQRevisionThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Reject BOQ Revision
            .addCase(rejectBOQRevisionThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectBOQRevisionThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.rejectSuccess = true;
                state.boqsForRevisionVerification = state.boqsForRevisionVerification.filter(
                    boq => boq._id !== action.payload._id
                );
            })
            .addCase(rejectBOQRevisionThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchPreviousRatesThunk.pending, (state) => {
                state.rateHistoryLoading = true;
                state.rateHistoryError = null;
            })
            .addCase(fetchPreviousRatesThunk.fulfilled, (state, action) => {
                state.rateHistoryLoading = false;
                state.previousRates = action.payload;
            })
            .addCase(fetchPreviousRatesThunk.rejected, (state, action) => {
                state.rateHistoryLoading = false;
                state.rateHistoryError = action.payload;
            })
              // Rate History
            .addCase(fetchRateHistoryThunk.pending, (state) => {
            state.rateHistoryLoading = true;
            state.rateHistoryError = null;
            })
            .addCase(fetchRateHistoryThunk.fulfilled, (state, action) => {
            state.rateHistoryLoading = false;
            state.rateHistory = action.payload;
            state.rateHistorySummary = action.payload.summary;
            })
            .addCase(fetchRateHistoryThunk.rejected, (state, action) => {
            state.rateHistoryLoading = false;
            state.rateHistoryError = action.payload;
            });
    }
});

export const {
    resetRevisionState,
    resetUpdateSuccess,
    resetVerifySuccess,
    resetRejectSuccess
} = boqRevisionSlice.actions;

export default boqRevisionSlice.reducer;