import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    createClientBOQ,
    getClientBOQsForVerification,
    verifyClientBOQ,
    rejectClientBOQ,
    getAllAcceptedClientBOQs,
    getClientBOQById
} from '../../api/ProjectModuleAPI/clientBoqAPI';

// Create Client BOQ
export const createClientBOQThunk = createAsyncThunk(
    'clientFinalBOQ/create',
    async ({boqData,files}, { rejectWithValue }) => {
        try {
            console.log('Thunk received data:', boqData);
            const response = await createClientBOQ(boqData, files);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Get Client BOQs for Verification
export const getClientBOQsForVerificationThunk = createAsyncThunk(
    'clientFinalBOQ/getForVerification',
    async (userRoleId, { rejectWithValue }) => {
        try {
            const response = await getClientBOQsForVerification(userRoleId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Verify Client BOQ
export const verifyClientBOQThunk = createAsyncThunk(
    'clientFinalBOQ/verify',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            console.log('Verifying with data:', { id, remarks });
            const response = await verifyClientBOQ(id, remarks);
            return response.data;
        } catch (error) {
            console.error('Verification thunk error:', error);
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Reject Client BOQ
export const rejectClientBOQThunk = createAsyncThunk(
    'clientFinalBOQ/reject',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await rejectClientBOQ(id, remarks);
            return { ...response.data, _id: id };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Get All Accepted Client BOQs
export const getAllAcceptedClientBOQsThunk = createAsyncThunk(
    'clientFinalBOQ/getAllAccepted',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllAcceptedClientBOQs();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Get Client BOQ by ID
export const getClientBOQByIdThunk = createAsyncThunk(
    'clientFinalBOQ/getById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await getClientBOQById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const clientBOQSlice = createSlice({
    name: 'clientFinalBOQ',
    initialState: {
        clientFinalBOQs: [],
        finalboqsForVerification: [],
        finalCurrentBOQ: null,
        finalAcceptedBOQs: [],
        loading: false,
        error: null,
        createSuccess: false,
        verifySuccess: false,
        rejectSuccess: false
    },
    reducers: {
        resetClientFinalBOQState: (state) => {
            state.finalCurrentBOQ = null;
            state.loading = false;
            state.error = null;
        },
        resetFinalCreateSuccess: (state) => {
            state.createSuccess = false;
        },
        resetFinalVerifySuccess: (state) => {
            state.verifySuccess = false;
        },
        resetFinalRejectSuccess: (state) => {
            state.rejectSuccess = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Client BOQ
            .addCase(createClientBOQThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createClientBOQThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.createSuccess = true;
                state.finalCurrentBOQ = action.payload;
                state.clientFinalBOQs.push(action.payload);
            })
            .addCase(createClientBOQThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get BOQs for Verification
            .addCase(getClientBOQsForVerificationThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getClientBOQsForVerificationThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.finalboqsForVerification = action.payload;
            })
            .addCase(getClientBOQsForVerificationThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Verify Client BOQ
            .addCase(verifyClientBOQThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyClientBOQThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.verifySuccess = true;
                state.finalboqsForVerification = state.finalboqsForVerification.filter(
                    boq => boq._id !== action.payload._id
                );
            })
            .addCase(verifyClientBOQThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Reject Client BOQ
            .addCase(rejectClientBOQThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectClientBOQThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.rejectSuccess = true;
                state.finalboqsForVerification = state.finalboqsForVerification.filter(
                    boq => boq._id !== action.payload._id
                );
            })
            .addCase(rejectClientBOQThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get All Accepted Client BOQs
            .addCase(getAllAcceptedClientBOQsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllAcceptedClientBOQsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.finalAcceptedBOQs = action.payload;
            })
            .addCase(getAllAcceptedClientBOQsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get Client BOQ by ID
            .addCase(getClientBOQByIdThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getClientBOQByIdThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.finalCurrentBOQ = action.payload;
            })
            .addCase(getClientBOQByIdThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const {
    resetClientFinalBOQState,
    resetFinalCreateSuccess,
    resetFinalVerifySuccess,
    resetFinalRejectSuccess
} = clientBOQSlice.actions;

export default clientBOQSlice.reducer;