import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!formData.email.trim()) nextErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = "Enter a valid email address.";
    if (!formData.password) nextErrors.password = "Password is required.";
    else if (formData.password.length < 8) nextErrors.password = "Password must contain at least 8 characters.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      await login({ ...formData, email: formData.email.trim() });
      navigate("/", { replace: true });
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not sign in. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-container">
      <div className="auth-shell">
        <aside className="auth-brand-panel">
          <Link to="/login" className="auth-brand" aria-label="FinTrack home">
            <span className="auth-brand-mark">F</span><span>FinTrack</span>
          </Link>
          <div className="auth-brand-copy">
            <span className="auth-eyebrow">YOUR MONEY, IN FOCUS</span>
            <h2>Make your next money move with confidence.</h2>
            <p>See your spending clearly, keep budgets on track, and make progress one day at a time.</p>
          </div>
          <div className="auth-brand-footnote"><span className="auth-status-dot" /> A clearer view of your finances starts here.</div>
        </aside>

        <section className="auth-card" aria-labelledby="login-title">
          <header className="auth-header">
            <span className="auth-kicker">WELCOME BACK</span>
            <h1 id="login-title" className="auth-title">Sign in to FinTrack</h1>
            <p className="auth-subtitle">Enter your account details to continue.</p>
          </header>

          {message && <div className="auth-alert" role="alert">{message}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email address</label>
              <input id="email" className={`form-input ${errors.email ? "error" : ""}`} type="email" name="email" placeholder="you@example.com" autoComplete="email" value={formData.email} onChange={handleChange} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} required />
              {errors.email && <small id="email-error" className="form-error" role="alert">{errors.email}</small>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input id="password" className={`form-input ${errors.password ? "error" : ""}`} type="password" name="password" placeholder="Enter your password" autoComplete="current-password" value={formData.password} onChange={handleChange} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined} required />
              {errors.password && <small id="password-error" className="form-error" role="alert">{errors.password}</small>}
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg auth-submit" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
              {!submitting && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="auth-switch">New to FinTrack? <Link to="/register">Create an account</Link></p>
        </section>
      </div>
    </main>
  );
}
