import Spinner from './Spinner.jsx';

/** Centered full-viewport loader shown during session bootstrap. */
const FullScreenLoader = ({ label = 'Loading…' }) => (
  <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-950">
    <Spinner className="h-8 w-8 text-brand-600" />
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
  </div>
);

export default FullScreenLoader;
