import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { extractErrorMessage } from '../../api/axios.js';

/**
 * Auth async thunks. Each returns a normalized payload on success and a
 * rejected value (error message string) on failure so reducers/UI stay simple.
 */

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', payload);
      return data.data; // { user }
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, 'Registration failed'));
    }
  }
);

export const loginUser = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', payload);
    return data.data; // { user, accessToken }
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err, 'Login failed'));
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
    return true;
  } catch (err) {
    // Even if the server call fails, we clear local state.
    return rejectWithValue(extractErrorMessage(err));
  }
});

export const refreshSession = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/refresh');
      return data.data; // { user, accessToken }
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

/** Hydrate the session on app load using the httpOnly refresh cookie. */
export const fetchCurrentUser = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/me');
      return data.data; // { user }
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      return data.message;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/reset-password', { token, password });
      return data.message;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async ({ token }, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/verify-email', { params: { token } });
      return data.message;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, 'Verification failed'));
    }
  }
);
