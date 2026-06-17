import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Fetch settings
export const fetchSettings = createAsyncThunk(
  'admin/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/settings');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Update settings
export const updateSettings = createAsyncThunk(
  'admin/updateSettings',
  async (settingsData, { rejectWithValue }) => {
    try {
      const response = await api.put('/admin/settings', settingsData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Fetch admin profile
export const fetchAdminProfile = createAsyncThunk(
  'admin/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/profile');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Update admin profile
export const updateAdminProfile = createAsyncThunk(
  'admin/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/admin/profile', profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    settings: null,
    profile: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch settings
      .addCase(fetchSettings.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSettings.fulfilled, (state, action) => { state.loading = false; state.settings = action.payload; })
      .addCase(fetchSettings.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Update settings
      .addCase(updateSettings.pending, (state) => { state.loading = true; })
      .addCase(updateSettings.fulfilled, (state, action) => { state.loading = false; state.settings = action.payload; })
      .addCase(updateSettings.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Fetch profile
      .addCase(fetchAdminProfile.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminProfile.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload; })
      .addCase(fetchAdminProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Update profile
      .addCase(updateAdminProfile.pending, (state) => { state.loading = true; })
      .addCase(updateAdminProfile.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload; })
      .addCase(updateAdminProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;