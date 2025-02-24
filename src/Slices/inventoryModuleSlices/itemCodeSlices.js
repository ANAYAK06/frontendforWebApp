import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as itemCodeAPI from '../../api/InventoryModuleAPI/itemCodeAPI';


// Base Code Async Thunks
export const createBaseCode = createAsyncThunk(
    'itemCode/createBaseCode',
    async ({ formData, isExcelUpload }, { rejectWithValue }) => {
        try {
            // Ensure data format matches backend expectations
            const requestData = isExcelUpload ? {
                isExcelUpload: 'true',
                data: formData.data,  // This is already stringified
                remarks: formData.remarks,
                type: formData.type
            } : formData;

            const response = await itemCodeAPI.createBaseCode(requestData, isExcelUpload);
            
            if (response.success) {
                return response;
               
            } else {
                return rejectWithValue(response.error || 'Operation failed');
            }
        } catch (error) {
            if (error.response?.data?.error) {
                return rejectWithValue(error.response.data.error);
            }
            return rejectWithValue(error.message || 'Failed to create base code');
        }
    }
);

export const getAllBaseCodes = createAsyncThunk(
    'itemCode/getAllBaseCodes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await itemCodeAPI.getAllBaseCodes();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch base codes');
        }
    }
);

export const getBaseCodeById = createAsyncThunk(
    'itemCode/getBaseCodeById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await itemCodeAPI.getBaseCodeById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch base code details');
        }
    }
);

export const getBaseCodesForVerification = createAsyncThunk(
    'itemCode/getBaseCodesForVerification',
    async ({ userRoleId, type }, { rejectWithValue }) => {
        try {
            const response = await itemCodeAPI.getBaseCodesForVerification(userRoleId, type);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch base codes for verification');
        }
    }
);

