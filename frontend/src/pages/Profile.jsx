import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { updateProfile } from '../features/user/userSlice.js';
import { tokenRefreshed } from '../features/auth/authSlice.js';
import { profileSchema } from '../utils/validationSchemas.js';
import { useAuth } from '../hooks/useAuth.js';
import FormInput from '../components/form/FormInput.jsx';
import Avatar from '../components/common/Avatar.jsx';
import Spinner from '../components/common/Spinner.jsx';

const Profile = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const loading = useSelector((s) => s.user.loading);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', profilePicture: user?.profilePicture || '' },
  });

  useEffect(() => {
    reset({ name: user?.name || '', profilePicture: user?.profilePicture || '' });
  }, [user, reset]);

  const livePicture = watch('profilePicture');

  const onSubmit = async (values) => {
    const result = await dispatch(updateProfile(values));
    if (updateProfile.fulfilled.match(result)) {
      // Keep the auth slice's user (used by the navbar) in sync.
      dispatch(tokenRefreshed({ accessToken: undefined, user: result.payload }));
      toast.success('Profile updated');
      reset(values);
    } else {
      toast.error(result.payload || 'Update failed');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your personal information.
        </p>
      </div>

      <div className="card">
        <div className="mb-6 flex items-center gap-4">
          <Avatar user={{ ...user, profilePicture: livePicture }} size="h-16 w-16" />
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FormInput id="name" label="Full name" error={errors.name?.message} {...register('name')} />
          <FormInput
            id="profilePicture"
            label="Profile picture URL"
            placeholder="https://…"
            error={errors.profilePicture?.message}
            {...register('profilePicture')}
          />
          <FormInput id="email" label="Email" value={user?.email || ''} disabled readOnly />

          <div className="flex justify-end">
            <button type="submit" disabled={loading || !isDirty} className="btn-primary">
              {loading ? <Spinner /> : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
