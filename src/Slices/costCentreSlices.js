import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    createCostCentre,
    checkCCNoExists,
    fetchCostCentresForVerification,
    updateCostCentreStatus,
    rejectCostCentre,
    getAllCostCentres,
    getEligibleCCForBudgetAssign
} from '../api/ccDataAPI';


export const fetchEligibleCCForBudget = createAsyncThunk(
    'costCentres/fetchEligibleForBudget',
    async ({ ccid, subId, fiscalYear }, { rejectWithValue }) => {
        try {
            const response = await getEligibleCCForBudgetAssign(ccid, subId, fiscalYear);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch eligible cost centers');
        }
    }
);

export const createNewCostCentre = createAsyncThunk(
    'costCentres/createNewCostCentre',
    async (costCentreData, { rejectWithValue }) => {
        try {
            const response = await createCostCentre(costCentreData);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const checkCostCentreNumberUniqueness = createAsyncThunk(
    'costCentres/checkNumberUniqueness',
    async (ccNo, { rejectWithValue }) => {
        try {
            const response = await checkCCNoExists(ccNo);
            return !response.exists; // Return true if the number doesn't exist (is unique)
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchVerificationCostCentres = createAsyncThunk(
    'costCentres/fetchForVerification',
    async (userRoleId, { rejectWithValue }) => {
        try {
            const response = await fetchCostCentresForVerification(userRoleId);
            return response.costCentres;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const updateCostCentre = createAsyncThunk(
    'costCentres/updateStatus',
    async ({ id, updateData }, { rejectWithValue }) => {
        try {
            const response = await updateCostCentreStatus(id, updateData);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const rejectCostCentreThunk = createAsyncThunk(
    'costCentres/reject',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await rejectCostCentre(id, remarks);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchAllCCdata = createAsyncThunk(
    'costCentres/fetchAllCCdata',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllCostCentres();
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

const costCentreSlice = createSlice({
    name: 'costCentres',
    initialState: {
        allCostCentreData: [],
        eligibleCostCentres: [], 
        costCentresForVerification: [],
        currentCostCentre: null,
        isCostCentreNumberUnique: null,
        loading: false,
        eligibleCCLoading: false,
        error: null,
        eligibleCCError: null,
        success: false,
        rejectSuccess: false,
        updateSuccess: false,
        status: 'idle'
    },
    reducers: {
        resetCostCentreState: (state) => {
            state.currentCostCentre = null;
            state.isCostCentreNumberUnique = null;
            state.loading = false;
            state.success = false;
            state.error = null;
        },
        resetRejectSuccess: (state) => {
            state.rejectSuccess = false;
        },
        resetUpdateSuccess: (state) => {
            state.updateSuccess = false;
        },
        resetEligibleCC: (state) => {
            state.eligibleCostCentres = [];
            state.eligibleCCError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createNewCostCentre.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createNewCostCentre.fulfilled, (state, action) => {
                state.loading = false;
                state.allCostCentreData.push(action.payload);
                state.currentCostCentre = action.payload;
                state.success = true;
            })
            .addCase(createNewCostCentre.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(checkCostCentreNumberUniqueness.fulfilled, (state, action) => {
                state.isCostCentreNumberUnique = action.payload;
            })
            .addCase(fetchVerificationCostCentres.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVerificationCostCentres.fulfilled, (state, action) => {
                state.loading = false;
                state.costCentresForVerification = action.payload;
            })
            .addCase(fetchVerificationCostCentres.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateCostCentre.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCostCentre.fulfilled, (state, action) => {
                state.loading = false;
                state.updateSuccess = true;
                state.costCentresForVerification = state.costCentresForVerification.filter(cc => cc._id !== action.payload._id);
            })
            .addCase(updateCostCentre.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(rejectCostCentreThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectCostCentreThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.rejectSuccess = true;
                state.costCentresForVerification = state.costCentresForVerification.filter(cc => cc._id !== action.payload._id);
            })
            .addCase(rejectCostCentreThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchAllCCdata.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllCCdata.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.allCostCentreData = action.payload;
            })
            .addCase(fetchAllCCdata.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(fetchEligibleCCForBudget.pending, (state) => {
                state.eligibleCCLoading = true;
                state.eligibleCCError = null;
            })
            .addCase(fetchEligibleCCForBudget.fulfilled, (state, action) => {
                state.eligibleCCLoading = false;
                state.eligibleCostCentres = action.payload;
            })
            .addCase(fetchEligibleCCForBudget.rejected, (state, action) => {
                state.eligibleCCLoading = false;
                state.eligibleCCError = action.payload;
            });
    }
});

export const { resetCostCentreState, resetRejectSuccess, resetUpdateSuccess ,} = costCentreSlice.actions;
export default costCentreSlice.reducer;