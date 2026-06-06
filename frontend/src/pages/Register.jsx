import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { registerUser } from '../features/auth/authThunks.js';
import { registerSchema } from '../utils/validationSchemas.js';
import FormInput from '../components/form/FormInput.jsx';
import Spinner from '../components/common/Spinner.jsx';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async ({ name, email, password }) => {
    const result = await dispatch(registerUser({ name, email, password }));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Check your email to verify your account.');
      navigate('/login');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Start building with a secure, scalable auth foundation.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <FormInput
          id="name"
          label="Full name"
          autoComplete="name"
          placeholder="Jane Doe"
          error={errors.name?.message}
          {...register('name')}
        />
        <FormInput
          id="email"
          type="email"
          label="Email address"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <FormInput
          id="password"
          type="password"
          label="Password"
          autoComplete="new-password"
          placeholder="••••••••"
          hint="8+ chars with upper, lower & a number"
          error={errors.password?.message}
          {...register('password')}
        />
        <FormInput
          id="confirmPassword"
          type="password"
          label="Confirm password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? <Spinner /> : 'Create account'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;
