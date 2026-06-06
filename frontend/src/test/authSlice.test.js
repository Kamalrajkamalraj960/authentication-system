import { describe, it, expect } from 'vitest';
import authReducer, { tokenRefreshed, forceLogout } from '../features/auth/authSlice.js';
import { loginUser, logoutUser } from '../features/auth/authThunks.js';

describe('authSlice', () => {
  const initial = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    loading: false,
    bootstrapped: false,
    error: null,
  };

  it('returns the initial state', () => {
    expect(authReducer(undefined, { type: '@@INIT' })).toEqual(initial);
  });

  it('authenticates on loginUser.fulfilled', () => {
    const user = { id: '1', name: 'Jane', role: 'user' };
    const state = authReducer(initial, {
      type: loginUser.fulfilled.type,
      payload: { user, accessToken: 'abc' },
    });
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('abc');
    expect(state.user).toEqual(user);
  });

  it('stores the error on loginUser.rejected', () => {
    const state = authReducer(initial, {
      type: loginUser.rejected.type,
      payload: 'Invalid credentials',
    });
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe('Invalid credentials');
  });

  it('updates the token via tokenRefreshed', () => {
    const state = authReducer(initial, tokenRefreshed({ accessToken: 'new', user: { id: '1' } }));
    expect(state.accessToken).toBe('new');
    expect(state.isAuthenticated).toBe(true);
  });

  it('clears state on logout and forceLogout', () => {
    const authed = { ...initial, isAuthenticated: true, accessToken: 'x', user: { id: '1' } };
    expect(authReducer(authed, { type: logoutUser.fulfilled.type }).isAuthenticated).toBe(false);
    const forced = authReducer(authed, forceLogout());
    expect(forced.isAuthenticated).toBe(false);
    expect(forced.bootstrapped).toBe(true);
  });
});
