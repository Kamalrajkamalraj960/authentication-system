import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
    <p className="text-7xl font-extrabold text-brand-600">403</p>
    <h1 className="mt-4 text-2xl font-bold tracking-tight">Access denied</h1>
    <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
      You don&apos;t have permission to view this page. If you believe this is a mistake, contact an
      administrator.
    </p>
    <Link to="/dashboard" className="btn-primary mt-6">
      Back to dashboard
    </Link>
  </div>
);

export default Unauthorized;
