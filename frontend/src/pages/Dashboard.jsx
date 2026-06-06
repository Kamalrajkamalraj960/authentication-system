import { useAuth } from '../hooks/useAuth.js';

const StatCard = ({ label, value, icon }) => (
  <div className="card flex items-center gap-4">
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl dark:bg-brand-900/30">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';

  const fmt = (d) => (d ? new Date(d).toLocaleString() : '—');

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {firstName} 👋</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Here&apos;s an overview of your account.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Role" value={user?.role} icon="🛡️" />
        <StatCard
          label="Email status"
          value={user?.isEmailVerified ? 'Verified' : 'Unverified'}
          icon={user?.isEmailVerified ? '✅' : '⚠️'}
        />
        <StatCard label="Sign-in method" value={user?.provider} icon="🔑" />
        <StatCard label="Total logins" value={user?.loginCount ?? 0} icon="📊" />
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold">Account details</h2>
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {[
            ['Name', user?.name],
            ['Email', user?.email],
            ['Last login', fmt(user?.lastLogin)],
            ['Member since', fmt(user?.createdAt)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
              <dd className="mt-0.5 text-sm font-medium">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </div>

      {!user?.isEmailVerified && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
          ⚠️ Your email isn&apos;t verified yet. Check your inbox for the verification link to unlock
          all features.
        </div>
      )}
    </div>
  );
};

export default Dashboard;
