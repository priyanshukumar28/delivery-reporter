import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../api/AuthContext.jsx";
import styles from "./Login.module.css";

function PulseIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12h4l2-7 4 14 2-7h6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 6.5 12 13l8.5-6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 10V7a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeIcon({ off }) {
  return off ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M6.6 6.7C4.5 8.1 3 10 2.5 12c1.3 4 5.4 7 9.5 7 1.6 0 3.1-.4 4.4-1.2M9.9 4.2C10.6 4 11.3 4 12 4c4.1 0 8.2 3 9.5 7-.4 1.3-1.1 2.6-2 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 12C3.8 8 7.9 5 12 5s8.2 3 9.5 7c-1.3 4-5.4 7-9.5 7s-8.2-3-9.5-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.logoIcon}><PulseIcon size={18} /></span>
          <span className={styles.brandName}>Daily Delivery Reporter</span>
        </div>
      </header>

      <main className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Consolidate.<br />
          Report. <span className={styles.accent}>Deliver.</span>
        </h1>
        <p className={styles.heroSubtitle}>
          The central workspace for your daily project updates and delivery metrics.
        </p>

        <div className={styles.card}>
          <div className={styles.cardIcon}><PulseIcon size={26} /></div>
          <h2 className={styles.cardTitle}>Daily Delivery Reporter</h2>
          <p className={styles.cardSubtitle}>Enter your credentials to access the delivery hub</p>

          <form onSubmit={handleSubmit}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.field}>
              <label htmlFor="email">Work Email</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><MailIcon /></span>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Password</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><LockIcon /></span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeToggle}
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
            </div>

            <div className={styles.row}>
              <label className={styles.remember}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                Remember me
              </label>
              <a href="#" className={styles.link} onClick={e => e.preventDefault()}>Forgot password?</a>
            </div>

            <button className={styles.submit} type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className={styles.cardFooter}>
            <span>Don&apos;t have an account? <a href="#" className={styles.link} onClick={e => e.preventDefault()}>Request Access</a></span>
            <div className={styles.badges}>SECURE LOGIN&nbsp;&nbsp;&middot;&nbsp;&nbsp;ENTERPRISE GRADE</div>
          </div>
        </div>

        <div className={styles.trusted}>
          <div className={styles.trustedLabel}>TRUSTED BY TEAMS ACROSS</div>
          <div className={styles.trustedIcons}>
            <span className={styles.trustedIcon} />
            <span className={styles.trustedIcon} />
            <span className={styles.trustedIcon} />
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <span>© 2024 Daily Delivery Reporter. All rights reserved.</span>
        <div className={styles.footerLinks}>
          <a href="#" onClick={e => e.preventDefault()}>Support</a>
          <a href="#" onClick={e => e.preventDefault()}>Documentation</a>
          <a href="#" onClick={e => e.preventDefault()}>System Status</a>
        </div>
      </footer>
    </div>
  );
}
