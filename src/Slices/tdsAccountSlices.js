import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    createTdsAccount,
    checkTdsAccountExists,
    fetchTdsAccountsForVerification,
    updateTdsAccountStatus,
    rejectTdsAccount,
    getAllTdsAccounts
} from '../api/tdsAccountAPI';

export const createNewTdsAccount = createAsyncThunk(
    'tds/createNewTdsAccount',
    async (tdsAccountData, { rejectWithValue }) => {
        try {
            const response = await createTdsAccount(tdsAccountData);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const checkTdsAccountUniqueness = createAsyncThunk(
    'tds/checkAccountUniqueness',
    async (tdsAccountName, { rejectWithValue }) => {
        try {
            const response = await checkTdsAccountExists(tdsAccountName);
            return !response.exists; // Return true if the account doesn't exist
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchVerificationTdsAccounts = createAsyncThunk(
    'tds/fetchForVerification',
    async (userRoleId, { rejectWithValue }) => {
        try {
            const response = await fetchTdsAccountsForVerification(userRoleId);
            return response.tdsAccounts;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const updateTdsAccount = createAsyncThunk(
    'tds/updateStatus',
    async ({ id, updateData }, { rejectWithValue }) => {
        try {
            const response = await updateTdsAccountStatus(id, updateData);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const rejectTdsAccountThunk = createAsyncThunk(
    'tds/reject',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await rejectTdsAccount(id, remarks);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchAllTdsAccounts = createAsyncThunk(
    'tds/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllTdsAccounts();
            return response.tdsAccounts;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

const tdsSlice = createSlice({
    name: 'tds',
    initialState: {
        tdsAccounts: [],
        accountsForVerification: [],
        currentTdsAccount: null,
        isTdsAccountUnique: null,
        loading: false,
        error: null,
        success: false,
        rejectSuccess: false,
        updateSuccess: false
    },
    reducers: {
        resetTdsAccountState: (state) => {
            state.currentTdsAccount = null;
            state.isTdsAccountUnique = null;
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
            // Create TDS Account
            .addCase(createNewTdsAccount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createNewTdsAccount.fulfilled, (state, action) => {
                state.loading = false;
                state.tdsAccounts.push(action.payload);
                state.currentTdsAccount = action.payload;
                state.success = true;
            })
            .addCase(createNewTdsAccount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Check Account Name Uniqueness
            .addCase(checkTdsAccountUniqueness.fulfilled, (state, action) => {
                state.loading = false;
                state.isTdsAccountUnique = action.payload;
            })
            .addCase(checkTdsAccountUniqueness.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch TDS Accounts for Verification
            .addCase(fetchVerificationTdsAccounts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVerificationTdsAccounts.fulfilled, (state, action) => {
                state.loading = false;
                state.accountsForVerification = action.payload;
            })
            .addCase(fetchVerificationTdsAccounts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update TDS Account Status
            .addCase(updateTdsAccount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateTdsAccount.fulfilled, (state, action) => {
                state.loading = false;
                state.updateSuccess = true;
                state.accountsForVerification = state.accountsForVerification.filter(
                    account => account._id !== action.payload._id
                );
            })
            .addCase(updateTdsAccount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Reject TDS Account
            .addCase(rejectTdsAccountThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectTdsAccountThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.rejectSuccess = true;
                const index = state.accountsForVerification.findIndex(
                    account => account._id === action.payload._id
                );
                if (index !== -1) {
                    state.accountsForVerification.splice(index, 1);
                }
            })
            .addCase(rejectTdsAccountThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch All TDS Accounts
            .addCase(fetchAllTdsAccounts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllTdsAccounts.fulfilled, (state, action) => {
                state.loading = false;
                state.tdsAccounts = action.payload;
            })
            .addCase(fetchAllTdsAccounts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { 
    resetTdsAccountState, 
    resetRejectSuccess, 
    resetUpdateSuccess 
} = tdsSlice.actions;

export default tdsSlice.reducer;