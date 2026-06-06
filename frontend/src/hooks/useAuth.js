import { useSelector } from 'react-redux';
import { selectAuth, selectIsAdmin } from '../features/auth/authSlice.js';

/** Convenience hook exposing the auth slice + derived flags. */
export const useAuth = () => {
  const auth = useSelector(selectAuth);
  const isAdmin = useSelector(selectIsAdmin);
  return { ...auth, isAdmin };
};

export default useAuth;
