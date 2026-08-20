import { type JSX, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import styles from "./AuthPage.module.scss";
import logoImg from "../assets/logo.png";

export default function LoginPage(): JSX.Element {
  useDocumentTitle("Login");
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle, signInWithEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Send the user back wherever they were headed before being routed to
  // /login (e.g. checkout), falling back to home.
  const redirectTo = (location.state as { from?: string })?.from || "/";

  const validateField = (name: string, value: string): string => {
    if (name === "email") {
      if (!value.trim()) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address";
    }
    if (name === "password") {
      if (!value) return "Password is required";
    }
    return "";
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const getFieldError = (field: string) => (touched[field] ? errors[field] || "" : "");

  const handleGoogleSignIn = async () => {
    setFormError("");
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setFormError(err?.message || "Google sign-in failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const newErrors = {
      email: validateField("email", email),
      password: validateField("password", password),
    };
    setErrors(newErrors);
    setTouched({ email: true, password: true });

    if (Object.values(newErrors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      await signInWithEmail(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setFormError(mapAuthError(err?.code));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <img src={logoImg} alt="Bazar-to-Ghar" onClick={() => navigate("/")} />
        </div>

        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Log in to continue to your account</p>

        <button
          type="button"
          className={styles.googleButton}
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isSubmitting}
        >
          <GoogleIcon />
          {isGoogleLoading ? "Signing in..." : "Continue with Google"}
        </button>

        <div className={styles.divider}>or</div>

        {formError && <div className={styles.formError}>{formError}</div>}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.fieldWrapper}>
            <label className={styles.label} htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className={`${styles.input} ${getFieldError("email") ? styles.inputError : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur("email", email)}
              autoComplete="email"
            />
            {getFieldError("email") && <span className={styles.errorText}>{getFieldError("email")}</span>}
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.label} htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className={`${styles.input} ${getFieldError("password") ? styles.inputError : ""}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur("password", password)}
              autoComplete="current-password"
            />
            {getFieldError("password") && <span className={styles.errorText}>{getFieldError("password")}</span>}
          </div>

          <button type="submit" className={styles.submitButton} disabled={isSubmitting || isGoogleLoading}>
            {isSubmitting ? <span className={styles.spinner} /> : "Log in"}
          </button>
        </form>

        <p className={styles.footerText}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

function mapAuthError(code?: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5C29.6 34.8 26.9 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.5 5C9.6 39.6 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.5 5.5C40.9 36.3 44 30.8 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}