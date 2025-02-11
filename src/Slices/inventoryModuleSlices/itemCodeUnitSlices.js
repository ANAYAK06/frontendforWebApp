import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    createUnit,
    bulkUploadUnits,
    getUnitsForVerification,
    verifyUnit,
    verifyBatchUnits,
    rejectUnit,
    rejectBatchUnits,
    getAllUnits,
    getUnitsByType,
    getUnitById,
    getUnitHistory,
    updateUnit,
    updateConversion,
    getUnitConversions
} from '../../api/InventoryModuleAPI/itemCodeUnitAPI';

// Create Unit
export const createUnitThunk = createAsyncThunk(
    'unit/create',
    async (unitData, { rejectWithValue }) => {
        try {
            console.log('Thunk received data:', unitData);
            const response = await createUnit(unitData);
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
            const response = await bulkUploadUnits(unitsData);
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
            const response = await getUnitsForVerification(userRoleId);
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
            const response = await verifyUnit(id, remarks);
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
            const response = await verifyBatchUnits(batchId, remarks);
            return { batchId, results: response.results };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Reject Single Unit
export const rejectUnitThunk = createAsyncThunk(
    'unit/reject',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await rejectUnit(id, remarks);
            return { ...response.unit, _id: id };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Reject Batch Units
export const rejectBatchUnitsThunk = createAsyncThunk(
    'unit/rejectBatch',
    async ({ batchId, remarks }, { rejectWithValue }) => {
        try {
            const response = await rejectBatchUnits(batchId, remarks);
            return { batchId, results: response.results };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Get All Units
export const getAllUnitsThunk = createAsyncThunk(
    'unit/getAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllUnits();
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
            const response = await getUnitById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Update Unit
export const updateUnitThunk = createAsyncThunk(
    'unit/update',
    async ({ id, updateData }, { rejectWithValue }) => {
        try {
            const response = await updateUnit(id, updateData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Update Conversion
export const updateConversionThunk = createAsyncThunk(
    'unit/updateConversion',
    async (conversionData, { rejectWithValue }) => {
        try {
            const response = await updateConversion(conversionData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);
export const getUnitsByTypeThunk = createAsyncThunk(
    'unit/getByType',
    async ({ type, excludeUnit = null }, { rejectWithValue }) => {
        try {
            const response = await getUnitsByType(type, excludeUnit);
            
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
            const response = await getUnitConversions(unitSymbol);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const unitSlice = createSlice({
    name: 'unit',
    initialState: {
        units: [],
        unitsForVerification: [],
        currentUnit: null,
        unitHistory: [],
        conversions: [],
        unitsByType: [],
        loading: false,
        error: null,
        createSuccess: false,
        bulkUploadSuccess: false,
        verifySuccess: false,
        rejectSuccess: false,
        updateSuccess: false,
        conversionSuccess: false
    },
    reducers: {
        resetUnitState: (state) => {
            state.currentUnit = null;
            state.loading = false;
            state.error = null;
        },
        resetCreateSuccess: (state) => {
            state.createSuccess = false;
        },
        resetBulkUploadSuccess: (state) => {
            state.bulkUploadSuccess = false;
        },
        resetVerifySuccess: (state) => {
            state.verifySuccess = false;
        },
        resetRejectSuccess: (state) => {
            state.rejectSuccess = false;
        },
        resetUpdateSuccess: (state) => {
            state.updateSuccess = false;
        },
        resetConversionSuccess: (state) => {
            state.conversionSuccess = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Unit
            .addCase(createUnitThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createUnitThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.createSuccess = true;
                state.currentUnit = action.payload;
                state.units.push(action.payload);
            })
            .addCase(createUnitThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Bulk Upload Units
            .addCase(bulkUploadUnitsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(bulkUploadUnitsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.bulkUploadSuccess = true;
                state.units = [...state.units, ...action.payload.results.success];
            })
            .addCase(bulkUploadUnitsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get Units for Verification
            .addCase(getUnitsForVerificationThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUnitsForVerificationThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.unitsForVerification = action.payload;
            })
            .addCase(getUnitsForVerificationThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Verify Unit
            .addCase(verifyUnitThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyUnitThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.verifySuccess = true;
                state.unitsForVerification = state.unitsForVerification.filter(
                    unit => unit._id !== action.payload._id
                );
            })
            .addCase(verifyUnitThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Verify Batch Units
            .addCase(verifyBatchUnitsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyBatchUnitsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.verifySuccess = true;
                state.unitsForVerification = state.unitsForVerification.filter(
                    unit => !action.payload.results.includes(unit._id)
                );
            })
            .addCase(verifyBatchUnitsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Reject Unit
            .addCase(rejectUnitThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectUnitThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.rejectSuccess = true;
                state.unitsForVerification = state.unitsForVerification.filter(
                    unit => unit._id !== action.payload._id
                );
            })
            .addCase(rejectUnitThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Reject Batch Units
            .addCase(rejectBatchUnitsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectBatchUnitsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.rejectSuccess = true;
                state.unitsForVerification = state.unitsForVerification.filter(
                    unit => !action.payload.results.includes(unit._id)
                );
            })
            .addCase(rejectBatchUnitsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get All Units
            .addCase(getAllUnitsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllUnitsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.units = action.payload;
            })
            .addCase(getAllUnitsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get Unit By ID
            .addCase(getUnitByIdThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUnitByIdThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.currentUnit = action.payload;
            })
            .addCase(getUnitByIdThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Unit
            .addCase(updateUnitThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUnitThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.updateSuccess = true;
                state.currentUnit = action.payload;
                state.units = state.units.map(unit =>
                    unit._id === action.payload._id ? action.payload : unit
                );
            })
            .addCase(updateUnitThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Conversion
            .addCase(updateConversionThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateConversionThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.conversionSuccess = true;
                state.currentUnit = action.payload;
            })
            .addCase(updateConversionThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
           
        
            // Get Unit Conversions
            .addCase(getUnitConversionsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUnitConversionsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.conversions = action.payload;
            })
            .addCase(getUnitConversionsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getUnitsByTypeThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.unitsByType = [];
            })
            .addCase(getUnitsByTypeThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.unitsByType = action.payload;
                state.error = null;
            })
            .addCase(getUnitsByTypeThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.unitsByType = [];
            });
    }
});

export const {
    resetUnitState,
    resetCreateSuccess,
    resetBulkUploadSuccess,
    resetVerifySuccess,
    resetRejectSuccess,
    resetUpdateSuccess,
    resetConversionSuccess,
} = unitSlice.actions;

export default unitSlice.reducer;