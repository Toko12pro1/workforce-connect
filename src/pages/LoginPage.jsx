import React, { useState } from "react";
import {
  BriefcaseBusiness,
  Eye,
  Mail,
  MessageSquareText,
  ShieldCheck,
  ToggleLeft,
  Wrench
} from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import { getRedirectPath } from "../auth.js";

const featureCards = [
  {
    title: "Verified Professionals",
    icon: ShieldCheck,
    image:
      "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=920&q=82"
  },
  {
    title: "Secure Payments",
    icon: BriefcaseBusiness,
    image:
      "https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=920&q=82"
  }
];

export default function LoginPage() {
  const { signIn, signInDemo } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const { error: authError, user: signedInUser } = await signIn(email, password);
    if (authError) {
      setError(authError.message || "Login failed. Please try again.");
      setLoading(false);
      return;
    }
    const dest = getRedirectPath("/feed");
    window.location.href = signedInUser?.user_metadata?.account_type ? dest : "/role-select";
  }

  async function handleQuickLogin() {
    setError("");
    setLoading(true);
    const { error: authError, user: signedInUser } = await signInDemo();
    if (authError) {
      setError(authError.message || "Demo login failed. Check the Supabase demo account.");
      setLoading(false);
      return;
    }
    window.location.href = signedInUser?.user_metadata?.account_type ? "/feed" : "/role-select";
  }

  return (
    <main className="auth-page login-page">
      <section className="login-layout">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="login-mark">
            <span>
              <Wrench size={42} />
            </span>
            <h1>Informal Workforce Connect</h1>
            <p>Your gateway to reliable work</p>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <label className="field">
            <span>Email Address</span>
            <span className="input-shell">
              <Mail size={22} />
              <input name="email" type="email" placeholder="you@example.com" required />
            </span>
          </label>

          <label className="field">
            <span className="split-label">
              Password <a href="/create-account">Forgot password?</a>
            </span>
            <span className="input-shell">
              <input name="password" type="password" placeholder="Minimum 8 characters" required />
              <button type="button" aria-label="Show password">
                <Eye size={24} />
              </button>
            </span>
          </label>

          <label className="remember-row">
            <input type="checkbox" />
            <ToggleLeft size={58} />
            <span>Remember me</span>
          </label>

          <button className="form-submit" type="submit" disabled={loading}>
            {loading ? "Logging in…" : "Log In"}
          </button>

          <div className="continue-divider">
            <i></i>
            <span>OR CONTINUE WITH</span>
            <i></i>
          </div>

          <div className="social-login">
            <button type="button" onClick={handleQuickLogin} disabled={loading}>
              <span className="google-icon">G</span>
              Google
            </button>
            <button type="button" onClick={handleQuickLogin} disabled={loading}>
              <MessageSquareText size={28} />
              WhatsApp
            </button>
          </div>

          <p className="form-switch">
            New here?{" "}
            <a href={`/create-account?redirect=${encodeURIComponent(getRedirectPath())}`}>
              Create an account
            </a>
          </p>
        </form>

        <aside className="feature-stack">
          {featureCards.map(({ title, icon: Icon, image }) => (
            <article className="feature-card" key={title}>
              <img src={image} alt="" />
              <div>
                <span>
                  <Icon size={23} />
                </span>
                <h2>{title}</h2>
              </div>
            </article>
          ))}
        </aside>
      </section>
    </main>
  );
}
