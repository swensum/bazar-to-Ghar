import React, { useEffect, useState } from 'react';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../store/firebaselite'; // adjust path to match your project
import './auth.scss'; // reuses .auth-page / .auth-container / .verify-screen styles

type Status = 'verifying' | 'success' | 'error';

const VerifyEmailAction: React.FC = () => {
    const [status, setStatus] = useState<Status>('verifying');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('mode');
        const oobCode = params.get('oobCode');

        if (mode !== 'verifyEmail' || !oobCode) {
            setStatus('error');
            setErrorMsg('This verification link is invalid or malformed.');
            return;
        }

        applyActionCode(auth, oobCode)
            .then(() => setStatus('success'))
            .catch((err: any) => {
                setStatus('error');
                setErrorMsg(
                    err?.code === 'auth/invalid-action-code'
                        ? 'This link has already been used or has expired.'
                        : 'Something went wrong while verifying your email.'
                );
            });
    }, []);

    return (
        <div className="auth-page">
            <div className="auth-container auth-container--single">
                <div className="verify-screen">
                    {status === 'verifying' && (
                        <>
                            <span className="verify-spinner" aria-hidden="true" />
                            <h1>Verifying your email…</h1>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <h1>Email verified 🎉</h1>
                            <p className="verify-screen__body">
                                Your account is now active. You can close this tab and return to the app —
                                it will pick up automatically. Or head back now:
                            </p>
                            <a
                                className="btn-primary"
                                href="/"
                                style={{ textDecoration: 'none', display: 'inline-block' }}
                            >
                                Go to app
                            </a>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <h1>Verification failed</h1>
                            <p className="verify-screen__body">{errorMsg}</p>
                            <a
                                className="btn-primary"
                                href="/"
                                style={{ textDecoration: 'none', display: 'inline-block' }}
                            >
                                Back to app
                            </a>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailAction;