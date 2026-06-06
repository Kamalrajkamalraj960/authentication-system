import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

/** Authenticated app shell: navbar + routed content. */
const AppLayout = () => (
  <div className="min-h-screen">
    <Navbar />
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Outlet />
    </main>
  </div>
);

export default AppLayout;
