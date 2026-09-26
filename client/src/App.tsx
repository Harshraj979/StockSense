import React from 'react';
import { useAuth } from './context/AuthContext';
import AuthPage from './modules/auth/AuthPage';
import DashboardPlaceholder from './modules/dashboard/DashboardPlaceholder';
import './styles/index.css';

export default function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg-primary)'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{
            width: '40px', height: '40px', border: '3px solid var(--border-subtle)',
            borderTop: '3px solid var(--primary)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem'
          }} />
          <span style={{ fontSize: '0.9rem' }}>Loading StockSense...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // If no user session → show auth pages; otherwise show the app
  if (!user) {
    return <AuthPage />;
  }

  return <DashboardPlaceholder />;
}
