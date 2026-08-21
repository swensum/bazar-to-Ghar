import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../store/firebaselite'; // adjust path to match your project
import './auth.scss';

/* ---------- Small reusable bits ---------- */

const GoogleIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4c-7.6 0-14.1 4.3-17.4 10.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.5 0 10.4-1.9 14.1-5.1l-6.5-5.4C29.6 35.3 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.8 39.6 16.3 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.5 5.4C39.9 37.2 44 31.4 44 24c0-1.3-.1-2.7-.4-3.5z"
    />
  </svg>
);

type FieldErrorProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
};

const Field: React.FC<FieldErrorProps> = ({ id, label, type = 'text', value, placeholder, error, onChange }) => (
  <div className={`field${error ? ' field--error' : ''}`}>
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
    />
    {error && (
      <span className="field-error" id={`${id}-error`}>
        {error}
      </span>
    )}
  </div>
);

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
};

const PasswordField: React.FC<PasswordFieldProps> = ({ id, label, value, placeholder, error, onChange }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className="field__control">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          className="field__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 3l18 18" strokeLinecap="round" />
              <path d="M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5" strokeLinecap="round" />
              <path
                d="M6.3 6.6C4 8.2 2.3 10.4 1.5 12c1.6 3.4 5.3 6.5 10.5 6.5 1.9 0 3.6-.4 5.1-1.1M17.9 15.7C19.7 14.2 21 12 21 12c-1.9-4-6-6.5-9.5-6.5-1 0-1.9.1-2.8.4"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path
                d="M1.5 12S5 5.5 12 5.5 22.5 12 22.5 12 19 18.5 12 18.5 1.5 12 1.5 12z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="2.6" />
            </svg>
          )}
        </button>
      </div>
      {error && (
        <span className="field-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
};

/* ---------- Validation helpers ---------- */

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

type SignInErrors = { email?: string; password?: string };
type SignUpErrors = { name?: string; email?: string; password?: string; confirmPassword?: string };
type GoogleStatus = 'idle' | 'loading' | 'success' | 'error';

/* ---------- Debug helpers ----------
   Prefixed logs so they're easy to filter in devtools console:
   type "[GAuth]" into the console filter box to see only these. */
const DEBUG = true;
const glog = (...args: unknown[]) => {
  if (DEBUG) console.log('[GAuth]', ...args);
};
const gerror = (...args: unknown[]) => {
  if (DEBUG) console.error('[GAuth]', ...args);
};

/* ---------- Main component ---------- */

const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInErrors, setSignInErrors] = useState<SignInErrors>({});

  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpErrors, setSignUpErrors] = useState<SignUpErrors>({});

  // Google popup sign-in state
  const [googleStatus, setGoogleStatus] = useState<GoogleStatus>('idle');
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Refs used to measure each form's natural height so the container
  // can smoothly resize instead of clipping the taller sign-up form.
  const signInFormRef = useRef<HTMLFormElement>(null);
  const signUpFormRef = useRef<HTMLFormElement>(null);
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const measure = () => {
      const activeForm = isSignUp ? signUpFormRef.current : signInFormRef.current;
      if (activeForm) {
        setContainerHeight(activeForm.offsetHeight);
      }
    };

    measure();

    const ro = new ResizeObserver(measure);
    if (signInFormRef.current) ro.observe(signInFormRef.current);
    if (signUpFormRef.current) ro.observe(signUpFormRef.current);

    return () => ro.disconnect();
  }, [isSignUp]);

  useEffect(() => {
    glog('=== mount ===');
    glog('current URL:', window.location.href);
    glog('firebase auth.config.authDomain:', (auth as any)?.config?.authDomain);
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: SignInErrors = {};
    if (!signInEmail.trim()) errors.email = 'Email is required';
    else if (!isValidEmail(signInEmail)) errors.email = 'Enter a valid email address';

    if (!signInPassword) errors.password = 'Password is required';
    else if (signInPassword.length < 8) errors.password = 'Must be at least 8 characters';

    setSignInErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // TODO: wire up real sign-in logic
    console.log('sign in', { signInEmail, signInPassword });
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: SignUpErrors = {};
    if (!signUpName.trim()) errors.name = 'Name is required';

    if (!signUpEmail.trim()) errors.email = 'Email is required';
    else if (!isValidEmail(signUpEmail)) errors.email = 'Enter a valid email address';

    if (!signUpPassword) errors.password = 'Password is required';
    else if (signUpPassword.length < 8) errors.password = 'Must be at least 8 characters';

    if (!signUpConfirmPassword) errors.confirmPassword = 'Confirm your password';
    else if (signUpConfirmPassword !== signUpPassword) errors.confirmPassword = 'Passwords do not match';

    setSignUpErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // TODO: wire up real sign-up logic
    console.log('sign up', { signUpName, signUpEmail, signUpPassword });
  };

  const handleGoogle = async () => {
    glog('=== handleGoogle: button clicked ===');
    glog('current URL:', window.location.href);

    setGoogleStatus('loading');
    setGoogleError(null);

    try {
      glog('calling signInWithPopup()...');
      const result = await signInWithPopup(auth, googleProvider);
      glog('signInWithPopup() resolved. Raw result:', result);
      glog('SUCCESS — user:', {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
      });
      glog('operationType:', (result as any).operationType);
      glog('providerId:', (result as any).providerId);
      setGoogleStatus('success');
    } catch (err: any) {
      // Common popup-specific codes worth distinguishing in the UI/logs:
      // auth/popup-closed-by-user   -> user closed the popup themselves
      // auth/popup-blocked          -> browser blocked the popup outright
      // auth/cancelled-popup-request-> a second popup was triggered before the first resolved
      // auth/unauthorized-domain    -> localhost (or your domain) not in Firebase authorized domains
      gerror('signInWithPopup() THREW an error:', err);
      gerror('error.code:', err?.code);
      gerror('error.message:', err?.message);
      gerror('error.customData:', err?.customData);

      let friendlyMessage = err?.message ?? 'Something went wrong. Please try again.';
      if (err?.code === 'auth/popup-closed-by-user') {
        friendlyMessage = 'Sign-in popup was closed before completing.';
      } else if (err?.code === 'auth/popup-blocked') {
        friendlyMessage = 'Your browser blocked the sign-in popup. Please allow popups for this site and try again.';
      } else if (err?.code === 'auth/unauthorized-domain') {
        friendlyMessage = 'This domain is not authorized for Google sign-in in the Firebase console.';
      }

      setGoogleError(friendlyMessage);
      setGoogleStatus('error');
    }
  };

  const switchToSignUp = () => {
    setSignInErrors({});
    setIsSignUp(true);
  };

  const switchToSignIn = () => {
    setSignUpErrors({});
    setIsSignUp(false);
  };

  const googleButtonLabel = googleStatus === 'loading' ? 'Signing in…' : 'Continue with Google';

  return (
    <div className="auth-page">
      {googleStatus === 'success' && (
        <div className="auth-banner auth-banner--success" role="status">
          ✅ Google sign in successful
        </div>
      )}
      {googleStatus === 'error' && googleError && (
        <div className="auth-banner auth-banner--error" role="alert">
          {googleError}
        </div>
      )}

      <div
        className={`auth-container${isSignUp ? ' auth-container--active' : ''}`}
        style={containerHeight ? { height: `${containerHeight}px` } : undefined}
      >
        {/* ---------- Sign in ---------- */}
        <div className="form-panel form-panel--sign-in">
          <form ref={signInFormRef} onSubmit={handleSignIn} noValidate>
            <h1>Welcome back</h1>
            <p className="subtitle">Sign in to keep things moving.</p>

            <button
              type="button"
              className="btn-google"
              onClick={handleGoogle}
              disabled={googleStatus === 'loading'}
            >
              <GoogleIcon />
              <span>{googleButtonLabel}</span>
            </button>

            <div className="divider">
              <span>or use your email</span>
            </div>

            <Field
              id="si-email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={signInEmail}
              error={signInErrors.email}
              onChange={(v) => {
                setSignInEmail(v);
                if (signInErrors.email) setSignInErrors((prev) => ({ ...prev, email: undefined }));
              }}
            />

            <PasswordField
              id="si-password"
              label="Password"
              value={signInPassword}
              placeholder="••••••••"
              error={signInErrors.password}
              onChange={(v) => {
                setSignInPassword(v);
                if (signInErrors.password) setSignInErrors((prev) => ({ ...prev, password: undefined }));
              }}
            />

            <a className="forgot" href="#forgot">
              Forgot your password?
            </a>

            <button type="submit" className="btn-primary">
              Sign in
            </button>

            <p className="switch-text">
              Don&apos;t have an account?{' '}
              <button type="button" className="link-btn" onClick={switchToSignUp}>
                Sign up
              </button>
            </p>
          </form>
        </div>

        {/* ---------- Sign up ---------- */}
        <div className="form-panel form-panel--sign-up">
          <form ref={signUpFormRef} onSubmit={handleSignUp} noValidate>
            <h1>Create account</h1>
            <p className="subtitle">Start your workspace in a minute.</p>

            <button
              type="button"
              className="btn-google"
              onClick={handleGoogle}
              disabled={googleStatus === 'loading'}
            >
              <GoogleIcon />
              <span>{googleButtonLabel}</span>
            </button>

            <div className="divider">
              <span>or use your email</span>
            </div>

            <Field
              id="su-name"
              label="Name"
              placeholder="Jane Doe"
              value={signUpName}
              error={signUpErrors.name}
              onChange={(v) => {
                setSignUpName(v);
                if (signUpErrors.name) setSignUpErrors((prev) => ({ ...prev, name: undefined }));
              }}
            />

            <Field
              id="su-email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={signUpEmail}
              error={signUpErrors.email}
              onChange={(v) => {
                setSignUpEmail(v);
                if (signUpErrors.email) setSignUpErrors((prev) => ({ ...prev, email: undefined }));
              }}
            />

            <PasswordField
              id="su-password"
              label="Password"
              value={signUpPassword}
              placeholder="At least 8 characters"
              error={signUpErrors.password}
              onChange={(v) => {
                setSignUpPassword(v);
                if (signUpErrors.password) setSignUpErrors((prev) => ({ ...prev, password: undefined }));
              }}
            />

            <PasswordField
              id="su-confirm-password"
              label="Confirm password"
              value={signUpConfirmPassword}
              placeholder="Re-enter your password"
              error={signUpErrors.confirmPassword}
              onChange={(v) => {
                setSignUpConfirmPassword(v);
                if (signUpErrors.confirmPassword) setSignUpErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
            />

            <button type="submit" className="btn-primary">
              Create account
            </button>

            <p className="switch-text">
              Already have an account?{' '}
              <button type="button" className="link-btn" onClick={switchToSignIn}>
                Sign in
              </button>
            </p>
          </form>
        </div>

        {/* ---------- Sliding color panel ---------- */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-panel--left">
              <span className="blob blob--a" aria-hidden="true" />
              <span className="blob blob--b" aria-hidden="true" />
            </div>

            <div className="overlay-panel overlay-panel--right">
              <span className="blob blob--c" aria-hidden="true" />
              <span className="blob blob--d" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;