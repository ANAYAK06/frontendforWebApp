import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    createFixedDeposit,
    checkFDAccountExists,
    fetchFDsForVerification,
    updateFixedDepositStatus,
    rejectFixedDeposit,
    getAllFixedDeposits
} from '../api/fixedDepositAPI';

export const createNewFixedDeposit = createAsyncThunk(
    'fixedDeposit/createNewFixedDeposit',
    async (fixedDepositData, { rejectWithValue }) => {
        try {
            const response = await createFixedDeposit(fixedDepositData);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const checkFDAccountUniqueness = createAsyncThunk(
    'fixedDeposit/checkAccountUniqueness',
    async (accountNumber, { rejectWithValue }) => {
        try {
            const response = await checkFDAccountExists(accountNumber);
            return !response.exists; // Return true if the account doesn't exist (is unique)
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchVerificationFDs = createAsyncThunk(
    'fixedDeposit/fetchForVerification',
    async (userRoleId, { rejectWithValue }) => {
        try {
            const response = await fetchFDsForVerification(userRoleId);
            return response.fixedDeposits;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const updateFixedDeposit = createAsyncThunk(
    'fixedDeposit/updateStatus',
    async ({ id, updateData }, { rejectWithValue }) => {
        try {
            const response = await updateFixedDepositStatus(id, updateData);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const rejectFixedDepositThunk = createAsyncThunk(
    'fixedDeposit/reject',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await rejectFixedDeposit(id, remarks);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchAllFixedDeposits = createAsyncThunk(
    'fixedDeposit/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllFixedDeposits();
            return response.fixedDeposits;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

const fixedDepositSlice = createSlice({
    name: 'fixedDeposit',
    initialState: {
        fixedDeposits: [],
        fdsForVerification: [],
        currentFixedDeposit: null,
        isFDAccountUnique: null,
        loading: false,
        error: null,
        success: false,
        rejectSuccess: false,
        updateSuccess: false
    },
    reducers: {
        resetFDState: (state) => {
            state.currentFixedDeposit = null;
            state.isFDAccountUnique = null;
            state.loading = false;
            state.success = false;
            state.error = null;
        },
        resetRejectSuccess: (state) => {
            state.rejectSuccess = false;
        },
        resetUpdateSuccess: (state) => {
            state.updateSuccess = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Fixed Deposit
            .addCase(createNewFixedDeposit.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createNewFixedDeposit.fulfilled, (state, action) => {
                state.loading = false;
                state.fixedDeposits.push(action.payload);
                state.currentFixedDeposit = action.payload;
                state.success = true;
            })
            .addCase(createNewFixedDeposit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Check Account Number Uniqueness
            .addCase(checkFDAccountUniqueness.fulfilled, (state, action) => {
                state.loading = false;
                state.isFDAccountUnique = action.payload;
            })
            .addCase(checkFDAccountUniqueness.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch FDs for Verification
            .addCase(fetchVerificationFDs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVerificationFDs.fulfilled, (state, action) => {
                state.loading = false;
                state.fdsForVerification = action.payload;
            })
            .addCase(fetchVerificationFDs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Fixed Deposit Status
            .addCase(updateFixedDeposit.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateFixedDeposit.fulfilled, (state, action) => {
                state.loading = false;
                state.updateSuccess = true;
                state.fdsForVerification = state.fdsForVerification.filter(
                    fd => fd._id !== action.payload._id
                );
            })
            .addCase(updateFixedDeposit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Reject Fixed Deposit
            .addCase(rejectFixedDepositThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectFixedDepositThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.rejectSuccess = true;
                const index = state.fdsForVerification.findIndex(
                    fd => fd._id === action.payload._id
                );
                if (index !== -1) {
                    state.fdsForVerification.splice(index, 1);
                }
            })
            .addCase(rejectFixedDepositThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch All Fixed Deposits
            .addCase(fetchAllFixedDeposits.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllFixedDeposits.fulfilled, (state, action) => {
                state.loading = false;
                state.fixedDeposits = action.payload;
            })
            .addCase(fetchAllFixedDeposits.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { 
    resetFDState, 
    resetRejectSuccess, 
    resetUpdateSuccess 
} = fixedDepositSlice.actions;

export default fixedDepositSlice.reducer;