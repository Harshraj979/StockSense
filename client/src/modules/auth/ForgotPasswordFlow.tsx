import React, { useState } from 'react';
import { Package, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { api } from '../../api/client';

type Step = 'email' | 'otp' | 'done';

interface Props {
  onSwitchToLogin: () => void;
}

export default function ForgotPasswordFlow({ onSwitchToLogin }: Props) {
  const [step, setStep] = useState<Step>('email');
  const [emailOrLoginId, setEmailOrLoginId] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrLoginId.trim()) {
      setError('Please enter your Login Id or Email address.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await api.auth.forgotPassword({ emailOrLoginId });
      if (res.success && res.data) {
        const data = res.data as { demoOtp: string };
        setDemoOtp(data.demoOtp); // Shown in UI for demo convenience
        setStep('otp');
      } else {
        setError(res.message || 'Could not find an account with that information.');
      }
    } catch {
      setError('Request failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('OTP must be exactly 6 digits.');
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 15) {
      setError('Password must be between 8 and 15 characters.');
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      setError('Password must contain uppercase, lowercase, number, and special character.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.auth.resetPassword({
        emailOrLoginId,
        otp,
        newPassword,
        confirmPassword
      });
      if (res.success) {
        setStep('done');
      } else {
        setError(res.message || 'Password reset failed.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
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
          <h1 className="auth-title">
            {step === 'email' && 'Reset Password'}
            {step === 'otp' && 'Enter OTP'}
            {step === 'done' && 'Password Reset'}
          </h1>
          <p className="auth-subtitle">
            {step === 'email' && 'Enter your Login Id or Email to receive a reset code'}
            {step === 'otp' && 'Enter the 6-digit code and choose a new password'}
            {step === 'done' && 'Your password has been updated successfully'}
          </p>
        </div>

        {error && (
          <div className="alert-box alert-danger">
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Enter email or login id */}
        {step === 'email' && (
          <form onSubmit={handleRequestOtp} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="forgot-identity">Login Id or Email Id</label>
              <div className="form-input-wrapper">
                <span className="form-input-icon"><Mail size={16} /></span>
                <input
                  id="forgot-identity"
                  type="text"
                  className="form-input"
                  placeholder="Enter your Login Id or Email"
                  value={emailOrLoginId}
                  onChange={(e) => { setEmailOrLoginId(e.target.value); setError(''); }}
                  autoFocus
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {/* Step 2: OTP + new password */}
        {step === 'otp' && (
          <>
            {/* Dev-only demo OTP helper */}
            {demoOtp && (
              <div className="alert-box alert-info" style={{ marginBottom: '1.25rem' }}>
                <ShieldCheck size={16} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Demo OTP:</strong> <code style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>{demoOtp}</code>
                  <br />
                  <span style={{ fontSize: '0.78rem', opacity: 0.8 }}>Expires in 10 minutes. This is shown for development only.</span>
                </span>
              </div>
            )}
            <form onSubmit={handleResetPassword} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="otp-input">6-Digit OTP</label>
                <div className="form-input-wrapper">
                  <span className="form-input-icon"><ShieldCheck size={16} /></span>
                  <input
                    id="otp-input"
                    type="text"
                    className="form-input"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                    maxLength={6}
                    style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', fontSize: '1.1rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-password">New Password</label>
                <div className="form-input-wrapper">
                  <span className="form-input-icon"><Lock size={16} /></span>
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="New password (8–15 chars)"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                    style={{ paddingRight: '3rem' }}
                  />
                  <button type="button" onClick={() => setShowPassword(s => !s)} tabIndex={-1}
                    style={{ position: 'absolute', right: '0.9rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', padding: 0 }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm-new-password">Confirm Password</label>
                <div className="form-input-wrapper">
                  <span className="form-input-icon"><Lock size={16} /></span>
                  <input
                    id="confirm-new-password"
                    type="password"
                    className="form-input"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  />
                  {confirmPassword && newPassword === confirmPassword && (
                    <span style={{ position: 'absolute', right: '0.9rem', color: 'var(--success)' }}>
                      <CheckCircle size={16} />
                    </span>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        {/* Step 3: Done */}
        {step === 'done' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
            <div className="alert-box alert-success" style={{ justifyContent: 'center' }}>
              <CheckCircle size={16} />
              <span>Password reset successfully. You can now sign in with your new password.</span>
            </div>
            <button type="button" className="btn btn-primary btn-block" onClick={onSwitchToLogin}>
              Go to Sign In
            </button>
          </div>
        )}

        {step !== 'done' && (
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              margin: '1.25rem auto 0', background: 'none', border: 'none',
              cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.875rem'
            }}
          >
            <ArrowLeft size={14} /> Back to Sign In
          </button>
        )}
      </div>
    </div>
  );
}
