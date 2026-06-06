import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { extractErrorMessage } from '../../api/axios.js';

/**
 * User slice — profile fetching/updating, decoupled from auth/session concerns.
 */

export const fetchProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/users/profile');
      return data.data.user;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.patch('/users/profile', payload);
      return data.data.user;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, 'Update failed'));
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: { profile: null, loading: false, error: null },
  reducers: {
    clearProfile(state) {
      state.profile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchProfile.fulfilled, (s, a) => {
        s.loading = false;
        s.profile = a.payload;
      })
      .addCase(fetchProfile.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      .addCase(updateProfile.pending, (s) => {
        s.loading = true;
      })
      .addCase(updateProfile.fulfilled, (s, a) => {
        s.loading = false;
        s.profile = a.payload;
      })
      .addCase(updateProfile.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

export const { clearProfile } = userSlice.actions;
export const selectProfile = (state) => state.user.profile;
export default userSlice.reducer;