export const verifyBaseCode = createAsyncThunk(
    'itemCode/verifyBaseCode',
    async (data, { rejectWithValue }) => {
        try {
            const response = await itemCodeAPI.verifyBaseCode(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to verify base code');
        }
    }
);

export const rejectBaseCode = createAsyncThunk(
    'itemCode/rejectBaseCode',
    async (data, { rejectWithValue }) => {
        try {
            const response = await itemCodeAPI.rejectBaseCode(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to reject base code');
        }
    }
);

// Specification Async Thunks
export const createSpecification = createAsyncThunk(
    'itemCode/createSpecification',
    async ({ formData, isExcelUpload }, { rejectWithValue }) => {
        try {
            // Ensure data format matches backend expectations
            const requestData = isExcelUpload ? {
                isExcelUpload: 'true',
                data: formData.data,  // This is already stringified data from Excel
                remarks: formData.remarks
            } : {
                ...formData,
                isExcelUpload: 'false'
            };

            const response = await itemCodeAPI.createSpecification(requestData, isExcelUpload);
            
            if (response.success) {
                return response;
            } else {
                return rejectWithValue(response.error || 'Operation failed');
            }
        } catch (error) {
            if (error.response?.data?.error) {
                return rejectWithValue(error.response.data.error);
            }
            return rejectWithValue(error.message || 'Failed to create specification');
        }
    }
);

export const getSpecificationsByBaseCode = createAsyncThunk(
    'itemCode/getSpecificationsByBaseCode',
    async (baseCodeId, { rejectWithValue }) => {
        try {
            const response = await itemCodeAPI.getSpecificationsByBaseCode(baseCodeId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch specifications');
        }
    }
);

export const getSpecificationsForVerification = createAsyncThunk(
    'itemCode/getSpecificationsForVerification',
    async ({ userRoleId, type }, { rejectWithValue }) => {
        try {
            console.log('Calling API with:', { userRoleId, type });
            const response = await itemCodeAPI.getSpecificationsForVerification(userRoleId, type);
            console.log('API Response for specifications:', response);
            console.log('Actual data being returned:', response.data);
            return response;
        } catch (error) {
            console.error('Error fetching specifications:', error);
            return rejectWithValue(error.message || 'Failed to fetch specifications for verification');
        }
    }
);

export const verifySpecification = createAsyncThunk(
    'itemCode/verifySpecification',
    async (data, { rejectWithValue }) => {
        try {
            const response = await itemCodeAPI.verifySpecification(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to verify specification');
        }
    }
);

export const rejectSpecification = createAsyncThunk(
    'itemCode/rejectSpecification',
    async (data, { rejectWithValue }) => {
        try {
            const response = await itemCodeAPI.rejectSpecification(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to reject specification');
        }
    }
);

// Search and Full Code Async Thunks
export const getAllItemCodes = createAsyncThunk(
    'itemCode/getAllItemCodes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await itemCodeAPI.getAllItemCodes();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch item codes');
        }
    }
);

export const searchItemCodes = createAsyncThunk(
    'itemCode/searchItemCodes',
    async (params, { rejectWithValue }) => {
        try {
            const response = await itemCodeAPI.searchItemCodes(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to search item codes');
        }
    }
);

// DCA codes for item codes 
export const getDCAForItemCode = createAsyncThunk(
    'itemCode/getDCAForItemCode',
    async (itemType, { rejectWithValue }) => {
        try {
            const response = await itemCodeAPI.getDCAForItemCode(itemType);
            return response
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch DCA codes');
        }
    }
);

export const getSubDCAForItemCode = createAsyncThunk(
    'itemCode/getSubDCAForItemCode',
    async (dcaCode, { rejectWithValue }) => {
        try {
            
            const response = await itemCodeAPI.getSubDCAForItemCode(dcaCode);

            if (response.success) {
                
                return response; 
            } else {
                return rejectWithValue(response.message || 'Failed to fetch SubDCA codes');
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch SubDCA codes');
        }
    }
);

const initialState = {
    // Base Code states
    baseCodes: [],
    baseCodesForVerification: [],
    selectedBaseCode: null,
    
    // Specification statesa
    specifications: [],
    specificationsForVerification: [],
    selectedSpecification: null,
    
    // Search and Full Code states
    allItemCodes: [],
    searchResults: [],
    makes: [], // For cascading dropdowns
    // DCA codes for item codes
    dcaCodes: [],
    subDcaCodes: [],
    loading: {
        createBaseCode: false,
        getAllBaseCodes: false,
        getBaseCodeById: false,
        baseCodeVerification: false,
        verifyBaseCode: false,
        rejectBaseCode: false,
        getDCACodes:false,
        getSubDcaCodes:false,
        createSpecification: false,
        getSpecifications: false,
        specificationVerification: false,
        verifySpecification: false,
        rejectSpecification: false,
        
        getAllItemCodes: false,
        searchItemCodes: false
    },
    error: {
        createBaseCode: null,
        getAllBaseCodes: null,
        getBaseCodeById: null,
        baseCodeVerification: null,
        verifyBaseCode: null,
        rejectBaseCode: null,
        getDCACodes:null,
        getSubDcaCodes:null,
        createSpecification: null,
        getSpecifications: null,
        specificationVerification: null,
        verifySpecification: null,
        rejectSpecification: null,
        
        getAllItemCodes: null,
        searchItemCodes: null
    },
    success: {
        createBaseCode: false,
        verifyBaseCode: false,
        rejectBaseCode: false,
        
        createSpecification: false,
        verifySpecification: false,
        rejectSpecification: false
    }
};

const itemCodeSlice = createSlice({
    name: 'itemCode',
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = initialState.error;
        },
        clearSuccess: (state) => {
            state.success = initialState.success;
        },
        setSelectedBaseCode: (state, action) => {
            state.selectedBaseCode = action.payload;
        },
        setSelectedSpecification: (state, action) => {
            state.selectedSpecification = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Base Code reducers
            .addCase(createBaseCode.pending, (state) => {
                state.loading.createBaseCode = true;
                state.error.createBaseCode = null;
                state.success.createBaseCode = false;
            })
            .addCase(createBaseCode.fulfilled, (state, action) => {
                state.loading.createBaseCode = false;
                state.success.createBaseCode = true;
                if (Array.isArray(action.payload)) {
                    state.baseCodes.push(...action.payload);
                } else {
                    state.baseCodes.push(action.payload);
                }
            })
            .addCase(createBaseCode.rejected, (state, action) => {
                state.loading.createBaseCode = false;
                state.error.createBaseCode = action.payload;
                state.success.createBaseCode = false;
            })
            
            .addCase(getAllBaseCodes.pending, (state) => {
                state.loading.getAllBaseCodes = true;
                state.error.getAllBaseCodes = null;
            })
            .addCase(getAllBaseCodes.fulfilled, (state, action) => {
                state.loading.getAllBaseCodes = false;
                state.baseCodes = action.payload;
            })
            .addCase(getAllBaseCodes.rejected, (state, action) => {
                state.loading.getAllBaseCodes = false;
                state.error.getAllBaseCodes = action.payload;
            })
        
            // Get Base Code By ID
            .addCase(getBaseCodeById.pending, (state) => {
                state.loading.getBaseCodeById = true;
                state.error.getBaseCodeById = null;
                state.selectedBaseCode = null;
            })
            .addCase(getBaseCodeById.fulfilled, (state, action) => {
                state.loading.getBaseCodeById = false;
                state.selectedBaseCode = action.payload;
            })
            .addCase(getBaseCodeById.rejected, (state, action) => {
                state.loading.getBaseCodeById = false;
                state.error.getBaseCodeById = action.payload;
            })
        
            // Get Base Codes for Verification
            .addCase(getBaseCodesForVerification.pending, (state) => {
                state.loading.baseCodeVerification = true;
                state.error.baseCodeVerification = null;
            })
            .addCase(getBaseCodesForVerification.fulfilled, (state, action) => {
                state.loading.baseCodeVerification = false;
                state.baseCodesForVerification = action.payload;
            })
            .addCase(getBaseCodesForVerification.rejected, (state, action) => {
                state.loading.baseCodeVerification = false;
                state.error.baseCodeVerification = action.payload;
            })
        
            // Verify Base Code (Single/Batch)
            .addCase(verifyBaseCode.pending, (state) => {
                state.loading.verifyBaseCode = true;
                state.error.verifyBaseCode = null;
                state.success.verifyBaseCode = false;
            })
            .addCase(verifyBaseCode.fulfilled, (state, action) => {
                state.loading.verifyBaseCode = false;
                state.success.verifyBaseCode = true;
                
                // Handle both single and batch verification
                if (action.payload.results) {
                    // Batch verification
                    const successIds = action.payload.results.success.map(item => item.id);
                    state.baseCodesForVerification = state.baseCodesForVerification.filter(
                        code => !successIds.includes(code._id)
                    );
                } else {
                    // Single verification
                    state.baseCodesForVerification = state.baseCodesForVerification.filter(
                        code => code._id !== action.payload.data._id
                    );
                }
            })
            .addCase(verifyBaseCode.rejected, (state, action) => {
                state.loading.verifyBaseCode = false;
                state.error.verifyBaseCode = action.payload;
                state.success.verifyBaseCode = false;
            })
        
            // Reject Base Code (Single/Batch)
            .addCase(rejectBaseCode.pending, (state) => {
                state.loading.rejectBaseCode = true;
                state.error.rejectBaseCode = null;
                state.success.rejectBaseCode = false;
            })
            .addCase(rejectBaseCode.fulfilled, (state, action) => {
                state.loading.rejectBaseCode = false;
                state.success.rejectBaseCode = true;
                
                // Handle both single and batch rejection
                if (action.payload.results) {
                    // Batch rejection
                    const successIds = action.payload.results.success.map(item => item.id);
                    state.baseCodesForVerification = state.baseCodesForVerification.filter(
                        code => !successIds.includes(code._id)
                    );
                } else {
                    // Single rejection
                    state.baseCodesForVerification = state.baseCodesForVerification.filter(
                        code => code._id !== action.payload.data._id
                    );
                }
            })
            .addCase(rejectBaseCode.rejected, (state, action) => {
                state.loading.rejectBaseCode = false;
                state.error.rejectBaseCode = action.payload;
                state.success.rejectBaseCode = false;
            })

            // Specification reducers
            .addCase(createSpecification.pending, (state) => {
                state.loading.createSpecification = true;
                state.error.createSpecification = null;
                state.success.createSpecification = false;
            })
            .addCase(createSpecification.fulfilled, (state, action) => {
                state.loading.createSpecification = false;
                state.success.createSpecification = true;
                if (Array.isArray(action.payload)) {
                    state.specifications.push(...action.payload);
                } else {
                    state.specifications.push(action.payload);
                }
            })
            .addCase(createSpecification.rejected, (state, action) => {
                state.loading.createSpecification = false;
                state.error.createSpecification = action.payload;
                state.success.createSpecification = false;
            })
            
            .addCase(getSpecificationsByBaseCode.pending, (state) => {
                state.loading.getSpecifications = true;
                state.error.getSpecifications = null;
                state.specifications = [];
            })
            .addCase(getSpecificationsByBaseCode.fulfilled, (state, action) => {
                state.loading.getSpecifications = false;
                state.specifications = action.payload.data.specifications;
                if (action.payload.data.baseCode) {
                    state.selectedBaseCode = {
                        baseCode: action.payload.data.baseCode,
                        itemName: action.payload.data.itemName
                    };
                }
            })
            .addCase(getSpecificationsByBaseCode.rejected, (state, action) => {
                state.loading.getSpecifications = false;
                state.error.getSpecifications = action.payload;
            })
        
            // Get Specifications for Verification
            .addCase(getSpecificationsForVerification.pending, (state) => {
                state.loading.specificationVerification = true;
                state.error.specificationVerification = null;
                state.specificationsForVerification =[]
            })
            .addCase(getSpecificationsForVerification.fulfilled, (state, action) => {
                state.loading.specificationVerification = false;
                if (Array.isArray(action.payload)) {
                    state.specificationsForVerification = action.payload;
                } else if (action.payload && action.payload.specifications) {
                    state.specificationsForVerification = action.payload.specifications;
                } else {
                    state.specificationsForVerification = [];
                }
            })
            .addCase(getSpecificationsForVerification.rejected, (state, action) => {
                state.loading.specificationVerification = false;
                state.error.specificationVerification = action.payload;
            })
        
            // Verify Specification
            .addCase(verifySpecification.pending, (state) => {
                state.loading.verifySpecification = true;
                state.error.verifySpecification = null;
                state.success.verifySpecification = false;
            })
            .addCase(verifySpecification.fulfilled, (state, action) => {
                state.loading.verifySpecification = false;
                state.success.verifySpecification = true;
        
                // Handle both single and bulk verification
                if (action.payload.data.results) {
                    // Bulk verification
                    const successIds = action.payload.data.results.success.map(
                        item => item.specificationId
                    );
                    state.specificationsForVerification = state.specificationsForVerification.filter(
                        spec => !successIds.includes(spec.specification._id)
                    );
                } else {
                    // Single verification
                    const verifiedSpecId = action.payload.data._id;
                    state.specificationsForVerification = state.specificationsForVerification.filter(
                        spec => spec.specification._id !== verifiedSpecId
                    );
                    
                    // Update specification status in main specifications array if exists
                    const specIndex = state.specifications.findIndex(s => s._id === verifiedSpecId);
                    if (specIndex !== -1) {
                        state.specifications[specIndex].status = 'Approved';
                    }
                }
            })
            .addCase(verifySpecification.rejected, (state, action) => {
                state.loading.verifySpecification = false;
                state.error.verifySpecification = action.payload;
                state.success.verifySpecification = false;
            })
        
            // Reject Specification
            .addCase(rejectSpecification.pending, (state) => {
                state.loading.rejectSpecification = true;
                state.error.rejectSpecification = null;
                state.success.rejectSpecification = false;
            })
            .addCase(rejectSpecification.fulfilled, (state, action) => {
                state.loading.rejectSpecification = false;
                state.success.rejectSpecification = true;
        
                // Handle both single and bulk rejection
                if (action.payload.data.results) {
                    // Bulk rejection
                    const rejectedIds = action.payload.data.results.success.map(
                        item => item.specificationId
                    );
                    state.specificationsForVerification = state.specificationsForVerification.filter(
                        spec => !rejectedIds.includes(spec.specification._id)
                    );
                } else {
                    // Single rejection
                    const rejectedSpecId = action.payload.data._id;
                    state.specificationsForVerification = state.specificationsForVerification.filter(
                        spec => spec.specification._id !== rejectedSpecId
                    );
                    
                    // Update specification status in main specifications array if exists
                    const specIndex = state.specifications.findIndex(s => s._id === rejectedSpecId);
                    if (specIndex !== -1) {
                        state.specifications[specIndex].status = 'Rejected';
                    }
                }
            })
            .addCase(rejectSpecification.rejected, (state, action) => {
                state.loading.rejectSpecification = false;
                state.error.rejectSpecification = action.payload;
                state.success.rejectSpecification = false;
            })

            // Search and Full Code reducers
            .addCase(searchItemCodes.pending, (state) => {
                state.loading.searchItemCodes = true;
                state.error.searchItemCodes = null;
            })
            .addCase(searchItemCodes.fulfilled, (state, action) => {
                state.loading.searchItemCodes = false;
                state.searchResults = action.payload.data;
                if (action.payload.makes) {
                    state.makes = action.payload.makes;
                }
            })
            .addCase(searchItemCodes.rejected, (state, action) => {
                state.loading.searchItemCodes = false;
                state.error.searchItemCodes = action.payload;
            })
            
            // DCA codes for item codes
            .addCase(getDCAForItemCode.pending, (state) => {
                state.loading.getDCACodes = true;
                state.error.getDCACodes = null;
            })
            .addCase(getDCAForItemCode.fulfilled, (state, action) => {
                state.loading.getDCACodes = false;
                state.dcaCodes = action.payload.data;
                state.error.getDCACodes = null;  // Add this to clear any previous errors
            })
            .addCase(getDCAForItemCode.rejected, (state, action) => {
                state.loading.getDCACodes = false;  // Fixed from dcaCodes to getDCACodes
                state.error.getDCACodes = action.payload;  // Fixed from dcaCodes to getDCACodes
                state.dcaCodes = [];  // Add this to clear data on error
            })
            
            // SubDCA codes for item codes
            .addCase(getSubDCAForItemCode.pending, (state) => {
                state.loading.getSubDcaCodes = true;
                state.error.getSubDcaCodes = null;
            })
            .addCase(getSubDCAForItemCode.fulfilled, (state, action) => {
                state.loading.getSubDcaCodes = false;
                state.subDcaCodes = action.payload.data;
                state.error.getSubDcaCodes = null;  
            })
            .addCase(getSubDCAForItemCode.rejected, (state, action) => {
                state.loading.getSubDcaCodes = false;
                state.error.getSubDcaCodes = action.payload;
                state.subDcaCodes = [];  
            })
           
    }
});

export const { 
    clearErrors, 
    clearSuccess, 
    setSelectedBaseCode, 
    setSelectedSpecification 
} = itemCodeSlice.actions;

export default itemCodeSlice.reducer;