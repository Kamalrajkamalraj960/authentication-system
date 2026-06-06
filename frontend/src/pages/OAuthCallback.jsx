import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { tokenRefreshed } from '../features/auth/authSlice.js';
import { fetchCurrentUser } from '../features/auth/authThunks.js';
import FullScreenLoader from '../components/common/FullScreenLoader.jsx';

/**
 * Landing page for the Google OAuth redirect. The backend set httpOnly cookies
 * and appended the access token in the URL fragment (#token=...). We adopt the
 * token, hydrate the user, then clean the URL and route to the dashboard.
 */
const OAuthCallback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const token = params.get('token');

    (async () => {
      if (token) dispatch(tokenRefreshed({ accessToken: token }));
      const result = await dispatch(fetchCurrentUser());
      if (fetchCurrentUser.fulfilled.match(result)) {
        toast.success('Signed in with Google');
        navigate('/dashboard', { replace: true });
      } else {
        toast.error('Google sign-in failed');
        navigate('/login', { replace: true });
      }
    })();
  }, [dispatch, navigate]);

  return <FullScreenLoader label="Completing sign-in…" />;
};

export default OAuthCallback;
