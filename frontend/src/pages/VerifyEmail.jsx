import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { verifyEmail } from '../features/auth/authThunks.js';
import Spinner from '../components/common/Spinner.jsx';

/** Email-verification landing page hit from the link in the email. */
const VerifyEmail = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard against React 18 StrictMode double-invoke
    ran.current = true;

    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing.');
      return;
    }

    (async () => {
      const result = await dispatch(verifyEmail({ token }));
      if (verifyEmail.fulfilled.match(result)) {
        setStatus('success');
        setMessage(result.payload || 'Your email has been verified.');
      } else {
        setStatus('error');
        setMessage(result.payload || 'Verification failed.');
      }
    })();
  }, [dispatch, token]);

  const content = {
    verifying: { icon: <Spinner className="h-8 w-8 text-brand-600" />, title: 'Verifying your email…' },
    success: { icon: '✅', title: 'Email verified!' },
    error: { icon: '❌', title: 'Verification failed' },
  }[status];

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center text-3xl">
          {content.icon}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{content.title}</h1>
        {message && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>}
        {status !== 'verifying' && (
          <Link to="/login" className="btn-primary mt-6 inline-flex">
            Continue to sign in
          </Link>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
