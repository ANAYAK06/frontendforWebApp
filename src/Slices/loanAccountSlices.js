import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    createLoan,
    checkLoanNumberExists,
    fetchLoansForVerification,
    updateLoanStatus,
    rejectLoan,
    getLoanSchedule,
    getLoanSummary
} from '../api/loanAccountAPI';

// Async Thunks
export const createNewLoan = createAsyncThunk(
    'loan/createNewLoan',
    async (loanData, { rejectWithValue }) => {
        try {
            const response = await createLoan(loanData);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const checkLoanNumberUniqueness = createAsyncThunk(
    'loan/checkLoanNumberUniqueness',
    async (loanNumber, { rejectWithValue }) => {
        try {
            const response = await checkLoanNumberExists(loanNumber);
            return !response.exists;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchVerificationLoans = createAsyncThunk(
    'loan/fetchForVerification',
    async (userRoleId, { rejectWithValue }) => {
        try {
            const response = await fetchLoansForVerification(userRoleId);
            return response.loans;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const updateLoanThunk = createAsyncThunk(
    'loan/updateStatus',
    async ({ id, updateData }, { rejectWithValue }) => {
        try {
            const response = await updateLoanStatus(id, updateData);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const rejectLoanThunk = createAsyncThunk(
    'loan/reject',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await rejectLoan(id, remarks);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchLoanSchedule = createAsyncThunk(
    'loan/fetchSchedule',
    async (loanId, { rejectWithValue }) => {
        try {
            const response = await getLoanSchedule(loanId);
            return response.loanSchedule;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchLoanSummary = createAsyncThunk(
    'loan/fetchSummary',
    async (loanId, { rejectWithValue }) => {
        try {
            const response = await getLoanSummary(loanId);
            return response.summary;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);



const loanSlice = createSlice({
    name: 'loan',
    initialState: {
        loans: [],
        loansForVerification: [],
        currentLoan: null,
        isLoanNumberUnique: null,
        loading: false,
        error: null,
        success: false,
        rejectSuccess: false,
        updateSuccess: false,
        emiDetails: null,
        loanSchedule: null,
        loanSummary: null,
        scheduleLoading: false,
        summaryLoading: false,
        scheduleError: null,
        summaryError: null
    },
    reducers: {
        resetLoanState: (state) => {
            state.currentLoan = null;
            state.isLoanNumberUnique = null;
            state.loading = false;
            state.success = false;
            state.error = null;
            state.emiDetails = null;
        },
        resetRejectSuccess: (state) => {
            state.rejectSuccess = false;
        },
        resetUpdateSuccess: (state) => {
            state.updateSuccess = false;
        },
        resetEMIDetails: (state) => {
            state.emiDetails = null;
        },
        resetLoanSchedule: (state) => {
            state.loanSchedule = null;
            state.scheduleError = null;
        },
        resetLoanSummary: (state) => {
            state.loanSummary = null;
            state.summaryError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Loan
            .addCase(createNewLoan.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createNewLoan.fulfilled, (state, action) => {
                state.loading = false;
                state.loans.push(action.payload);
                state.currentLoan = action.payload;
                state.success = true;
            })
            .addCase(createNewLoan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Check Loan Number Uniqueness
            .addCase(checkLoanNumberUniqueness.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoanNumberUnique = action.payload;
            })
            .addCase(checkLoanNumberUniqueness.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Loans for Verification
            .addCase(fetchVerificationLoans.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVerificationLoans.fulfilled, (state, action) => {
                state.loading = false;
                state.loansForVerification = action.payload;
            })
            .addCase(fetchVerificationLoans.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Loan Status
            .addCase(updateLoanThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateLoanThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.updateSuccess = true;
                state.loansForVerification = state.loansForVerification.filter(
                    loan => loan._id !== action.payload._id
                );
            })
            .addCase(updateLoanThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Reject Loan
            .addCase(rejectLoanThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectLoanThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.rejectSuccess = true;
                const index = state.loansForVerification.findIndex(
                    loan => loan._id === action.payload._id
                );
                if (index !== -1) {
                    state.loansForVerification.splice(index, 1);
                }
            })
            .addCase(rejectLoanThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchLoanSchedule.pending, (state) => {
                state.scheduleLoading = true;
                state.scheduleError = null;
            })
            .addCase(fetchLoanSchedule.fulfilled, (state, action) => {
                state.scheduleLoading = false;
                state.loanSchedule = action.payload;
            })
            .addCase(fetchLoanSchedule.rejected, (state, action) => {
                state.scheduleLoading = false;
                state.scheduleError = action.payload;
            })

            // Fetch Loan Summary
            .addCase(fetchLoanSummary.pending, (state) => {
                state.summaryLoading = true;
                state.summaryError = null;
            })
            .addCase(fetchLoanSummary.fulfilled, (state, action) => {
                state.summaryLoading = false;
                state.loanSummary = action.payload;
            })
            .addCase(fetchLoanSummary.rejected, (state, action) => {
                state.summaryLoading = false;
                state.summaryError = action.payload;
            })
            
           
    }
});

export const { 
    resetLoanState, 
    resetRejectSuccess, 
    resetUpdateSuccess,
    resetLoanSchedule,
    resetLoanSummary
} = loanSlice.actions;

export default loanSlice.reducer;