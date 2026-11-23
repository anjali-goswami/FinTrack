import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
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
    if (!formData.name.trim()) nextErrors.name = "Name is required.";
    if (!formData.email.trim()) nextErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = "Enter a valid email address.";
    if (!formData.password) nextErrors.password = "Password is required.";
    else if (formData.password.length < 8) nextErrors.password = "Use at least 8 characters.";
    if (!formData.confirmPassword) nextErrors.confirmPassword = "Please confirm your password.";
    else if (formData.password !== formData.confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      await register({ name: formData.name.trim(), email: formData.email.trim(), password: formData.password });
      navigate("/", { replace: true });
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not create your account. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-container">
      <div className="auth-shell auth-shell-register">
        <aside className="auth-brand-panel">
          <Link to="/register" className="auth-brand" aria-label="FinTrack home">
            <span className="auth-brand-mark">F</span><span>FinTrack</span>
          </Link>
          <div className="auth-brand-copy">
            <span className="auth-eyebrow">A FRESH START</span>
            <h2>Build better habits with a plan that feels simple.</h2>
            <p>Bring your expenses and budgets into one calm, organized place.</p>
          </div>
          <div className="auth-brand-footnote"><span className="auth-status-dot" /> Your financial picture, all in one place.</div>
        </aside>

        <section className="auth-card" aria-labelledby="register-title">
          <header className="auth-header">
            <span className="auth-kicker">GET STARTED</span>
            <h1 id="register-title" className="auth-title">Create your account</h1>
            <p className="auth-subtitle">A few details now, a clearer money picture next.</p>
          </header>

          {message && <div className="auth-alert" role="alert">{message}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full name</label>
              <input id="name" className={`form-input ${errors.name ? "error" : ""}`} type="text" name="name" placeholder="Your name" autoComplete="name" maxLength="80" value={formData.name} onChange={handleChange} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} required />
              {errors.name && <small id="name-error" className="form-error" role="alert">{errors.name}</small>}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email address</label>
              <input id="email" className={`form-input ${errors.email ? "error" : ""}`} type="email" name="email" placeholder="you@example.com" autoComplete="email" value={formData.email} onChange={handleChange} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} required />
              {errors.email && <small id="email-error" className="form-error" role="alert">{errors.email}</small>}
            </div>

            <div className="form-row auth-password-row">
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input id="password" className={`form-input ${errors.password ? "error" : ""}`} type="password" name="password" placeholder="At least 8 characters" autoComplete="new-password" minLength="8" value={formData.password} onChange={handleChange} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : "password-hint"} required />
                {errors.password ? <small id="password-error" className="form-error" role="alert">{errors.password}</small> : <small id="password-hint" className="form-hint">Use 8 characters or more.</small>}
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
                <input id="confirmPassword" className={`form-input ${errors.confirmPassword ? "error" : ""}`} type="password" name="confirmPassword" placeholder="Enter it again" autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined} required />
                {errors.confirmPassword && <small id="confirm-password-error" className="form-error" role="alert">{errors.confirmPassword}</small>}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg auth-submit" disabled={submitting}>
              {submitting ? "Creating account…" : "Create account"}
              {!submitting && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </section>
      </div>
    </main>
  );
}
