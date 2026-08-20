import { type JSX, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import styles from "./AuthPage.module.scss";
import logoImg from "../assets/logo.png";

export default function SignupPage(): JSX.Element {
  useDocumentTitle("Sign Up");
  const navigate = useNavigate();
  const { signInWithGoogle, signUpWithEmail } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== password) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const getFieldError = (field: string) => (touched[field] ? errors[field] || "" : "");

  const handleGoogleSignUp = async () => {
    setFormError("");
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      navigate("/", { replace: true });
    } catch (err: any) {
      setFormError(err?.message || "Google sign-up failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const newErrors = {
      name: validateField("name", name),
      email: validateField("email", email),
      password: validateField("password", password),
      confirmPassword: validateField("confirmPassword", confirmPassword),
    };
    setErrors(newErrors);
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (Object.values(newErrors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      await signUpWithEmail(name, email, password);
      navigate("/", { replace: true });
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

        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Sign up to start shopping with us</p>

        <button
          type="button"
          className={styles.googleButton}
          onClick={handleGoogleSignUp}
          disabled={isGoogleLoading || isSubmitting}
        >
          <GoogleIcon />
          {isGoogleLoading ? "Signing up..." : "Continue with Google"}
        </button>

        <div className={styles.divider}>or</div>

        {formError && <div className={styles.formError}>{formError}</div>}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.fieldWrapper}>
            <label className={styles.label} htmlFor="signup-name">Full name</label>
            <input
              id="signup-name"
              type="text"
              className={`${styles.input} ${getFieldError("name") ? styles.inputError : ""}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleBlur("name", name)}
              autoComplete="name"
            />
            {getFieldError("name") && <span className={styles.errorText}>{getFieldError("name")}</span>}
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.label} htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
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
            <label className={styles.label} htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              className={`${styles.input} ${getFieldError("password") ? styles.inputError : ""}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur("password", password)}
              autoComplete="new-password"
            />
            {getFieldError("password") && <span className={styles.errorText}>{getFieldError("password")}</span>}
          </div>

          <div className={styles.fieldWrapper}>
            <label className={styles.label} htmlFor="signup-confirm">Confirm password</label>
            <input
              id="signup-confirm"
              type="password"
              className={`${styles.input} ${getFieldError("confirmPassword") ? styles.inputError : ""}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur("confirmPassword", confirmPassword)}
              autoComplete="new-password"
            />
            {getFieldError("confirmPassword") && (
              <span className={styles.errorText}>{getFieldError("confirmPassword")}</span>
            )}
          </div>

          <button type="submit" className={styles.submitButton} disabled={isSubmitting || isGoogleLoading}>
            {isSubmitting ? <span className={styles.spinner} /> : "Sign up"}
          </button>
        </form>

        <p className={styles.footerText}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

function mapAuthError(code?: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password is too weak. Please choose a stronger one.";
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