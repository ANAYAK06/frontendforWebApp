import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as clientAPI from '../../api/AccountsModuleAPI/clientAPI';

// Client Async Thunks
export const createClient = createAsyncThunk(
    'client/create',
    async (clientData, { rejectWithValue }) => {
        try {
            const response = await clientAPI.createClient(clientData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create client');
        }
    }
);

export const fetchClientsForVerification = createAsyncThunk(
    'client/fetchForVerification',
    async (userRoleId, { rejectWithValue }) => {
        try {
            const response = await clientAPI.getClientsForVerification(userRoleId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch clients for verification');
        }
    }
);

export const verifyClientStatus = createAsyncThunk(
    'client/verify',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await clientAPI.verifyClient(id, remarks);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to verify client');
        }
    }
);

export const rejectClientStatus = createAsyncThunk(
    'client/reject',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await clientAPI.rejectClient(id, remarks);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to reject client');
        }
    }
);

export const fetchActiveClients = createAsyncThunk(
    'client/fetchActive',
    async (params, { rejectWithValue }) => {
        try {
            const response = await clientAPI.getActiveClients(params);
            return response
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch active clients');
        }
    }
);

export const fetchActiveClientById = createAsyncThunk(
    'client/fetchActiveById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await clientAPI.getActiveClientById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch client details');
        }
    }
);

// SubClient Async Thunks
export const createSubClient = createAsyncThunk(
    'client/createSubClient',
    async (subClientData, { rejectWithValue }) => {
        try {
            const response = await clientAPI.createSubClient(subClientData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create sub-client');
        }
    }
);

export const fetchSubClientsForVerification = createAsyncThunk(
    'client/fetchSubClientsForVerification',
    async (userRoleId, { rejectWithValue }) => {
        try {
            const response = await clientAPI.getSubClientsForVerification(userRoleId);
            console.log('fetching sub-clients for verification', response.data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch sub-clients for verification');
        }
    }
);

export const verifySubClientStatus = createAsyncThunk(
    'client/verifySubClient',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await clientAPI.verifySubClient(id, remarks);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to verify sub-client');
        }
    }
);

export const rejectSubClientStatus = createAsyncThunk(
    'client/rejectSubClient',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await clientAPI.rejectSubClient(id, remarks);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to reject sub-client');
        }
    }
);


