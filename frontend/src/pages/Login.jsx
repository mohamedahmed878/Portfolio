import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password, rememberMe);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="glass-bg">
        <div className="glow glow-1" />
        <div className="glow glow-2" />
      </div>

      <form className="login-card card fade-in" onSubmit={handleSubmit}>
        <div className="login-logo">
          <i className="fa-solid fa-shield-halved" />
        </div>
        <h1>تسجيل الدخول</h1>
        <p className="login-sub">Personal Dashboard — Mohamed Ahmed</p>

        {error && (
          <div className="login-error">
            <i className="fa-solid fa-circle-exclamation" /> {error}
          </div>
        )}

        <div className="field-group">
          <label className="field-label">Email</label>
          <input
            type="email"
            className="input-field"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="field-group">
          <label className="field-label">Password</label>
          <div className="password-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((s) => !s)}
              tabIndex={-1}
            >
              <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
            </button>
          </div>
        </div>

        <label className="remember-row">
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
          <span>تذكرني</span>
        </label>

        <button type="submit" className="btn btn-primary login-submit" disabled={submitting}>
          {submitting ? <span className="spinner" /> : <><i className="fa-solid fa-right-to-bracket" /> Login</>}
        </button>
      </form>
    </div>
  );
}
