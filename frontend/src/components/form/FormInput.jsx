import { forwardRef, useState } from 'react';

/**
 * Accessible labelled input integrating with react-hook-form via forwardRef.
 * Supports a password visibility toggle when type="password".
 */
const FormInput = forwardRef(
  ({ label, id, type = 'text', error, hint, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (show ? 'text' : 'password') : type;

    return (
      <div>
        {label && (
          <label htmlFor={id} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={id}
            ref={ref}
            type={inputType}
            className={`input ${error ? 'input-error' : ''} ${isPassword ? 'pr-11' : ''}`}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              tabIndex={-1}
              aria-label={show ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              {show ? '🙈' : '👁️'}
            </button>
          )}
        </div>
        {error ? (
          <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : (
          hint && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
export default FormInput;
