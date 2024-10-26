import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createLedger,
    checkLedgerNameExists,
    fetchLedgersForVerification,
    updateLedgerStatus,
    rejectLedger
 } from '../api/ledgerAPI';



export const createNewLedger = createAsyncThunk(
    'ledger/createNewLedger',
    async (ledgerData, { rejectWithValue }) => {
        try {
            const response = await createLedger(ledgerData)
            return response
        } catch (error) {
            return rejectWithValue(error)


        }
    }
)

export const checkLedgerNameUniqueness = createAsyncThunk(
    'ledger/checkNameUniqueness',
    async (ledgerName, { rejectWithValue }) => {
        try {
            const response = await checkLedgerNameExists(ledgerName);
            return !response.exists; // Return true if the name doesn't exist (is unique)
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)

export const fetchVerificationLedgers = createAsyncThunk(
    'ledger/fetchForVerification',
    async (userRoleId, { rejectWithValue }) => {
        try {
            const response = await fetchLedgersForVerification(userRoleId);
            return response.ledgers;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const updateLedger = createAsyncThunk(
    'ledger/updateStatus',
    async ({ id, updateData }, { rejectWithValue }) => {
        try {
            const response = await updateLedgerStatus(id, updateData);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const rejectGeneralLedger = createAsyncThunk(
    'ledger/reject',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await rejectLedger(id, remarks);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

const ledgerSlice = createSlice({
    name: 'ledger',
    initialState: {
        ledgers: [],
        ledgersForVerification: [],
        currentLedger: null,
        isLedgerNameUnique: null,
        loading: false,
        error: null,
        success: false,
        rejectSuccess:false,
        updateSuccess:false

    },
    reducers: {
        resetLedgerState: (state) => {
            state.currentLedger = null
            state.isLedgerNameUnique = null
            state.loading = false
            state.success = false
            state.error = null
        },
        resetRejectSuccess:(state) => {
            state.rejectSuccess = false
        },
        resetUpdateSuccess:(state)=> {
            state.updateSuccess = false
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(createNewLedger.pending, (state) => {
                state.loading = true;
                state.error = null
            })
            .addCase(createNewLedger.fulfilled, (state, action) => {
                state.loading = false
                state.ledgers.push(action.payload)
                state.currentLedger = action.payload;
                state.success = true
            })
            .addCase(createNewLedger.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(checkLedgerNameUniqueness.fulfilled, (state, action) => {
                state.loading = false;
                state.isLedgerNameUnique = action.payload;
            })
            .addCase(checkLedgerNameUniqueness.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Ledgers for Verification
            .addCase(fetchVerificationLedgers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVerificationLedgers.fulfilled, (state, action) => {
                state.loading = false;
                state.ledgersForVerification = action.payload;
            })
            .addCase(fetchVerificationLedgers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Ledger Status
            .addCase(updateLedger.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateLedger.fulfilled, (state, action) => {
                state.loading = false;
                state.updateSuccess = true;
                state.ledgersForVerification = state.ledgersForVerification.filter(ledger => ledger._id  !== action.payload._id);
              
            })
            .addCase(updateLedger.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(rejectGeneralLedger.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectGeneralLedger.fulfilled, (state, action) => {
                state.loading = false;
                state.rejectSuccess = true;
                const index = state.ledgersForVerification.findIndex(ledger => ledger._id === action.payload._id);
                if (index !== -1) {
                    state.ledgersForVerification.splice(index, 1); // Remove the rejected ledger from the list
                }
            })
            .addCase(rejectGeneralLedger.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }

})

export const { resetLedgerState, resetRejectSuccess , resetUpdateSuccess} = ledgerSlice.actions
export default ledgerSlice.reducer