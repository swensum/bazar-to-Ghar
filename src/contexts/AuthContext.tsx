import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithRedirect,
    getRedirectResult,
    sendEmailVerification,
    updateProfile,
    onAuthStateChanged,
    reload,
    signOut as firebaseSignOut,
    type User,
    type ActionCodeSettings,
} from 'firebase/auth';
import { auth, googleProvider } from '../store/firebaselite'; // adjust path to match your project

const DEBUG = true;
const glog = (...args: unknown[]) => {
    if (DEBUG) console.log('[GAuth]', ...args);
};

type AuthContextValue = {
    currentUser: User | null;
    authReady: boolean;
    googleLoading: boolean;

    // Email/password
    signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;

    // Google
    signInWithGoogle: () => Promise<void>;

    // Email verification
    pendingVerificationEmail: string | null;
    verificationChecking: boolean;
    resendVerificationEmail: () => Promise<void>;
    cancelVerificationWait: () => void;

    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>');
    return ctx;
};

const POLL_INTERVAL_MS = 3000;

// No custom domain is registered yet, so Firebase always sends the actual
// verification-link click to its own hosted page
// (bazar-to-ghar.firebaseapp.com/__/auth/action), regardless of this URL —
// there's no way around that without a verified custom Action URL in
// Firebase Console -> Authentication -> Templates -> Email address
// verification -> Customize action URL.
//
// This `url` only controls the "Continue" link on THAT hosted page, so it
// just needs to be a real, existing route in this app. Point it at the
// root rather than a dedicated /verify-email page, since we're relying on
// Firebase's own default "email verified" messaging instead of a custom
// in-app verification screen.
const actionCodeSettings: ActionCodeSettings = {
    url: typeof window !== 'undefined' ? window.location.origin : '/',
    handleCodeInApp: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
    const [verificationChecking, setVerificationChecking] = useState(false);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    /* Track auth state globally */
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            glog('onAuthStateChanged:', user?.email ?? null);
            setCurrentUser(user);
            setAuthReady(true);
        });
        return () => unsub();
    }, []);

    /* Resolve Google redirect result on mount/return */
    useEffect(() => {
        let cancelled = false;
        const wasRedirecting = sessionStorage.getItem('gauth_redirect_pending') === '1';
        if (wasRedirecting) setGoogleLoading(true);

        glog('checking getRedirectResult()...');
        getRedirectResult(auth)
            .then((result) => {
                if (cancelled) return;
                sessionStorage.removeItem('gauth_redirect_pending');
                if (result) {
                    glog('Google sign-in SUCCESS:', result.user.email);
                } else {
                    glog('getRedirectResult(): no pending redirect result');
                }
            })
            .catch((err: any) => {
                if (cancelled) return;
                sessionStorage.removeItem('gauth_redirect_pending');
                console.error('[GAuth] Google sign-in failed:', err);

                // IndexedDB write race safety net
                if (
                    err?.message?.toLowerCase().includes('database is closing') ||
                    err?.message?.toLowerCase().includes('indexeddb')
                ) {
                    if (auth.currentUser) {
                        glog('IndexedDB race but auth.currentUser is set — treating as success.');
                        return;
                    }
                }
                throw err;
            })
            .finally(() => {
                if (!cancelled) setGoogleLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    /* Cleanup poll on unmount */
    useEffect(() => {
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, []);

    const startVerificationPolling = (email: string) => {
        setPendingVerificationEmail(email);
        setVerificationChecking(true);

        if (pollRef.current) clearInterval(pollRef.current);

        pollRef.current = setInterval(async () => {
            if (!auth.currentUser) return;
            try {
                await reload(auth.currentUser);
                glog('polling verification status:', auth.currentUser.emailVerified);
                if (auth.currentUser.emailVerified) {
                    if (pollRef.current) clearInterval(pollRef.current);
                    pollRef.current = null;
                    setVerificationChecking(false);
                    setPendingVerificationEmail(null);
                    setCurrentUser(auth.currentUser); // refresh with verified flag
                }
            } catch (e) {
                glog('verification poll error:', e);
            }
        }, POLL_INTERVAL_MS);
    };

    const cancelVerificationWait = () => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
        setVerificationChecking(false);
        setPendingVerificationEmail(null);
    };

    const signUpWithEmail = async (name: string, email: string, password: string) => {
        glog('signUpWithEmail:', email);
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
            await updateProfile(cred.user, { displayName: name.trim() });
        }
        await sendEmailVerification(cred.user, actionCodeSettings);
        glog('verification email sent to', email);
        startVerificationPolling(email);
    };

    const signInWithEmail = async (email: string, password: string) => {
        glog('signInWithEmail:', email);
        const cred = await signInWithEmailAndPassword(auth, email, password);
        if (!cred.user.emailVerified) {
            glog('existing account not yet verified — resending link');
            await sendEmailVerification(cred.user, actionCodeSettings).catch(() => {});
            startVerificationPolling(email);
        }
    };

    const resendVerificationEmail = async () => {
        if (!auth.currentUser) return;
        await sendEmailVerification(auth.currentUser, actionCodeSettings);
        glog('verification email re-sent to', auth.currentUser.email);
    };

    const signInWithGoogle = async () => {
        glog('=== signInWithGoogle: button clicked ===');
        setGoogleLoading(true);
        try {
            sessionStorage.setItem('gauth_redirect_pending', '1');
            glog('calling signInWithRedirect()... page will navigate away now');
            await signInWithRedirect(auth, googleProvider);
            // Execution stops here — the browser navigates to Google.
        } catch (err) {
            sessionStorage.removeItem('gauth_redirect_pending');
            setGoogleLoading(false);
            throw err;
        }
    };

    const signOut = async () => {
        cancelVerificationWait();
        await firebaseSignOut(auth);
    };

    const value: AuthContextValue = {
        currentUser,
        authReady,
        googleLoading,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        pendingVerificationEmail,
        verificationChecking,
        resendVerificationEmail,
        cancelVerificationWait,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};