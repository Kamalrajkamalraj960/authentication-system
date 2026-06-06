import { createSlice } from '@reduxjs/toolkit';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshSession,
  fetchCurrentUser,
} from './authThunks.js';

/**
 * Auth slice. Holds the authenticated user, the in-memory access token, and
 * status flags. `bootstrapped` tracks whether the initial session-hydration
 * attempt has finished — used to avoid redirect flicker on first paint.
 */
const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  bootstrapped: false,
  error: null,
};

const setAuthed = (state, { user, accessToken }) => {
  state.user = user ?? state.user;
  if (accessToken !== undefined) state.accessToken = accessToken;
  state.isAuthenticated = true;
  state.loading = false;
  state.error = null;
};

const clearAuth = (state) => {
  state.user = null;
  state.accessToken = null;
  state.isAuthenticated = false;
  state.loading = false;
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Used by the axios bridge after a silent refresh.
    tokenRefreshed(state, action) {
      state.accessToken = action.payload.accessToken;
      if (action.payload.user) state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    forceLogout(state) {
      clearAuth(state);
      state.bootstrapped = true;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // register (does not authenticate — email verification first)
      .addCase(registerUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(registerUser.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(registerUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // login
      .addCase(loginUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(loginUser.fulfilled, (s, a) => setAuthed(s, a.payload))
      .addCase(loginUser.rejected, (s, a) => {
        clearAuth(s);
        s.error = a.payload;
      })

      // logout
      .addCase(logoutUser.fulfilled, (s) => clearAuth(s))
      .addCase(logoutUser.rejected, (s) => clearAuth(s))

      // refresh
      .addCase(refreshSession.fulfilled, (s, a) => setAuthed(s, a.payload))
      .addCase(refreshSession.rejected, (s) => clearAuth(s))

      // bootstrap (fetch current user on load)
      .addCase(fetchCurrentUser.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (s, a) => {
        setAuthed(s, { user: a.payload.user });
        s.bootstrapped = true;
      })
      .addCase(fetchCurrentUser.rejected, (s) => {
        clearAuth(s);
        s.bootstrapped = true;
      });
  },
});

export const { tokenRefreshed, forceLogout, clearError } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';

export default authSlice.reducer;
