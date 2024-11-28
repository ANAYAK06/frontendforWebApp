import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    createBusinessOpportunity,
    fetchOpportunitiesForVerification,
    updateOpportunityStatus,
    rejectOpportunity,
    getAllOpportunities,
    getAllAcceptedOppertunity
} from '../api/businessOppertunityAPI';

export const createNewOpportunity = createAsyncThunk(
    'businessOpportunity/createNew',
    async (opportunityData, { rejectWithValue }) => {
        try {
            const response = await createBusinessOpportunity(opportunityData);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchVerificationOpportunities = createAsyncThunk(
    'businessOpportunity/fetchForVerification',
    async (userRoleId, { rejectWithValue }) => {
        try {
            const response = await fetchOpportunitiesForVerification(userRoleId);
            return response.opportunities;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const updateOpportunityThunk = createAsyncThunk(
    'businessOpportunity/updateStatus',
    async ({ id, updateData }, { rejectWithValue }) => {
        try {
            const response = await updateOpportunityStatus(id, updateData);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const rejectOpportunityThunk = createAsyncThunk(
    'businessOpportunity/reject',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await rejectOpportunity(id, remarks);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchAllOpportunities = createAsyncThunk(
    'businessOpportunity/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllOpportunities();
            return response.opportunities;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchAllAcceptedOppertunity = createAsyncThunk(
    'businessOpportunity/fetchAccepted',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllAcceptedOppertunity();
            return response.opportunities;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

const businessOpportunitySlice = createSlice({
    name: 'businessOpportunity',
    initialState: {
        opportunities: [],
        acceptedOppertunities:[],
        opportunitiesForVerification: [],
        currentOpportunity: null,
        loading: false,
        error: null,
        success: false,
        rejectSuccess: false,
        updateSuccess: false
    },
    reducers: {
        resetOpportunityState: (state) => {
            state.currentOpportunity = null;
            state.loading = false;
            state.success = false;
            state.error = null;
        },
        resetRejectSuccess: (state) => {
            state.rejectSuccess = false;
        },
        resetUpdateSuccess: (state) => {
            state.updateSuccess = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Business Opportunity
            .addCase(createNewOpportunity.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createNewOpportunity.fulfilled, (state, action) => {
                state.loading = false;
                state.opportunities.push(action.payload);
                state.currentOpportunity = action.payload;
                state.success = true;
            })
            .addCase(createNewOpportunity.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Opportunities for Verification
            .addCase(fetchVerificationOpportunities.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVerificationOpportunities.fulfilled, (state, action) => {
                state.loading = false;
                state.opportunitiesForVerification = action.payload;
            })
            .addCase(fetchVerificationOpportunities.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Opportunity Status
            .addCase(updateOpportunityThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOpportunityThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.updateSuccess = true;
                state.opportunitiesForVerification = state.opportunitiesForVerification.filter(
                    opportunity => opportunity._id !== action.payload._id
                );
            })
            .addCase(updateOpportunityThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Reject Opportunity
            .addCase(rejectOpportunityThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectOpportunityThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.rejectSuccess = true;
                const index = state.opportunitiesForVerification.findIndex(
                    opportunity => opportunity._id === action.payload._id
                );
                if (index !== -1) {
                    state.opportunitiesForVerification.splice(index, 1);
                }
            })
            .addCase(rejectOpportunityThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch All Opportunities
            .addCase(fetchAllOpportunities.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllOpportunities.fulfilled, (state, action) => {
                state.loading = false;
                state.opportunities = action.payload;
            })
            .addCase(fetchAllOpportunities.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            //fetch all accepted oppertunities
            .addCase(fetchAllAcceptedOppertunity.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllAcceptedOppertunity.fulfilled, (state, action) => {
                state.loading = false;
                state.acceptedOppertunities = action.payload;

               
            })
            .addCase(fetchAllAcceptedOppertunity.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const {
    resetOpportunityState,
    resetRejectSuccess,
    resetUpdateSuccess
} = businessOpportunitySlice.actions;

export default businessOpportunitySlice.reducer;