import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { resetPassword } from '../features/auth/authThunks.js';
import { resetPasswordSchema } from '../utils/validationSchemas.js';
import FormInput from '../components/form/FormInput.jsx';
import Spinner from '../components/common/Spinner.jsx';

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async ({ password }) => {
    const result = await dispatch(resetPassword({ token, password }));
    if (resetPassword.fulfilled.match(result)) {
      toast.success('Password reset! Please sign in.');
      navigate('/login');
    } else {
      toast.error(result.payload || 'Reset failed');
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Invalid reset link</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This link is missing its token or has expired.
        </p>
        <Link to="/forgot-password" className="btn-primary mt-6 inline-flex">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Set a new password</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Choose a strong password you haven&apos;t used before.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <FormInput
          id="password"
          type="password"
          label="New password"
          autoComplete="new-password"
          placeholder="••••••••"
          hint="8+ chars with upper, lower & a number"
          error={errors.password?.message}
          {...register('password')}
        />
        <FormInput
          id="confirmPassword"
          type="password"
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? <Spinner /> : 'Reset password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