const initialState = {
    // Client state
    clients: [],
    clientsForVerification: [],
    activeClients: [],
    selectedClient: null,
    
    // SubClient state
    subClients: [],
    subClientsForVerification: [],
    selectedSubClient: null,
    
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0
    },
    loading: {
        create: false,
        fetchVerification: false,
        verify: false,
        reject: false,
        fetchActive: false,
        fetchById: false,
        // SubClient loading states
        createSubClient: false,
        fetchSubClientVerification: false,
        verifySubClient: false,
        rejectSubClient: false
    },
    error: {
        create: null,
        fetchVerification: null,
        verify: null,
        reject: null,
        fetchActive: null,
        fetchById: null,
        // SubClient error states
        createSubClient: null,
        fetchSubClientVerification: null,
        verifySubClient: null,
        rejectSubClient: null
    },
    success: {
        create: false,
        verify: false,
        reject: false,
        // SubClient success states
        createSubClient: false,
        verifySubClient: false,
        rejectSubClient: false
    }
};
const clientSlice = createSlice({
    name: 'client',
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = initialState.error;
        },
        clearSuccess: (state) => {
            state.success = initialState.success;
        },
        setSelectedClient: (state, action) => {
            state.selectedClient = action.payload;
        },
        setSelectedSubClient: (state, action) => {
            state.selectedSubClient = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create client
            .addCase(createClient.pending, (state) => {
                state.loading.create = true;
                state.error.create = null;
                state.success.create = false;
            })
            .addCase(createClient.fulfilled, (state, action) => {
                state.loading.create = false;
                state.success.create = true;
                state.clients.push(action.payload);
            })
            .addCase(createClient.rejected, (state, action) => {
                state.loading.create = false;
                state.error.create = action.payload;
                state.success.create = false;
            })

            // Fetch clients for verification
            .addCase(fetchClientsForVerification.pending, (state) => {
                state.loading.fetchVerification = true;
                state.error.fetchVerification = null;
            })
            .addCase(fetchClientsForVerification.fulfilled, (state, action) => {
                state.loading.fetchVerification = false;
                state.clientsForVerification = action.payload.data;
                
            })
            .addCase(fetchClientsForVerification.rejected, (state, action) => {
                state.loading.fetchVerification = false;
                state.error.fetchVerification = action.payload;
            })

            // Verify client
            .addCase(verifyClientStatus.pending, (state) => {
                state.loading.verify = true;
                state.error.verify = null;
                state.success.verify = false;
            })
            .addCase(verifyClientStatus.fulfilled, (state, action) => {
                state.loading.verify = false;
                state.success.verify = true;
                state.clientsForVerification = state.clientsForVerification.filter(
                    client => client._id !== action.payload.data._id
                );
            })
            .addCase(verifyClientStatus.rejected, (state, action) => {
                state.loading.verify = false;
                state.error.verify = action.payload;
                state.success.verify = false;
            })

            // Reject client
            .addCase(rejectClientStatus.pending, (state) => {
                state.loading.reject = true;
                state.error.reject = null;
                state.success.reject = false;
            })
            .addCase(rejectClientStatus.fulfilled, (state, action) => {
                state.loading.reject = false;
                state.success.reject = true;
                state.clientsForVerification = state.clientsForVerification.filter(
                    client => client._id !== action.payload.data._id
                );
            })
            .addCase(rejectClientStatus.rejected, (state, action) => {
                state.loading.reject = false;
                state.error.reject = action.payload;
                state.success.reject = false;
            })

            // Fetch active clients
            .addCase(fetchActiveClients.pending, (state) => {
                state.loading.fetchActive = true;
                state.error.fetchActive = null;
            })
            .addCase(fetchActiveClients.fulfilled, (state, action) => {
                state.loading.fetchActive = false;
                state.activeClients = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchActiveClients.rejected, (state, action) => {
                state.loading.fetchActive = false;
                state.error.fetchActive = action.payload;
            })

            // Fetch active client by ID
            .addCase(fetchActiveClientById.pending, (state) => {
                state.loading.fetchById = true;
                state.error.fetchById = null;
            })
            .addCase(fetchActiveClientById.fulfilled, (state, action) => {
                state.loading.fetchById = false;
                state.selectedClient = action.payload.data;
            })
            .addCase(fetchActiveClientById.rejected, (state, action) => {
                state.loading.fetchById = false;
                state.error.fetchById = action.payload;
            })
            .addCase(createSubClient.pending, (state) => {
                state.loading.createSubClient = true;
                state.error.createSubClient = null;
                state.success.createSubClient = false;
            })
            .addCase(createSubClient.fulfilled, (state, action) => {
                state.loading.createSubClient = false;
                state.success.createSubClient = true;
                state.subClients.push(action.payload);
            })
            .addCase(createSubClient.rejected, (state, action) => {
                state.loading.createSubClient = false;
                state.error.createSubClient = action.payload;
                state.success.createSubClient = false;
            })

            // Fetch SubClients for verification
            .addCase(fetchSubClientsForVerification.pending, (state) => {
                state.loading.fetchSubClientVerification = true;
                state.error.fetchSubClientVerification = null;
            })
            .addCase(fetchSubClientsForVerification.fulfilled, (state, action) => {
                state.loading.fetchSubClientVerification = false;
                state.subClientsForVerification = action.payload;
            })
            .addCase(fetchSubClientsForVerification.rejected, (state, action) => {
                state.loading.fetchSubClientVerification = false;
                state.error.fetchSubClientVerification = action.payload;
            })

            // Verify SubClient
            .addCase(verifySubClientStatus.pending, (state) => {
                state.loading.verifySubClient = true;
                state.error.verifySubClient = null;
                state.success.verifySubClient = false;
            })
            .addCase(verifySubClientStatus.fulfilled, (state, action) => {
                state.loading.verifySubClient = false;
                state.success.verifySubClient = true;
                // Safely handle the filtering by checking both possible data structures
                const updatedId = action.payload._id || (action.payload.data && action.payload.data._id);
                if (updatedId) {
                    state.subClientsForVerification = state.subClientsForVerification.filter(
                        subClient => subClient._id !== updatedId
                    );
                }
            })
            .addCase(verifySubClientStatus.rejected, (state, action) => {
                state.loading.verifySubClient = false;
                state.error.verifySubClient = action.payload;
                state.success.verifySubClient = false;
            })

            // Reject SubClient
            .addCase(rejectSubClientStatus.pending, (state) => {
                state.loading.rejectSubClient = true;
                state.error.rejectSubClient = null;
                state.success.rejectSubClient = false;
            })
            .addCase(rejectSubClientStatus.fulfilled, (state, action) => {
                state.loading.rejectSubClient = false;
                state.success.rejectSubClient = true;
                const updatedId = action.payload._id || (action.payload.data && action.payload.data._id);
                if (updatedId) {
                    state.subClientsForVerification = state.subClientsForVerification.filter(
                        subClient => subClient._id !== updatedId
                    );
                }
            })
            .addCase(rejectSubClientStatus.rejected, (state, action) => {
                state.loading.rejectSubClient = false;
                state.error.rejectSubClient = action.payload;
                state.success.rejectSubClient = false;
            });
    }
});

export const { clearErrors, clearSuccess, setSelectedClient } = clientSlice.actions;
export default clientSlice.reducer;