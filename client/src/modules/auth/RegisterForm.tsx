import React, { useState } from 'react';
import { Package, User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../../api/client';

type Role = 'MANAGER' | 'STAFF';

interface Props {
  onSwitchToLogin: () => void;
  onRegistered: () => void;
}

interface FieldErrors {
  loginId?: string;
  email?: string;
  name?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function RegisterForm({ onSwitchToLogin, onRegistered }: Props) {
  const [form, setForm] = useState({
    loginId: '',
    email: '',
    name: '',
    role: 'STAFF' as Role,
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  };

  // Client-side validation mirrors the server validation rules exactly
  const validateForm = (): FieldErrors => {
    const errs: FieldErrors = {};

    if (form.loginId.length < 6 || form.loginId.length > 12) {
      errs.loginId = 'Login Id must be between 6 and 12 characters.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.loginId)) {
      errs.loginId = 'Login Id can only contain letters, numbers, and underscores.';
    }

    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!form.name || form.name.trim().length < 2) {
      errs.name = 'Full name must be at least 2 characters.';
    }

    if (form.password.length < 8 || form.password.length > 15) {
      errs.password = 'Password must be between 8 and 15 characters.';
    } else if (!/[A-Z]/.test(form.password)) {
      errs.password = 'Password must contain at least one uppercase letter.';
    } else if (!/[a-z]/.test(form.password)) {
      errs.password = 'Password must contain at least one lowercase letter.';
    } else if (!/[0-9]/.test(form.password)) {
      errs.password = 'Password must contain at least one number.';
    } else if (!/[^A-Za-z0-9]/.test(form.password)) {
      errs.password = 'Password must contain at least one special character (!@#$%^&*...).';
    }

    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors = validateForm();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.auth.register(form);
      if (res.success) {
        onRegistered();
      } else {
        setErrors({ general: res.message });
      }
    } catch {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <span className="brand-badge">
            <Package size={14} />
            StockSense
          </span>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join your team's inventory workspace</p>
        </div>

        {errors.general && (
          <div className="alert-box alert-danger">
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Role Selector */}
          <div className="form-group">
            <label className="form-label">Account Role</label>
            <div className="role-pill-group">
              {(['MANAGER', 'STAFF'] as Role[]).map((r) => (
                <div
                  key={r}
                  id={`role-${r.toLowerCase()}`}
                  className={`role-pill ${form.role === r ? 'active' : ''}`}
                  onClick={() => update('role', r)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && update('role', r)}
                >
                  <span className="role-pill-title">{r === 'MANAGER' ? '📊 Manager' : '🏭 Staff'}</span>
                  <span className="role-pill-desc">
                    {r === 'MANAGER' ? 'Full system access' : 'Warehouse operations'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <div className="form-input-wrapper">
              <span className="form-input-icon"><User size={16} /></span>
              <input
                id="reg-name"
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </div>
            {errors.name && <FieldError message={errors.name} />}
          </div>

          {/* Login Id */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-loginId">
              Login Id
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 400 }}>
                6–12 chars
              </span>
            </label>
            <div className="form-input-wrapper">
              <span className="form-input-icon"><User size={16} /></span>
              <input
                id="reg-loginId"
                type="text"
                className={`form-input ${errors.loginId ? 'error' : ''}`}
                placeholder="Enter Login Id"
                value={form.loginId}
                onChange={(e) => update('loginId', e.target.value)}
                maxLength={12}
              />
            </div>
            {errors.loginId && <FieldError message={errors.loginId} />}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Id</label>
            <div className="form-input-wrapper">
              <span className="form-input-icon"><Mail size={16} /></span>
              <input
                id="reg-email"
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter Email Id"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </div>
            {errors.email && <FieldError message={errors.email} />}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">
              Password
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 400 }}>
                8–15 chars, uppercase, number, symbol
              </span>
            </label>
            <div className="form-input-wrapper">
              <span className="form-input-icon"><Lock size={16} /></span>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter Password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={{
                  position: 'absolute', right: '0.9rem',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-dim)', display: 'flex', alignItems: 'center', padding: 0
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <FieldError message={errors.password} />}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Re-Enter Password</label>
            <div className="form-input-wrapper">
              <span className="form-input-icon"><Lock size={16} /></span>
              <input
                id="reg-confirm"
                type="password"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Re-Enter Password"
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
              />
              {form.confirmPassword && form.password === form.confirmPassword && (
                <span style={{ position: 'absolute', right: '0.9rem', color: 'var(--success)' }}>
                  <CheckCircle size={16} />
                </span>
              )}
            </div>
            {errors.confirmPassword && <FieldError message={errors.confirmPassword} />}
          </div>

          <button
            type="submit"
            id="register-submit-btn"
            className="btn btn-primary btn-block"
            disabled={isLoading}
            style={{ marginTop: '0.5rem' }}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', fontWeight: 600, fontSize: 'inherit', padding: 0 }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <span style={{ fontSize: '0.8rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
      <AlertCircle size={13} />
      {message}
    </span>
  );
}
