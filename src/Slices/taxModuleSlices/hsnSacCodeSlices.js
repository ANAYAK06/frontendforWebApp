import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    createHSNCode,
    getHSNForVerification,
    verifyHSNCode,
    rejectHSNCode,
    getAllApprovedHSN,
    editHSNCode,
    getHSNEditsForVerification,
    verifyHSNEdit,
    rejectHSNEdit
} from '../../api/TaxmoduleAPI/hsnSacCodeAPI';

// Create HSN Code
export const createHSNCodeThunk = createAsyncThunk(
    'hsn/create',
    async (hsnData, { rejectWithValue }) => {
        try {
            const response = await createHSNCode(hsnData);
            return response.hsn;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Get HSN Codes for Verification
export const getHSNForVerificationThunk = createAsyncThunk(
    'hsn/getForVerification',
    async (userRoleId, { rejectWithValue }) => {
        try {
            const response = await getHSNForVerification(userRoleId);
            return response.hsn;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Verify HSN Code
export const verifyHSNCodeThunk = createAsyncThunk(
    'hsn/verify',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await verifyHSNCode(id, remarks);
            return { ...response.hsn, _id: id };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Reject HSN Code
export const rejectHSNCodeThunk = createAsyncThunk(
    'hsn/reject',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await rejectHSNCode(id, remarks);
            return { ...response.hsn, _id: id };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Get All Approved HSN Codes
export const getAllApprovedHSNThunk = createAsyncThunk(
    'hsn/getAllApproved',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllApprovedHSN();
            return response.hsn;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Edit HSN Code
export const editHSNCodeThunk = createAsyncThunk(
    'hsn/edit',
    async ({ id, updateData }, { rejectWithValue }) => {
        try {
            const response = await editHSNCode(id, updateData);
            return response.hsn;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Get HSN Edits for Verification
export const getHSNEditsForVerificationThunk = createAsyncThunk(
    'hsn/getEditsForVerification',
    async (userRoleId, { rejectWithValue }) => {
        try {
            const response = await getHSNEditsForVerification(userRoleId);
            return response.hsn;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Verify HSN Edit
export const verifyHSNEditThunk = createAsyncThunk(
    'hsn/verifyEdit',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await verifyHSNEdit(id, remarks);
            return { ...response.hsn, _id: id };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Reject HSN Edit
export const rejectHSNEditThunk = createAsyncThunk(
    'hsn/rejectEdit',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await rejectHSNEdit(id, remarks);
            return { ...response.hsn, _id: id };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const hsnSlice = createSlice({
    name: 'hsnsac',
    initialState: {
        hsnCodes: [],
        hsnForVerification: [],
        hsnEditsForVerification: [],
        approvedHSNCodes: [],
        currentHSN: null,
        loading: false,
        error: null,
        createSuccess: false,
        verifySuccess: false,
        rejectSuccess: false,
        editSuccess: false,
        verifyEditSuccess: false,
        rejectEditSuccess: false
    },
    reducers: {
        resetHSNState: (state) => {
            state.currentHSN = null;
            state.loading = false;
            state.error = null;
        },
        resetCreateSuccess: (state) => {
            state.createSuccess = false;
        },
        resetVerifySuccess: (state) => {
            state.verifySuccess = false;
        },
        resetRejectSuccess: (state) => {
            state.rejectSuccess = false;
        },
        resetEditSuccess: (state) => {
            state.editSuccess = false;
        },
        resetVerifyEditSuccess: (state) => {
            state.verifyEditSuccess = false;
        },
        resetRejectEditSuccess: (state) => {
            state.rejectEditSuccess = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create HSN Code
            .addCase(createHSNCodeThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createHSNCodeThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.createSuccess = true;
                state.currentHSN = action.payload;
                state.hsnCodes.push(action.payload);
            })
            .addCase(createHSNCodeThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get HSN for Verification
            .addCase(getHSNForVerificationThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getHSNForVerificationThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.hsnForVerification = action.payload;
            })
            .addCase(getHSNForVerificationThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Verify HSN Code
            .addCase(verifyHSNCodeThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyHSNCodeThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.verifySuccess = true;
                state.hsnForVerification = state.hsnForVerification.filter(
                    hsn => hsn._id !== action.payload._id
                );
            })
            .addCase(verifyHSNCodeThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get All Approved HSN
            .addCase(getAllApprovedHSNThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllApprovedHSNThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.approvedHSNCodes = action.payload;
            })
            .addCase(getAllApprovedHSNThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Edit HSN Code
            .addCase(editHSNCodeThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(editHSNCodeThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.editSuccess = true;
                state.currentHSN = action.payload;
            })
            .addCase(editHSNCodeThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get HSN Edits for Verification
            .addCase(getHSNEditsForVerificationThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getHSNEditsForVerificationThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.hsnEditsForVerification = action.payload;
            })
            .addCase(getHSNEditsForVerificationThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Verify HSN Edit
            .addCase(verifyHSNEditThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyHSNEditThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.verifyEditSuccess = true;
                state.hsnEditsForVerification = state.hsnEditsForVerification.filter(
                    hsn => hsn._id !== action.payload._id
                );
            })
            .addCase(verifyHSNEditThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Reject HSN Edit
            .addCase(rejectHSNEditThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectHSNEditThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.rejectEditSuccess = true;
                state.hsnEditsForVerification = state.hsnEditsForVerification.filter(
                    hsn => hsn._id !== action.payload._id
                );
            })
            .addCase(rejectHSNEditThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const {
    resetHSNState,
    resetCreateSuccess,
    resetVerifySuccess,
    resetRejectSuccess,
    resetEditSuccess,
    resetVerifyEditSuccess,
    resetRejectEditSuccess
} = hsnSlice.actions;

export default hsnSlice.reducer;