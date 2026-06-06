import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { forgotPassword } from '../features/auth/authThunks.js';
import { forgotPasswordSchema } from '../utils/validationSchemas.js';
import FormInput from '../components/form/FormInput.jsx';
import Spinner from '../components/common/Spinner.jsx';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async ({ email }) => {
    const result = await dispatch(forgotPassword({ email }));
    if (forgotPassword.fulfilled.match(result)) {
      setSent(true);
    } else {
      toast.error(result.payload || 'Request failed');
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl dark:bg-green-900/30">
          ✉️
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Check your inbox</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          If an account exists for that email, we&apos;ve sent a password-reset link. It expires in
          1 hour.
        </p>
        <Link to="/login" className="btn-secondary mt-6 inline-flex">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Forgot password?</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <FormInput
          id="email"
          type="email"
          label="Email address"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? <Spinner /> : 'Send reset link'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Remembered it?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
