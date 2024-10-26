

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchDashboardPreferences, saveDashboardPreferences } from '../api/dasboardAPI';

export const fetchPreferences = createAsyncThunk(
  'dashboardPreference/fetchPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchDashboardPreferences();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const savePreferences = createAsyncThunk(
  'dashboardPreference/savePreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await saveDashboardPreferences(preferences);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const dashboardPreferenceSlice = createSlice({
  name: 'dashboardPreference',
  initialState: {
    preferences: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPreferences.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = action.payload.components;
      })
      .addCase(fetchPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(savePreferences.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(savePreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = action.payload.components;
      })
      .addCase(savePreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardPreferenceSlice.reducer;