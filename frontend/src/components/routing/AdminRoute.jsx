import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import FullScreenLoader from '../common/FullScreenLoader.jsx';

/**
 * Guards admin-only routes. Requires authentication AND the admin role.
 * Authenticated non-admins are sent to /unauthorized (not /login).
 */
const AdminRoute = () => {
  const { isAuthenticated, isAdmin, bootstrapped } = useAuth();

  if (!bootstrapped) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};

export default AdminRoute;
