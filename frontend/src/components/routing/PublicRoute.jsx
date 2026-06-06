import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import FullScreenLoader from '../common/FullScreenLoader.jsx';

/**
 * Guards public-only routes (login, register, forgot/reset password). If the
 * user is already authenticated, redirect them away to the dashboard (or back
 * to the page they originally requested).
 */
const PublicRoute = () => {
  const { isAuthenticated, bootstrapped } = useAuth();
  const location = useLocation();

  if (!bootstrapped) return <FullScreenLoader />;

  if (isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
