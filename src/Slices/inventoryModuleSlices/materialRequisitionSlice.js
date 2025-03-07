import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as materialRequisitionAPI from '../../api/InventoryModuleAPI/materialRequisitionAPI';

// Create Material Requisition
export const createMaterialRequisitionThunk = createAsyncThunk(
    'materialRequisition/create',
    async (requisitionData, { rejectWithValue }) => {
        try {
            const response = await materialRequisitionAPI.createMaterialRequisition(requisitionData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create material requisition');
        }
    }
);

// Get Material Requisitions for Verification
export const getMaterialRequisitionsForVerificationThunk = createAsyncThunk(
    'materialRequisition/getForVerification',
    async (userRoleId, { rejectWithValue }) => {
        try {
            const response = await materialRequisitionAPI.getMaterialRequisitionsForVerification(userRoleId);
            return response.batchGroups || [];
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch requisitions for verification');
        }
    }
);

// Update Material Requisition Status (Verify)
export const updateMaterialRequisitionStatusThunk = createAsyncThunk(
    'materialRequisition/update',
    async ({ batchId, remarks }, { rejectWithValue }) => {
        try {
            const response = await materialRequisitionAPI.updateMaterialRequisitionStatus(batchId, remarks);
            return { batchId, results: response.results };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update material requisition');
        }
    }
);

// Reject Material Requisition
export const rejectMaterialRequisitionThunk = createAsyncThunk(
    'materialRequisition/reject',
    async ({ batchId, remarks }, { rejectWithValue }) => {
        try {
            const response = await materialRequisitionAPI.rejectMaterialRequisition(batchId, remarks);
            return { batchId, results: response.results };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to reject material requisition');
        }
    }
);

// Search Items for Material Requisition
export const searchItemsThunk = createAsyncThunk(
    'materialRequisition/searchItems',
    async (params, { rejectWithValue }) => {
        try {
            // Format search parameters with all necessary info
            const searchParams = {};
            
            // Handle query parameter
            if (params.query) {
                searchParams.query = params.query;
            } else if (params.searchTerm) {
                // Support for old parameter name for backward compatibility
                searchParams.query = params.searchTerm;
            }
            
            // Add search mode (defaults to 'code' if not specified)
            searchParams.searchMode = params.searchMode || 'code';
            
            // Add optional filters
            if (params.make) searchParams.make = params.make;
            if (params.specification) searchParams.specification = params.specification;
            
            const response = await materialRequisitionAPI.searchItemCodes(searchParams);
            
            if (response.success) {
                return {
                    items: response.data || [],
                    makes: response.makes || []
                };
            } else {
                return rejectWithValue(response.message || 'Failed to search items');
            }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.message || 
                'Failed to search items'
            );
        }
    }
);


const initialState = {
    // Data states
    requisitions: [],
    requisitionsForVerification: [],
    currentRequisition: null,
    searchResults: [],
    availableMakes: [],
    
    // Loading states
    loading: {
        create: false,
        verification: false,
        update: false,
        reject: false,
        search: false
    },
    
    // Error states
    errors: {
        create: null,
        verification: null,
        update: null,
        reject: null,
        search: null
    },
    
    // Success states
    success: {
        create: false,
        update: false,
        reject: false
    }
};

const materialRequisitionSlice = createSlice({
    name: 'materialRequisition',
    initialState,
    reducers: {
        // Reset entire state
        resetMaterialRequisitionState: () => initialState,
        
        // Reset all errors
        clearErrors: (state) => {
            state.errors = initialState.errors;
        },
        
        // Reset all success flags
        clearSuccess: (state) => {
            state.success = initialState.success;
        },
        
        // Reset specific states
        clearOperationState: (state, action) => {
            const operation = action.payload;
            if (operation) {
                state.loading[operation] = false;
                state.errors[operation] = null;
                state.success[operation] = false;
            }
        },
        
        // Set current requisition
        setCurrentRequisition: (state, action) => {
            state.currentRequisition = action.payload;
        },
        
        // Clear search results
        clearSearchResults: (state) => {
            state.searchResults = [];
            state.availableMakes = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Material Requisition
            .addCase(createMaterialRequisitionThunk.pending, (state) => {
                state.loading.create = true;
                state.errors.create = null;
                state.success.create = false;
            })
            .addCase(createMaterialRequisitionThunk.fulfilled, (state, action) => {
                state.loading.create = false;
                state.success.create = true;
                state.currentRequisition = action.payload;
                state.requisitions.push(action.payload);
            })
            .addCase(createMaterialRequisitionThunk.rejected, (state, action) => {
                state.loading.create = false;
                state.errors.create = action.payload;
                state.success.create = false;
            })

            // Get Material Requisitions for Verification
            .addCase(getMaterialRequisitionsForVerificationThunk.pending, (state) => {
                state.loading.verification = true;
                state.errors.verification = null;
            })
            .addCase(getMaterialRequisitionsForVerificationThunk.fulfilled, (state, action) => {
                state.loading.verification = false;
                state.requisitionsForVerification = action.payload;
            })
            .addCase(getMaterialRequisitionsForVerificationThunk.rejected, (state, action) => {
                state.loading.verification = false;
                state.errors.verification = action.payload;
            })

            // Update Material Requisition Status
            .addCase(updateMaterialRequisitionStatusThunk.pending, (state) => {
                state.loading.update = true;
                state.errors.update = null;
                state.success.update = false;
            })
            .addCase(updateMaterialRequisitionStatusThunk.fulfilled, (state, action) => {
                state.loading.update = false;
                state.success.update = true;
                
                // Remove the processed batch from verification list
                state.requisitionsForVerification = state.requisitionsForVerification.filter(
                    batch => batch.batchId !== action.payload.batchId
                );
            })
            .addCase(updateMaterialRequisitionStatusThunk.rejected, (state, action) => {
                state.loading.update = false;
                state.errors.update = action.payload;
                state.success.update = false;
            })

            // Reject Material Requisition
            .addCase(rejectMaterialRequisitionThunk.pending, (state) => {
                state.loading.reject = true;
                state.errors.reject = null;
                state.success.reject = false;
            })
            .addCase(rejectMaterialRequisitionThunk.fulfilled, (state, action) => {
                state.loading.reject = false;
                state.success.reject = true;
                
                // Remove the rejected batch from verification list
                state.requisitionsForVerification = state.requisitionsForVerification.filter(
                    batch => batch.batchId !== action.payload.batchId
                );
            })
            .addCase(rejectMaterialRequisitionThunk.rejected, (state, action) => {
                state.loading.reject = false;
                state.errors.reject = action.payload;
                state.success.reject = false;
            })
            
            // Search Items
            .addCase(searchItemsThunk.pending, (state) => {
                state.loading.search = true;
                state.errors.search = null;
            })
            .addCase(searchItemsThunk.fulfilled, (state, action) => {
                state.loading.search = false;
                state.searchResults = action.payload.items;
                state.availableMakes = action.payload.makes;
            })
            .addCase(searchItemsThunk.rejected, (state, action) => {
                state.loading.search = false;
                state.errors.search = action.payload;
                state.searchResults = [];
            });
    }
});

export const {
    resetMaterialRequisitionState,
    clearErrors,
    clearSuccess,
    clearOperationState,
    setCurrentRequisition,
    clearSearchResults
} = materialRequisitionSlice.actions;

export default materialRequisitionSlice.reducer;