import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as unitAPI from '../../api/InventoryModuleAPI/itemCodeUnitAPI';

// Create Unit
// Create Unit
export const createUnitThunk = createAsyncThunk(
    'unit/create',
    async (unitData, { rejectWithValue }) => {
        try {
            const response = await unitAPI.createUnit(unitData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Bulk Upload Units
export const bulkUploadUnitsThunk = createAsyncThunk(
    'unit/bulkUpload',
    async (unitsData, { rejectWithValue }) => {
        try {
            const response = await unitAPI.bulkUploadUnits(unitsData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Get Units for Verification
export const getUnitsForVerificationThunk = createAsyncThunk(
    'unit/getForVerification',
    async (userRoleId, { rejectWithValue }) => {
        try {
            const response = await unitAPI.getUnitsForVerification(userRoleId);
            return response.units;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);


// Verify Single Unit
export const verifyUnitThunk = createAsyncThunk(
    'unit/verify',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await unitAPI.verifyUnit(id, remarks);
            return { ...response.unit, _id: id };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);


// Verify Batch Units
export const verifyBatchUnitsThunk = createAsyncThunk(
    'unit/verifyBatch',
    async ({ batchId, remarks }, { rejectWithValue }) => {
        try {
            const response = await unitAPI.verifyBatchUnits(batchId, remarks);
            return { batchId, results: response.results };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);


// Reject Unit
// In your unitSlice.js
export const rejectUnitThunk = createAsyncThunk(
    'unit/reject',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await unitAPI.rejectUnit(id, remarks);
            if (!response.success) {
                throw new Error(response.message || 'Failed to reject unit');
            }
            return { ...response.unit, _id: id };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const rejectBatchUnitsThunk = createAsyncThunk(
    'unit/rejectBatch',
    async ({ batchId, remarks }, { rejectWithValue }) => {
        try {
            const response = await unitAPI.rejectBatchUnits(batchId, remarks);
            if (!response.success) {
                throw new Error(response.message || 'Failed to reject batch');
            }
            return { batchId, results: response.results };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
// Get All Units
export const getAllUnitsThunk = createAsyncThunk(
    'unit/getAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await unitAPI.getAllUnits();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Get Unit By ID
export const getUnitByIdThunk = createAsyncThunk(
    'unit/getById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await unitAPI.getUnitById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Get Units By Type
export const getUnitsByTypeThunk = createAsyncThunk(
    'unit/getByType',
    async ({ type, excludeUnit = null }, { rejectWithValue }) => {
        try {
            const response = await unitAPI.getUnitsByType(type, excludeUnit);
            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch units');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.message || 
                'Failed to fetch units'
            );
        }
    }
);

// Get Unit Conversions
export const getUnitConversionsThunk = createAsyncThunk(
    'unit/getConversions',
    async (unitSymbol, { rejectWithValue }) => {
        try {
            const response = await unitAPI.getUnitConversions(unitSymbol);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getUnitsByCategoryThunk = createAsyncThunk(
    'unit/getByCategory',
    async (category, { rejectWithValue }) => {
        try {
            const response = await unitAPI.getUnitsByCategory(category);
            
            return response;
        } catch (error) {
            return rejectWithValue(
                error.message || 'Failed to fetch units by category'
            );
        }
    }
);

export const getAllowedUnitsByPrimaryUnitThunk = createAsyncThunk(
    'unit/getAllowedByPrimaryUnit',
    async (primaryUnit, { rejectWithValue }) => {
        try {
            const response = await unitAPI.getAllowedUnitsByPrimaryUnit(primaryUnit);
            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch allowed units');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.message || 
                'Failed to fetch allowed units'
            );
        }
    }
);

const initialState = {
    // Data states
    units: [],
    unitsForVerification: [],
    currentUnit: null,
    unitHistory: [],
    conversions: [],
    unitsByType: [],
    unitsByCategory: [],
    allowedUnits:[],

    // Loading states
    loading: {
        create: false,
        bulkUpload: false,
        verify: false,
        reject: false,
        fetch: false,
        fetchById: false,
        fetchByType: false,
        verification: false,
        conversion: false,
        fetchByCategory: false,
        fetchAllowedUnits:false

    },
    
    // Error states
    errors: {
        create: null,
        bulkUpload: null,
        verify: null,
        reject: null,
        fetch: null,
        fetchById: null,
        fetchByType: null,
        verification: null,
        conversion: null,
        fetchByCategory: null,
        fetchAllowedUnits:null
    },
    
    // Success states
    success: {
        create: false,
        bulkUpload: false,
        verify: false,
        reject: false,
        update: false,
        conversion: false
    }
};


const unitSlice = createSlice({
    name: 'unit',
    initialState,
    reducers: {
        // Reset entire state
        resetUnitState: () => initialState,
        
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
        
        // Set current unit
        setCurrentUnit: (state, action) => {
            state.currentUnit = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Unit
            .addCase(createUnitThunk.pending, (state) => {
                state.loading.create = true;
                state.errors.create = null;
                state.success.create = false;
            })
            .addCase(createUnitThunk.fulfilled, (state, action) => {
                state.loading.create = false;
                state.success.create = true;
                state.currentUnit = action.payload;
                state.units.push(action.payload);
            })
            .addCase(createUnitThunk.rejected, (state, action) => {
                state.loading.create = false;
                state.errors.create = action.payload;
                state.success.create = false;
            })

            // Bulk Upload Units
            .addCase(bulkUploadUnitsThunk.pending, (state) => {
                state.loading.bulkUpload = true;
                state.errors.bulkUpload = null;
                state.success.bulkUpload = false;
            })
            .addCase(bulkUploadUnitsThunk.fulfilled, (state, action) => {
                state.loading.bulkUpload = false;
                state.success.bulkUpload = true;
                state.units = [...state.units, ...action.payload];
            })
            .addCase(bulkUploadUnitsThunk.rejected, (state, action) => {
                state.loading.bulkUpload = false;
                state.errors.bulkUpload = action.payload;
                state.success.bulkUpload = false;
            })

            // Get Units for Verification
            .addCase(getUnitsForVerificationThunk.pending, (state) => {
                state.loading.verification = true;
                state.errors.verification = null;
            })
            .addCase(getUnitsForVerificationThunk.fulfilled, (state, action) => {
                state.loading.verification = false;
                state.unitsForVerification = action.payload;
            })
            .addCase(getUnitsForVerificationThunk.rejected, (state, action) => {
                state.loading.verification = false;
                state.errors.verification = action.payload;
            })

            // Verify Unit
            .addCase(verifyUnitThunk.pending, (state) => {
                state.loading.verify = true;
                state.errors.verify = null;
                state.success.verify = false;
            })
            .addCase(verifyUnitThunk.fulfilled, (state, action) => {
                state.loading.verify = false;
                state.success.verify = true;
                state.unitsForVerification = state.unitsForVerification.filter(
                    unit => unit._id !== action.payload._id
                );
            })
            .addCase(verifyUnitThunk.rejected, (state, action) => {
                state.loading.verify = false;
                state.errors.verify = action.payload;
                state.success.verify = false;
            })

            // Verify Batch Units (uses same loading/error/success states as single verify)
            .addCase(verifyBatchUnitsThunk.pending, (state) => {
                state.loading.verify = true;
                state.errors.verify = null;
                state.success.verify = false;
            })
            .addCase(verifyBatchUnitsThunk.fulfilled, (state, action) => {
                state.loading.verify = false;
                state.success.verify = true;
                const verifiedIds = action.payload.results.map(result => result.id);
                state.unitsForVerification = state.unitsForVerification.filter(
                    unit => !verifiedIds.includes(unit._id)
                );
            })
            .addCase(verifyBatchUnitsThunk.rejected, (state, action) => {
                state.loading.verify = false;
                state.errors.verify = action.payload;
                state.success.verify = false;
            })

            // Reject Unit
            .addCase(rejectUnitThunk.pending, (state) => {
                state.loading.reject = true;
                state.errors.reject = null;
                state.success.reject = false;
            })
            .addCase(rejectUnitThunk.fulfilled, (state, action) => {
                state.loading.reject = false;
                state.success.reject = true;
                state.unitsForVerification = state.unitsForVerification.filter(
                    unit => unit._id !== action.payload._id
                );
            })
            .addCase(rejectUnitThunk.rejected, (state, action) => {
                state.loading.reject = false;
                state.errors.reject = action.payload;
                state.success.reject = false;
            })

            // Reject Batch Units (uses same loading/error/success states as single reject)
            .addCase(rejectBatchUnitsThunk.pending, (state) => {
                state.loading.reject = true;
                state.errors.reject = null;
                state.success.reject = false;
            })
            .addCase(rejectBatchUnitsThunk.fulfilled, (state, action) => {
                state.loading.reject = false;
                state.success.reject = true;
                const rejectedIds = action.payload.results.map(result => result.id);
                state.unitsForVerification = state.unitsForVerification.filter(
                    unit => !rejectedIds.includes(unit._id)
                );
            })
            .addCase(rejectBatchUnitsThunk.rejected, (state, action) => {
                state.loading.reject = false;
                state.errors.reject = action.payload;
                state.success.reject = false;
            })

            // Get All Units
            .addCase(getAllUnitsThunk.pending, (state) => {
                state.loading.fetch = true;
                state.errors.fetch = null;
            })
            .addCase(getAllUnitsThunk.fulfilled, (state, action) => {
                state.loading.fetch = false;
                state.units = action.payload;
            })
            .addCase(getAllUnitsThunk.rejected, (state, action) => {
                state.loading.fetch = false;
                state.errors.fetch = action.payload;
            })

            // Get Unit By ID
            .addCase(getUnitByIdThunk.pending, (state) => {
                state.loading.fetchById = true;
                state.errors.fetchById = null;
            })
            .addCase(getUnitByIdThunk.fulfilled, (state, action) => {
                state.loading.fetchById = false;
                state.currentUnit = action.payload;
            })
            .addCase(getUnitByIdThunk.rejected, (state, action) => {
                state.loading.fetchById = false;
                state.errors.fetchById = action.payload;
            })

            // Get Units By Type
            .addCase(getUnitsByTypeThunk.pending, (state) => {
                state.loading.fetchByType = true;
                state.errors.fetchByType = null;
                state.unitsByType = [];
            })
            .addCase(getUnitsByTypeThunk.fulfilled, (state, action) => {
                state.loading.fetchByType = false;
                state.unitsByType = action.payload;
            })
            .addCase(getUnitsByTypeThunk.rejected, (state, action) => {
                state.loading.fetchByType = false;
                state.errors.fetchByType = action.payload;
                state.unitsByType = [];
            })

            // Get Unit Conversions
            .addCase(getUnitConversionsThunk.pending, (state) => {
                state.loading.conversion = true;
                state.errors.conversion = null;
            })
            .addCase(getUnitConversionsThunk.fulfilled, (state, action) => {
                state.loading.conversion = false;
                state.conversions = action.payload;
            })
            .addCase(getUnitConversionsThunk.rejected, (state, action) => {
                state.loading.conversion = false;
                state.errors.conversion = action.payload;
            })
            .addCase(getUnitsByCategoryThunk.pending, (state) => {
                state.loading.fetchByCategory = true;
                state.errors.fetchByCategory = null;
                state.unitsByCategory = [];
            })
            .addCase(getUnitsByCategoryThunk.fulfilled, (state, action) => {
                state.loading.fetchByCategory = false;
                state.unitsByCategory = action.payload;
            })
            .addCase(getUnitsByCategoryThunk.rejected, (state, action) => {
                state.loading.fetchByCategory = false;
                state.errors.fetchByCategory = action.payload;
                state.unitsByCategory = [];
            })
            .addCase(getAllowedUnitsByPrimaryUnitThunk.pending, (state) => {
                state.loading.fetchAllowedUnits = true;
                state.errors.fetchAllowedUnits = null;
                state.allowedUnits = []; // Clear previous allowed units
            })
            .addCase(getAllowedUnitsByPrimaryUnitThunk.fulfilled, (state, action) => {
                state.loading.fetchAllowedUnits = false;
                state.allowedUnits = action.payload;
            })
            .addCase(getAllowedUnitsByPrimaryUnitThunk.rejected, (state, action) => {
                state.loading.fetchAllowedUnits = false;
                state.errors.fetchAllowedUnits = action.payload;
                state.allowedUnits = []; // Clear on error
            });

            // // Update Conversion
            // .addCase(updateConversionThunk.pending, (state) => {
            //     state.loading.conversion = true;
            //     state.errors.conversion = null;
            //     state.success.conversion = false;
            // })
            // .addCase(updateConversionThunk.fulfilled, (state, action) => {
            //     state.loading.conversion = false;
            //     state.success.conversion = true;
            //     state.currentUnit = action.payload;
            // })
            // .addCase(updateConversionThunk.rejected, (state, action) => {
            //     state.loading.conversion = false;
            //     state.errors.conversion = action.payload;
            //     state.success.conversion = false;
            // });
    }
});


export const {
    resetUnitState,
    clearErrors,
    clearSuccess,
    clearOperationState,
    setCurrentUnit
   
} = unitSlice.actions;

export default unitSlice.reducer;