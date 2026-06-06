import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import userReducer from '../features/user/userSlice.js';
import uiReducer from '../features/ui/uiSlice.js';
import { configureAuthBridge } from '../api/axios.js';
import { tokenRefreshed, forceLogout } from '../features/auth/authSlice.js';

/**
 * Redux store. Three slices: auth (session), user (profile), ui (theme).
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    ui: uiReducer,
  },
  middleware: (getDefault) => getDefault({ serializableCheck: { warnAfter: 128 } }),
  devTools: import.meta.env.MODE !== 'production',
});

/**
 * Wire the axios instance to the store so interceptors can read the in-memory
 * access token and dispatch on silent refresh / auth failure. Done here to
 * avoid a circular import between the store and the axios module.
 */
configureAuthBridge({
  getToken: () => store.getState().auth.accessToken,
  setToken: (accessToken, user) => store.dispatch(tokenRefreshed({ accessToken, user })),
  onLogout: () => store.dispatch(forceLogout()),
});

export default store;
