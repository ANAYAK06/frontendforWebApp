import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { processTrackingQuery, getDocumentStatus } from '../api/trackingAPI';

// Thunk for processing natural language queries
export const processQuery = createAsyncThunk(
  'tracking/processQuery',
  async (query, { rejectWithValue }) => {
    try {
      const response = await processTrackingQuery(query);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to process query');
    }
  }
);

// Thunk for getting document status directly
export const fetchDocumentStatus = createAsyncThunk(
  'tracking/fetchDocumentStatus',
  async ({ documentType, referenceId }, { rejectWithValue }) => {
    try {
      const response = await getDocumentStatus(documentType, referenceId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch document status');
    }
  }
);

const trackingSlice = createSlice({
  name: 'tracking',
  initialState: {
    currentStatus: null,
    loading: {
      status: false,
      query: false
    },
    error: null,
    suggestions: []
  },
  reducers: {
    clearStatus: (state) => {
      state.currentStatus = null;
      state.error = null;
      state.suggestions = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Process Query cases
      .addCase(processQuery.pending, (state) => {
        state.loading.query = true;
        state.error = null;
      })
      .addCase(processQuery.fulfilled, (state, action) => {
        state.loading.query = false;
        if (action.payload.success) {
          if (action.payload.type === 'tracking') {
            state.currentStatus = action.payload.data;
          }
          state.suggestions = action.payload.suggestions || [];
          state.error = null;
        } else {
          state.error = action.payload.message;
          state.suggestions = action.payload.suggestions || [];
        }
      })
      .addCase(processQuery.rejected, (state, action) => {
        state.loading.query = false;
        state.error = action.payload || 'An error occurred';
        state.suggestions = [];
      })
      
      // Fetch Document Status cases
      .addCase(fetchDocumentStatus.pending, (state) => {
        state.loading.status = true;
        state.error = null;
      })
      .addCase(fetchDocumentStatus.fulfilled, (state, action) => {
        state.loading.status = false;
        if (action.payload.success) {
          state.currentStatus = action.payload.data;
          state.error = null;
        } else {
          state.error = action.payload.message;
        }
      })
      .addCase(fetchDocumentStatus.rejected, (state, action) => {
        state.loading.status = false;
        state.error = action.payload || 'Failed to fetch document status';
      });
  }
});

export const { clearStatus } = trackingSlice.actions;
export default trackingSlice.reducer;