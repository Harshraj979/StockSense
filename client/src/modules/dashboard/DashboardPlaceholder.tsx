// Temporary dashboard placeholder — shown to authenticated users until
// Module 2 (Command Center Dashboard) is implemented.

import React from 'react';
import { Package, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPlaceholder() {
  const { user, logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Temporary Navbar */}
      <nav className="top-navbar">
        <div className="nav-brand-section">
          <a className="nav-brand-logo" href="#">
            <Package size={20} color="#6366f1" />
            StockSense
          </a>
        </div>
        <div className="nav-user-section">
          <span className={`role-badge ${user?.role === 'MANAGER' ? 'manager' : 'staff'}`}>
            {user?.role}
          </span>
          <div className="user-avatar-btn" title={user?.name}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '0.875rem', padding: '0.5rem'
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Welcome Card */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)', padding: '2rem'
      }}>
        <div style={{
          textAlign: 'center', maxWidth: '500px',
          background: 'var(--bg-card)', backdropFilter: 'var(--backdrop-blur)',
          border: '1px solid var(--border-subtle)', borderRadius: '16px',
          padding: '3rem 2.5rem', boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'var(--primary-light)', marginBottom: '1.5rem'
          }}>
            <LayoutDashboard size={32} color="#6366f1" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Welcome, {user?.name} 👋
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Module 1 (Authentication & Access Control) is complete and working.
          </p>
          <div style={{
            background: 'var(--bg-tertiary)', borderRadius: '8px',
            padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)', textAlign: 'left'
          }}>
            <div>User: <span style={{ color: 'var(--success)' }}>{user?.loginId}</span></div>
            <div>Role: <span style={{ color: '#a78bfa' }}>{user?.role}</span></div>
            <div>Email: <span style={{ color: 'var(--text-main)' }}>{user?.email}</span></div>
          </div>
          <p style={{ marginTop: '1.25rem', fontSize: '0.825rem', color: 'var(--text-dim)' }}>
            Next: Module 2 — Command Center Dashboard will be built here.
          </p>
        </div>
      </div>
    </div>
  );
}
