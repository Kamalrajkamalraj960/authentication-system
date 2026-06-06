import { Outlet } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle.jsx';

/**
 * Split-screen layout for unauthenticated pages: a marketing/brand panel on
 * the left (hidden on mobile) and the auth form on the right.
 */
const AuthLayout = () => (
  <div className="flex min-h-screen">
    {/* Brand panel */}
    <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-purple-800 p-12 text-white lg:flex">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 font-bold backdrop-blur">
          A
        </span>
        <span className="text-xl font-bold">AuthPlatform</span>
      </div>
      <div className="relative z-10">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
          Secure authentication,
          <br />
          built for scale.
        </h1>
        <p className="mt-4 max-w-md text-brand-100">
          JWT access &amp; refresh tokens, refresh-token rotation, email verification,
          password reset, and role-based access control — production-ready out of the box.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-brand-50">
          {['Refresh-token rotation & reuse detection', 'Email verification & password reset', 'Role-based authorization', 'Secure httpOnly cookies'].map(
            (item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">✓</span>
                {item}
              </li>
            )
          )}
        </ul>
      </div>
      <p className="relative z-10 text-xs text-brand-200">© 2026 AuthPlatform. All rights reserved.</p>
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-purple-400/20 blur-3xl" />
    </div>

    {/* Form panel */}
    <div className="relative flex w-full items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950 lg:w-1/2">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md animate-fade-in">
        <Outlet />
      </div>
    </div>
  </div>
);

export default AuthLayout;
