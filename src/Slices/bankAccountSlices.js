import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    createBankAccount,
    checkBankAccountExists,
    fetchBankAccountsForVerification,
    updateBankAccountStatus,
    rejectBankAccount,
    getAllBankAccounts
} from '../api/bankAccountAPI';

export const createNewBankAccount = createAsyncThunk(
    'bankAccount/createNewBankAccount',
    async (bankAccountData, { rejectWithValue }) => {
        try {
            const response = await createBankAccount(bankAccountData);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const checkBankAccountUniqueness = createAsyncThunk(
    'bankAccount/checkAccountUniqueness',
    async (accountNumber, { rejectWithValue }) => {
        try {
            const response = await checkBankAccountExists(accountNumber);
            return !response.exists; // Return true if the account doesn't exist (is unique)
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchVerificationBankAccounts = createAsyncThunk(
    'bankAccount/fetchForVerification',
    async (userRoleId, { rejectWithValue }) => {
        try {
            const response = await fetchBankAccountsForVerification(userRoleId);
            return response.bankAccounts;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const updateBankAccount = createAsyncThunk(
    'bankAccount/updateStatus',
    async ({ id, updateData }, { rejectWithValue }) => {
        try {
            const response = await updateBankAccountStatus(id, updateData);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const rejectBankAccountThunk = createAsyncThunk(
    'bankAccount/reject',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await rejectBankAccount(id, remarks);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);
export const fetchAllBankAccounts = createAsyncThunk(
    'bankAccount/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllBankAccounts();
            return response.bankAccounts;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

const bankAccountSlice = createSlice({
    name: 'bankAccount',
    initialState: {
        bankAccounts: [],
        accountsForVerification: [],
        currentBankAccount: null,
        isBankAccountUnique: null,
        loading: false,
        error: null,
        success: false,
        rejectSuccess: false,
        updateSuccess: false
    },
    reducers: {
        resetBankAccountState: (state) => {
            state.currentBankAccount = null;
            state.isBankAccountUnique = null;
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
            // Create Bank Account
            .addCase(createNewBankAccount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createNewBankAccount.fulfilled, (state, action) => {
                state.loading = false;
                state.bankAccounts.push(action.payload);
                state.currentBankAccount = action.payload;
                state.success = true;
            })
            .addCase(createNewBankAccount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Check Account Number Uniqueness
            .addCase(checkBankAccountUniqueness.fulfilled, (state, action) => {
                state.loading = false;
                state.isBankAccountUnique = action.payload;
            })
            .addCase(checkBankAccountUniqueness.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Bank Accounts for Verification
            .addCase(fetchVerificationBankAccounts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVerificationBankAccounts.fulfilled, (state, action) => {
                state.loading = false;
                state.accountsForVerification = action.payload;
            })
            .addCase(fetchVerificationBankAccounts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Bank Account Status
            .addCase(updateBankAccount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBankAccount.fulfilled, (state, action) => {
                state.loading = false;
                state.updateSuccess = true;
                state.accountsForVerification = state.accountsForVerification.filter(
                    account => account._id !== action.payload._id
                );
            })
            .addCase(updateBankAccount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Reject Bank Account
            .addCase(rejectBankAccountThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectBankAccountThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.rejectSuccess = true;
                const index = state.accountsForVerification.findIndex(
                    account => account._id === action.payload._id
                );
                if (index !== -1) {
                    state.accountsForVerification.splice(index, 1); // Remove the rejected account
                }
            })
            .addCase(rejectBankAccountThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchAllBankAccounts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllBankAccounts.fulfilled, (state, action) => {
                state.loading = false;
                state.bankAccounts = action.payload;
            })
            .addCase(fetchAllBankAccounts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { 
    resetBankAccountState, 
    resetRejectSuccess, 
    resetUpdateSuccess 
} = bankAccountSlice.actions;

export default bankAccountSlice.reducer;