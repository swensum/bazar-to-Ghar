import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext'; // adjust path to match your project
import './auth.scss';
import { useNavigate, useLocation } from 'react-router-dom';

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

const MailIcon: React.FC = () => (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2.5" y="5" width="19" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3.5 6.5l8.5 7 8.5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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

const friendlyAuthError = (err: any): string => {
    switch (err?.code) {
        case 'auth/email-already-in-use':
            return 'An account with this email already exists.';
        case 'auth/invalid-email':
            return 'That email address looks invalid.';
        case 'auth/weak-password':
            return 'Password is too weak — use at least 8 characters.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Incorrect email or password.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please wait a moment and try again.';
        case 'auth/popup-closed-by-user':
        case 'auth/cancelled-popup-request':
            return ''; // silent — user just closed it
        default:
            return 'Something went wrong. Please try again.';
    }
};

/* ---------- Email verification screen ---------- */

type VerifyScreenProps = {
    email: string;
    checking: boolean;
    onResend: () => void;
    onBack: () => void;
    resendCooldown: number;
};

const VerifyEmailScreen: React.FC<VerifyScreenProps> = ({ email, checking, onResend, onBack, resendCooldown }) => (
    <div className="verify-screen">
        <div className="verify-screen__icon">
            <MailIcon />
        </div>
        <h1>Check your inbox</h1>
        <p className="verify-screen__body">
            A verification link has been sent to <strong>{email}</strong>. Click the link to activate your account —
            this page will continue automatically once it's confirmed.
        </p>

        <div className="verify-screen__status">
            {checking ? (
                <>
                    <span className="verify-spinner" aria-hidden="true" />
                    <span>Checking verification status…</span>
                </>
            ) : (
                <span>Verified! Redirecting…</span>
            )}
        </div>

        <button type="button" className="btn-google" onClick={onResend} disabled={resendCooldown > 0}>
            {resendCooldown > 0 ? `Resend link (${resendCooldown}s)` : 'Resend verification link'}
        </button>

        <button type="button" className="link-btn verify-screen__back" onClick={onBack}>
            Back to sign in
        </button>
    </div>
);

/* ---------- Main component ---------- */

const AuthPage: React.FC = () => {
    const {
        googleLoading,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        pendingVerificationEmail,
        verificationChecking,
        resendVerificationEmail,
        cancelVerificationWait,
    } = useAuth();

    const { pushToast } = useToast();

    const navigate = useNavigate();
    const location = useLocation();
    const initialMode = (location.state as { mode?: 'signup' | 'signin' } | null)?.mode;

    const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');

    const [signInEmail, setSignInEmail] = useState('');
    const [signInPassword, setSignInPassword] = useState('');
    const [signInErrors, setSignInErrors] = useState<SignInErrors>({});
    const [signInSubmitting, setSignInSubmitting] = useState(false);

    const [signUpName, setSignUpName] = useState('');
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');
    const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
    const [signUpErrors, setSignUpErrors] = useState<SignUpErrors>({});
    const [signUpSubmitting, setSignUpSubmitting] = useState(false);

    const [resendCooldown, setResendCooldown] = useState(0);

    /* ---------- Verify overlay mount/animate state ----------
       verifyMounted keeps the overlay in the DOM long enough to play its
       exit transition; verifyActive toggles the actual visual state one
       frame after mount so the enter transition has something to animate
       from. lastVerifyEmail keeps the email visible during the fade-out,
       since pendingVerificationEmail itself goes null immediately. */
    const [verifyMounted, setVerifyMounted] = useState(false);
    const [verifyActive, setVerifyActive] = useState(false);
    const [lastVerifyEmail, setLastVerifyEmail] = useState('');

    useEffect(() => {
        if (pendingVerificationEmail) {
            setLastVerifyEmail(pendingVerificationEmail);
            setVerifyMounted(true);
            const raf = requestAnimationFrame(() => setVerifyActive(true));
            return () => cancelAnimationFrame(raf);
        } else {
            setVerifyActive(false);
            const t = setTimeout(() => setVerifyMounted(false), 650); // matches $transition-speed
            return () => clearTimeout(t);
        }
    }, [pendingVerificationEmail]);

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

    // Resend-link cooldown ticker
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCooldown]);
const wasCheckingRef = useRef(false);
useEffect(() => {
    if (wasCheckingRef.current && !verificationChecking && !pendingVerificationEmail) {
        pushToast('success', 'Email verified', 'Your account is now active.');
        const t = setTimeout(() => {
            navigate('/', { replace: true });
        }, 1400); 
        return () => clearTimeout(t);
    }
    wasCheckingRef.current = verificationChecking;
}, [verificationChecking, pendingVerificationEmail, navigate, pushToast]);
   
    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();

        const errors: SignInErrors = {};
        if (!signInEmail.trim()) errors.email = 'Email is required';
        else if (!isValidEmail(signInEmail)) errors.email = 'Enter a valid email address';

        if (!signInPassword) errors.password = 'Password is required';
        else if (signInPassword.length < 8) errors.password = 'Must be at least 8 characters';

        setSignInErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setSignInSubmitting(true);
        try {
            await signInWithEmail(signInEmail, signInPassword);
        } catch (err: any) {
            pushToast('error', 'Sign-in failed', friendlyAuthError(err));
        } finally {
            setSignInSubmitting(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
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

        setSignUpSubmitting(true);
        try {
            await signUpWithEmail(signUpName, signUpEmail, signUpPassword);
            setResendCooldown(30);
        } catch (err: any) {
            pushToast('error', 'Sign-up failed', friendlyAuthError(err));
        } finally {
            setSignUpSubmitting(false);
        }
    };

    const handleGoogle = async () => {
        try {
            await signInWithGoogle();
        } catch (err: any) {
            pushToast('error', 'Sign-in failed', friendlyAuthError(err));
        }
    };

    const handleResend = async () => {
        try {
            await resendVerificationEmail();
            setResendCooldown(30);
            pushToast('success', 'Link resent', 'Check your inbox again.');
        } catch (err: any) {
            pushToast('error', 'Could not resend', friendlyAuthError(err));
        }
    };

    const handleBackToSignIn = () => {
        cancelVerificationWait();
        setIsSignUp(false);
    };

    const switchToSignUp = () => {
        setSignInErrors({});
        setIsSignUp(true);
    };

    const switchToSignIn = () => {
        setSignUpErrors({});
        setIsSignUp(false);
    };

    const googleButtonLabel = googleLoading ? 'Signing in…' : 'Continue with Google';

    return (
        <div className="auth-page">
            <div
                className={`auth-container${isSignUp ? ' auth-container--active' : ''}${
                    verifyMounted ? ' auth-container--verifying' : ''
                }`}
                style={containerHeight ? { height: `${containerHeight}px` } : undefined}
            >
                {/* ---------- Sign in ---------- */}
                <div className="form-panel form-panel--sign-in">
                    <form ref={signInFormRef} onSubmit={handleSignIn} noValidate>
                        <h1>Welcome back</h1>
                        <p className="subtitle">Sign in to keep things moving.</p>

                        <button type="button" className="btn-google" onClick={handleGoogle} disabled={googleLoading}>
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

                        <button type="submit" className="btn-primary" disabled={signInSubmitting}>
                            {signInSubmitting ? 'Signing in…' : 'Sign in'}
                        </button>

                        <p className="switch-text switch-text--mobile-only">
                            Don&apos;t have an account?{' '}
                            <button type="button" className="link-btn" onClick={switchToSignUp}>
                                Register
                            </button>
                        </p>
                    </form>
                </div>

                {/* ---------- Sign up ---------- */}
                <div className="form-panel form-panel--sign-up">
                    <form ref={signUpFormRef} onSubmit={handleSignUp} noValidate>
                        <h1>Create account</h1>
                        <p className="subtitle">Start your workspace in a minute.</p>

                        <button type="button" className="btn-google" onClick={handleGoogle} disabled={googleLoading}>
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
                                if (signUpErrors.confirmPassword)
                                    setSignUpErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                            }}
                        />

                        <button type="submit" className="btn-primary" disabled={signUpSubmitting}>
                            {signUpSubmitting ? 'Creating account…' : 'Create account'}
                        </button>

                        <p className="switch-text switch-text--mobile-only">
                            Already have an account?{' '}
                            <button type="button" className="link-btn" onClick={switchToSignIn}>
                                Sign in
                            </button>
                        </p>
                    </form>
                </div>

                {/* ---------- Sliding color panel (desktop only) ---------- */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-panel--left">
                            <span className="blob blob--a" aria-hidden="true" />
                            <span className="blob blob--b" aria-hidden="true" />
                            <div className="overlay-content">
                                <h2>Welcome back!</h2>
                                <p>Already have an account? Sign in to keep going.</p>
                                <button type="button" className="btn-ghost" onClick={switchToSignIn}>
                                    Sign in
                                </button>
                            </div>
                        </div>

                        <div className="overlay-panel overlay-panel--right">
                            <span className="blob blob--c" aria-hidden="true" />
                            <span className="blob blob--d" aria-hidden="true" />
                            <div className="overlay-content">
                                <h2>Hello, welcome!</h2>
                                <p>Don&apos;t have an account?</p>
                                <button type="button" className="btn-ghost" onClick={switchToSignUp}>
                                    Register
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ---------- Verification takeover ----------
                    Independent of .overlay-container, so it isn't affected
                    by the mobile rule that hides the sliding color panel —
                    it shows on both desktop and mobile the same way. */}
                {verifyMounted && (
                    <div
                        className={`verify-overlay${verifyActive ? ' verify-overlay--active' : ''}`}
                        role="status"
                        aria-live="polite"
                    >
                        <span className="blob blob--a" aria-hidden="true" />
                        <span className="blob blob--d" aria-hidden="true" />
                        <VerifyEmailScreen
                            email={lastVerifyEmail}
                            checking={verificationChecking}
                            onResend={handleResend}
                            onBack={handleBackToSignIn}
                            resendCooldown={resendCooldown}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthPage;