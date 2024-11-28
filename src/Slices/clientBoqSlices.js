// src/redux/slices/boqSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    createBOQ,
    fetchBOQsForVerification,
    updateBOQStatus,
    rejectBOQ,
    getAllBOQs,
    getAcceptedBOQs,
    getChecklists,
    createChecklist,
    getChecklistById,
    addChecklistItems,
    updateChecklist,
    deleteChecklist,
} from '../api/clientBoqAPI';

// Create BOQ
export const createNewBOQ = createAsyncThunk(
    'boq/createNew',
    async (boqData, { rejectWithValue }) => {
        try {
            const response = await createBOQ(boqData);
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

// Fetch BOQs for verification
export const fetchVerificationBOQs = createAsyncThunk(
    'boq/fetchForVerification',
    async (userRoleId, { rejectWithValue }) => {
        try {
            const response = await fetchBOQsForVerification(userRoleId);
            return response.boqs;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

// Update BOQ status
// In your boqSlice.js
export const updateBOQThunk = createAsyncThunk(
    'boq/updateStatus',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            console.log('Thunk received data:', {
                id,
                formData
            });

            // Make sure formData is a plain object, not FormData
            const response = await updateBOQStatus(id, formData);
            console.log('Thunk response:', response);
            return response;
        } catch (error) {
            console.error('Thunk error:', error);
            return rejectWithValue({
                message: error.response?.data?.message || error.message,
                code: error.response?.data?.code || 'UNKNOWN_ERROR'
            });
        }
    }
);
// Reject BOQ
export const rejectBOQThunk = createAsyncThunk(
    'boq/reject',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await rejectBOQ(id, remarks);
            return { ...response, _id: id }; // Include the _id for state updates
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

// Fetch all BOQs
export const fetchAllBOQs = createAsyncThunk(
    'boq/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllBOQs();
            return response.boqs;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

// Fetch accepted BOQs
export const fetchAcceptedBOQs = createAsyncThunk(
    'boq/fetchAccepted',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAcceptedBOQs();
            console.log('Full API Response:', response);
            
            // Since response is directly the array we want, just return it
            return response;
        } catch (error) {
            console.error('Error in fetchAcceptedBOQs:', error);
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

//fetch chcek list
export const fetchChecklists = createAsyncThunk(
    'boq/fetchChecklists',
    async (category = null, { rejectWithValue }) => {
        try {
            const response = await getChecklists(category);
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const createNewChecklist = createAsyncThunk(
    'boq/createChecklist',
    async (checklistData, { rejectWithValue }) => {
        try {
            const response = await createChecklist(checklistData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchChecklistById = createAsyncThunk(
    'boq/fetchChecklistById',
    async (checklistId, { rejectWithValue }) => {
        try {
            const response = await getChecklistById(checklistId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const addChecklistItemsThunk = createAsyncThunk(
    'boq/addChecklistItems',
    async ({ checklistId, items }, { rejectWithValue }) => {
        try {
            const response = await addChecklistItems(checklistId, items);
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const updateChecklistThunk = createAsyncThunk(
    'boq/updateChecklist',
    async ({id, updateData }, { rejectWithValue }) => {
        try {
            const response = await updateChecklist(id, updateData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const deleteChecklistThunk = createAsyncThunk(
    'boq/deleteChecklist',
    async (checklistId, { rejectWithValue }) => {
        try {
            const response = await deleteChecklist(checklistId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

const boqSlice = createSlice({
    name: 'boq',
    initialState: {
        boqs: [],
        acceptedBOQs: [],
        boqsForVerification: [],
        currentBOQ: null,
        checklists: [],
        currentChecklist: null,
        loading: false,
        error: null,
        success: false,
        rejectSuccess: false,
        updateSuccess: false,
        checklistLoading: false,
        checklistError: null,
        checklistSuccess: false,
    },
    reducers: {
        resetBOQState: (state) => {
            state.currentBOQ = null;
            state.loading = false;
            state.success = false;
            state.error = null;
        },
        resetRejectSuccess: (state) => {
            state.rejectSuccess = false;
        },
        resetUpdateSuccess: (state) => {
            state.updateSuccess = false;
        },
        resetChecklistState: (state) => {
            state.checklistSuccess = false;
            state.checklistError = null;
            state.checklistLoading = false;
        },
        setCurrentChecklist: (state, action) => {
            state.currentChecklist = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create BOQ
            .addCase(createNewBOQ.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createNewBOQ.fulfilled, (state, action) => {
                state.loading = false;
                state.boqs.push(action.payload);
                state.currentBOQ = action.payload;
                state.success = true;
            })
            .addCase(createNewBOQ.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch BOQs for Verification
            .addCase(fetchVerificationBOQs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVerificationBOQs.fulfilled, (state, action) => {
                state.loading = false;
                state.boqsForVerification = action.payload;
            })
            .addCase(fetchVerificationBOQs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update BOQ Status
            .addCase(updateBOQThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBOQThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.updateSuccess = true;
                state.boqsForVerification = state.boqsForVerification.filter(
                    boq => boq._id !== action.payload._id
                );
            })
            .addCase(updateBOQThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Reject BOQ
            .addCase(rejectBOQThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectBOQThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.rejectSuccess = true;
                const index = state.boqsForVerification.findIndex(
                    boq => boq._id === action.payload._id
                );
                if (index !== -1) {
                    state.boqsForVerification.splice(index, 1);
                }
            })
            .addCase(rejectBOQThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch All BOQs
            .addCase(fetchAllBOQs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllBOQs.fulfilled, (state, action) => {
                state.loading = false;
                state.boqs = action.payload;
            })
            .addCase(fetchAllBOQs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Accepted BOQs
            .addCase(fetchAcceptedBOQs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
          
            .addCase(fetchAcceptedBOQs.fulfilled, (state, action) => {
                state.loading = false;
                state.acceptedBOQs = Array.isArray(action.payload) ? action.payload : [];
                console.log('Updated acceptedBOQs state:', state.acceptedBOQs);
            })

            // Fetch Checklists
            .addCase(fetchChecklists.pending, (state) => {
                state.checklistLoading = true;
                state.checklistError = null;
            })
            .addCase(fetchChecklists.fulfilled, (state, action) => {
                state.checklistLoading = false;
                state.checklists = action.payload;
            })
            .addCase(fetchChecklists.rejected, (state, action) => {
                state.checklistLoading = false;
                state.checklistError = action.payload;
            })

            // Create New Checklist
            .addCase(createNewChecklist.pending, (state) => {
                state.checklistLoading = true;
                state.checklistError = null;
            })
            .addCase(createNewChecklist.fulfilled, (state, action) => {
                state.checklistLoading = false;
                state.checklistSuccess = true;
                state.checklists.push(action.payload);
                state.currentChecklist = action.payload;
            })
            .addCase(createNewChecklist.rejected, (state, action) => {
                state.checklistLoading = false;
                state.checklistError = action.payload;
            })

            // Fetch Checklist By ID
            .addCase(fetchChecklistById.pending, (state) => {
                state.checklistLoading = true;
                state.checklistError = null;
            })
            .addCase(fetchChecklistById.fulfilled, (state, action) => {
                state.checklistLoading = false;
                state.currentChecklist = action.payload;
            })
            .addCase(fetchChecklistById.rejected, (state, action) => {
                state.checklistLoading = false;
                state.checklistError = action.payload;
            })

            // Add Checklist Items
            .addCase(addChecklistItemsThunk.pending, (state) => {
                state.checklistLoading = true;
                state.checklistError = null;
            })
            .addCase(addChecklistItemsThunk.fulfilled, (state, action) => {
                state.checklistLoading = false;
                state.checklistSuccess = true;
                if (state.currentChecklist?._id === action.payload._id) {
                    state.currentChecklist = action.payload;
                }
                const index = state.checklists.findIndex(
                    checklist => checklist._id === action.payload._id
                );
                if (index !== -1) {
                    state.checklists[index] = action.payload;
                }
            })
            .addCase(addChecklistItemsThunk.rejected, (state, action) => {
                state.checklistLoading = false;
                state.checklistError = action.payload;
            })

            // Update Checklist
            .addCase(updateChecklistThunk.pending, (state) => {
                state.checklistLoading = true;
                state.checklistError = null;
            })
            .addCase(updateChecklistThunk.fulfilled, (state, action) => {
                state.checklistLoading = false;
                state.checklistSuccess = true;
                if (state.currentChecklist?._id === action.payload._id) {
                    state.currentChecklist = action.payload;
                }
                const index = state.checklists.findIndex(
                    checklist => checklist._id === action.payload._id
                );
                if (index !== -1) {
                    state.checklists[index] = action.payload;
                }
            })
            .addCase(updateChecklistThunk.rejected, (state, action) => {
                state.checklistLoading = false;
                state.checklistError = action.payload;
            })

            // Delete Checklist
            .addCase(deleteChecklistThunk.pending, (state) => {
                state.checklistLoading = true;
                state.checklistError = null;
            })
            .addCase(deleteChecklistThunk.fulfilled, (state, action) => {
                state.checklistLoading = false;
                state.checklistSuccess = true;
                state.checklists = state.checklists.filter(
                    checklist => checklist._id !== action.payload._id
                );
                if (state.currentChecklist?._id === action.payload._id) {
                    state.currentChecklist = null;
                }
            })
            .addCase(deleteChecklistThunk.rejected, (state, action) => {
                state.checklistLoading = false;
                state.checklistError = action.payload;
            });
    }
});

export const {
    resetBOQState,
    resetRejectSuccess,
    resetUpdateSuccess,
    resetChecklistState,
    setCurrentChecklist
} = boqSlice.actions;

export default boqSlice.reducer;