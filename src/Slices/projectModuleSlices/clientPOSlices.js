import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as clientPOAPI from '../../api/ProjectModuleAPI/clientPoAPI';

// Async Thunks for Supporting Data
export const getPerformingCostCentres = createAsyncThunk(
    'clientPO/getPerformingCostCentres',
    async (_, { rejectWithValue }) => {
        try {
            const response = await clientPOAPI.getPerformingCostCentres();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch cost centres');
        }
    }
);

export const getWonBOQs = createAsyncThunk(
    'clientPO/getWonBOQs',
    async (_, { rejectWithValue }) => {
        try {
            const response = await clientPOAPI.getWonBOQs();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch BOQs');
        }
    }
);

export const getClientDetails = createAsyncThunk(
    'clientPO/getClientDetails',
    async (clientId, { rejectWithValue }) => {
        try {
            const response = await clientPOAPI.getClientDetails(clientId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch client details');
        }
    }
);

// Main PO Operations
export const createClientPO = createAsyncThunk(
    'clientPO/createClientPO',
    async (poData, { rejectWithValue }) => {
        try {
            const response = await clientPOAPI.createClientPO(poData);
            return response;
        } catch (error) {
            if (error.response?.data?.error) {
                return rejectWithValue(error.response.data.error);
            }
            return rejectWithValue(error.message || 'Failed to create client PO');
        }
    }
);

export const getPOsForVerification = createAsyncThunk(
    'clientPO/getPOsForVerification',
    async (userRoleId, { rejectWithValue }) => {
        try {
            console.log('Fetching POs with userRoleId:', userRoleId);
            const response = await clientPOAPI.getPOsForVerification(userRoleId);
            console.log('API Response:', response);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch POs for verification');
        }
    }
);

export const verifyClientPO = createAsyncThunk(
    'clientPO/verifyClientPO',
    async (data, { rejectWithValue }) => {
        try {
            const response = await clientPOAPI.verifyClientPO(data.id, data.remarks);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to verify client PO');
        }
    }
);

export const rejectClientPO = createAsyncThunk(
    'clientPO/rejectClientPO',
    async (data, { rejectWithValue }) => {
        try {
            const response = await clientPOAPI.rejectClientPO(data.id, data.remarks);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to reject client PO');
        }
    }
);

const initialState = {
    // Supporting Data
    costCentres: [],
    wonBOQs: [],
    clientDetails: null,
    
    // Main PO Data
    clientPOs: [],
    POsForVerification: [],
    selectedPO: null,
    
    loading: {
        costCentres: false,
        wonBOQs: false,
        clientDetails: false,
        createPO: false,
        POVerification: false,
        verifyPO: false,
        rejectPO: false
    },
    error: {
        costCentres: null,
        wonBOQs: null,
        clientDetails: null,
        createPO: null,
        POVerification: null,
        verifyPO: null,
        rejectPO: null
    },
    success: {
        createPO: false,
        verifyPO: false,
        rejectPO: false
    }
};

const clientPOSlice = createSlice({
    name: 'clientPO',
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = initialState.error;
        },
        clearSuccess: (state) => {
            state.success = initialState.success;
        },
        setSelectedPO: (state, action) => {
            state.selectedPO = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get Performing Cost Centres
            .addCase(getPerformingCostCentres.pending, (state) => {
                state.loading.costCentres = true;
                state.error.costCentres = null;
            })
            .addCase(getPerformingCostCentres.fulfilled, (state, action) => {
                state.loading.costCentres = false;
                state.costCentres = action.payload;
            })
            .addCase(getPerformingCostCentres.rejected, (state, action) => {
                state.loading.costCentres = false;
                state.error.costCentres = action.payload;
            })

            // Get Won BOQs
            .addCase(getWonBOQs.pending, (state) => {
                state.loading.wonBOQs = true;
                state.error.wonBOQs = null;
            })
            .addCase(getWonBOQs.fulfilled, (state, action) => {
                state.loading.wonBOQs = false;
                state.wonBOQs = action.payload;
            })
            .addCase(getWonBOQs.rejected, (state, action) => {
                state.loading.wonBOQs = false;
                state.error.wonBOQs = action.payload;
            })

            // Get Client Details
            .addCase(getClientDetails.pending, (state) => {
                state.loading.clientDetails = true;
                state.error.clientDetails = null;
            })
            .addCase(getClientDetails.fulfilled, (state, action) => {
                state.loading.clientDetails = false;
                state.clientDetails = action.payload;
            })
            .addCase(getClientDetails.rejected, (state, action) => {
                state.loading.clientDetails = false;
                state.error.clientDetails = action.payload;
            })

            // Create Client PO
            .addCase(createClientPO.pending, (state) => {
                state.loading.createPO = true;
                state.error.createPO = null;
                state.success.createPO = false;
            })
            .addCase(createClientPO.fulfilled, (state, action) => {
                state.loading.createPO = false;
                state.success.createPO = true;
                state.clientPOs.push(action.payload.data);
            })
            .addCase(createClientPO.rejected, (state, action) => {
                state.loading.createPO = false;
                state.error.createPO = action.payload;
                state.success.createPO = false;
            })

            // Get POs for Verification
            .addCase(getPOsForVerification.pending, (state) => {
                state.loading.POVerification = true;
                state.error.POVerification = null;
            })
            .addCase(getPOsForVerification.fulfilled, (state, action) => {
                state.loading.POVerification = false;
                state.POsForVerification = action.payload;
            })
            .addCase(getPOsForVerification.rejected, (state, action) => {
                state.loading.POVerification = false;
                state.error.POVerification = action.payload;
            })

            // Verify Client PO
            .addCase(verifyClientPO.pending, (state) => {
                state.loading.verifyPO = true;
                state.error.verifyPO = null;
                state.success.verifyPO = false;
            })
            .addCase(verifyClientPO.fulfilled, (state, action) => {
                state.loading.verifyPO = false;
                state.success.verifyPO = true;
                state.POsForVerification = state.POsForVerification.filter(
                    po => po._id !== action.payload._id
                );
            })
            .addCase(verifyClientPO.rejected, (state, action) => {
                state.loading.verifyPO = false;
                state.error.verifyPO = action.payload;
                state.success.verifyPO = false;
            })

            // Reject Client PO
            .addCase(rejectClientPO.pending, (state) => {
                state.loading.rejectPO = true;
                state.error.rejectPO = null;
                state.success.rejectPO = false;
            })
            .addCase(rejectClientPO.fulfilled, (state, action) => {
                state.loading.rejectPO = false;
                state.success.rejectPO = true;
                state.POsForVerification = state.POsForVerification.filter(
                    po => po._id !== action.payload._id
                );
            })
            .addCase(rejectClientPO.rejected, (state, action) => {
                state.loading.rejectPO = false;
                state.error.rejectPO = action.payload;
                state.success.rejectPO = false;
            });
    }
});

export const { 
    clearErrors, 
    clearSuccess, 
    setSelectedPO 
} = clientPOSlice.actions;

export default clientPOSlice.reducer;