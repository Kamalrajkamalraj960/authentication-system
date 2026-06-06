import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
    <p className="text-7xl font-extrabold text-brand-600">404</p>
    <h1 className="mt-4 text-2xl font-bold tracking-tight">Page not found</h1>
    <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
      The page you&apos;re looking for doesn&apos;t exist or has been moved.
    </p>
    <Link to="/" className="btn-primary mt-6">
      Go home
    </Link>
  </div>
);

export default NotFound;
