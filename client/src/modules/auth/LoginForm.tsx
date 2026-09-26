import React, { useState } from 'react';
import { Package, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Demo accounts for instant one-click access during development & demo
const DEMO_ACCOUNTS = [
  { label: 'Manager (manager01)', loginId: 'manager01', password: 'Manager@123' },
  { label: 'Staff (warehouse01)', loginId: 'warehouse01', password: 'Staff@123' }
];

interface Props {
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
}

export default function LoginForm({ onSwitchToRegister, onSwitchToForgot }: Props) {
  const { login } = useAuth();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginId.trim() || !password.trim()) {
      setErrorMessage('Login Id and Password are required.');
      return;
    }

    setIsLoading(true);
    try {
      await login(loginId, password);
      // AuthContext sets user → App.tsx redirects to dashboard
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid Login Id or Password');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (account: typeof DEMO_ACCOUNTS[0]) => {
    setLoginId(account.loginId);
    setPassword(account.password);
    setErrorMessage('');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header">
          <span className="brand-badge">
            <Package size={14} />
            StockSense
          </span>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your inventory workspace</p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="alert-box alert-danger" role="alert">
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="loginId">Login Id</label>
            <div className="form-input-wrapper">
              <span className="form-input-icon">
                <LogIn size={16} />
              </span>
              <input
                id="loginId"
                type="text"
                className={`form-input ${errorMessage ? 'error' : ''}`}
                placeholder="Enter your login id"
                value={loginId}
                onChange={(e) => {
                  setLoginId(e.target.value);
                  setErrorMessage('');
                }}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
              <button
                type="button"
                className="btn-link"
                onClick={onSwitchToForgot}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.825rem',
                  color: '#818cf8',
                  padding: 0
                }}
              >
                Forgot password?
              </button>
            </label>
            <div className="form-input-wrapper">
              <span className="form-input-icon">
                <EyeOff size={16} />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errorMessage ? 'error' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage('');
                }}
                autoComplete="current-password"
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={{
                  position: 'absolute',
                  right: '0.9rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            className="btn btn-primary btn-block"
            disabled={isLoading}
            style={{ marginTop: '0.5rem' }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Register Link */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '1.25rem',
            fontSize: '0.875rem',
            color: 'var(--text-muted)'
          }}
        >
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#818cf8',
              fontWeight: 600,
              fontSize: 'inherit',
              padding: 0
            }}
          >
            Create account
          </button>
        </p>

        {/* Quick Demo Accounts */}
        <div className="demo-accounts-bar">
          <span className="demo-title">Quick Demo Access</span>
          <div className="demo-chips">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.loginId}
                type="button"
                className="demo-chip"
                onClick={() => fillDemoAccount(acc)}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
