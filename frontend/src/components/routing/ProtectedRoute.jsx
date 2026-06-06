import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import FullScreenLoader from '../common/FullScreenLoader.jsx';

/**
 * Guards routes that require authentication. While the initial session
 * hydration is in flight (`!bootstrapped`) we render a loader to avoid
 * bouncing the user to /login before we know their status.
 */
const ProtectedRoute = () => {
  const { isAuthenticated, bootstrapped } = useAuth();
  const location = useLocation();

  if (!bootstrapped) return <FullScreenLoader />;

  if (!isAuthenticated) {
    // Remember where the user wanted to go for post-login redirect.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
