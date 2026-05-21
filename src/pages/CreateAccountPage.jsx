import React, { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Eye,
  IdCard,
  Mail,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import { getRedirectPath } from "../auth.js";

export default function CreateAccountPage({ authNotice, redirectTo }) {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await signUp(email, password, name);
    if (authError) {
      setError(authError.message || "Sign up failed. Please try again.");
      setLoading(false);
      return;
    }
    window.location.href = "/role-select";
  }

  return (
    <main className="auth-page account-page">
      <header className="auth-topbar">
        <a href="/" className="auth-brand">
          <BriefcaseBusiness size={28} />
          <span>Workforce Connect</span>
        </a>
      </header>

      <section className="account-wrap">
        <div className="auth-title">
          <h1>Create your account</h1>
          <p>
            {authNotice ||
              "One user account lets you search for services and offer your own skills."}
          </p>
        </div>

        <form className="account-card" onSubmit={handleSubmit}>
          {error && <p className="form-error" role="alert">{error}</p>}

          <label className="field">
            <span>
              Full Name <b>*</b>
            </span>
            <span className="input-shell">
              <IdCard size={22} />
              <input
                type="text"
                placeholder="Enter your legal name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </span>
          </label>

          <label className="field">
            <span>
              Email Address <b>*</b>
            </span>
            <span className="input-shell">
              <Mail size={22} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </span>
          </label>

          <label className="field">
            <span>
              Create Password <b>*</b>
            </span>
            <span className="input-shell">
              <ShieldCheck size={22} />
              <input
                type="password"
                placeholder="Minimum 8 characters"
                minLength="8"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" aria-label="Show password">
                <Eye size={23} />
              </button>
            </span>
          </label>

          <button className="form-submit" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Continue"}
            {!loading && <ArrowRight size={28} />}
          </button>

          <div className="form-divider"></div>
          <p className="form-switch">
            Already have an account?{" "}
            <a href={`/login?redirect=${encodeURIComponent(redirectTo || getRedirectPath())}`}>
              Log In
            </a>
          </p>
        </form>

        <nav className="auth-links" aria-label="Support links">
          <a href="/">Terms of Service</a>
          <span></span>
          <a href="/">Privacy Policy</a>
          <span></span>
          <a href="/">Support</a>
        </nav>

        <div className="safe-note">
          <span>
            <ShieldCheck size={25} />
          </span>
          Safe & Verified Platform
        </div>
      </section>

      <footer className="auth-footer">
        <a href="/" className="footer-brand">
          <BriefcaseBusiness size={25} />
          Informal Workforce Connect
        </a>
        <p>Helping local users find services and offer their skills since 2024.</p>
        <div className="footer-socials">
          <a href="/" aria-label="Website">
            <span>G</span>
          </a>
          <a href="/login" aria-label="Email support">
            <Mail size={24} />
          </a>
        </div>
      </footer>
    </main>
  );
}
