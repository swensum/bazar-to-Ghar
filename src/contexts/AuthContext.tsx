import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "../store/firebaselite";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Resolves the return trip after signInWithRedirect() sends the user
    // to Google and back. Errors here (e.g. popup closed, account exists
    // with different credential) are logged but don't block the app —
    // onAuthStateChanged below is still the source of truth for `user`.
    getRedirectResult(auth).catch((err) => {
      console.error("Google redirect sign-in error:", err);
    });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    // Navigates the whole page to Google and back — no popup, so no
    // Cross-Origin-Opener-Policy interference. Execution does not
    // meaningfully continue past this call in the current page load;
    // onAuthStateChanged picks up the signed-in user after the redirect
    // completes and the app reloads.
    await signInWithRedirect(auth, googleProvider);
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    // Attach the display name immediately so the navbar/account UI has
    // something to show right after sign-up, without a manual refetch.
    if (name.trim()) {
      await updateProfile(credential.user, { displayName: name.trim() });
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}