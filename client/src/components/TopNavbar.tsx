import React, { useState } from 'react';
import {
  Package,
  ChevronDown,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Warehouse,
  MapPin,
  LogOut,
  UserCheck,
  Shield,
  History,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout, switchRole } = useAuth();
  const [operationsOpen, setOperationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isManager = user?.role === 'MANAGER';

  return (
    <nav
      className="top-navbar"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 2rem',
        background: 'rgba(10, 13, 20, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      {/* Brand & Main Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('stock')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            cursor: 'pointer',
            textDecoration: 'none'
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 15px rgba(79, 70, 229, 0.4)'
            }}
          >
            <Package size={20} />
          </div>
          <div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              StockSense
            </span>
          </div>
        </div>

        {/* Global Navigation Items matching Excalidraw */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              background: activeTab === 'dashboard' ? 'rgba(255, 255, 255, 0.08)' : 'none',
              border: 'none',
              color: activeTab === 'dashboard' ? 'var(--text-main)' : 'var(--text-muted)',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: activeTab === 'dashboard' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'var(--transition)'
            }}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>

          {/* Operations Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setOperationsOpen(!operationsOpen)}
              onBlur={() => setTimeout(() => setOperationsOpen(false), 200)}
              style={{
                background: activeTab === 'operations' ? 'rgba(255, 255, 255, 0.08)' : 'none',
                border: 'none',
                color: activeTab === 'operations' ? 'var(--text-main)' : 'var(--text-muted)',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'var(--transition)'
              }}
            >
              <Layers size={16} />
              Operations
              <ChevronDown size={14} />
            </button>

            {operationsOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  width: '180px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.5rem',
                  zIndex: 600
                }}
              >
                <div
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}
                  onMouseDown={() => alert('Module 4: Inbound Operations (Receipts) will load here')}
                >
                  <ArrowDownLeft size={14} color="#10b981" />
                  Receipts (IN)
                </div>
                <div
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}
                  onMouseDown={() => alert('Module 5: Outbound Operations (Deliveries) will load here')}
                >
                  <ArrowUpRight size={14} color="#ef4444" />
                  Deliveries (OUT)
                </div>
                <div
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}
                  onMouseDown={() => setActiveTab('stock')}
                >
                  <RefreshCw size={14} color="#818cf8" />
                  Stock Adjustments
                </div>
              </div>
            )}
          </div>

          {/* Stock (Active Module 3 Tab) */}
          <button
            onClick={() => setActiveTab('stock')}
            style={{
              background: activeTab === 'stock' ? 'var(--primary-light)' : 'none',
              border: activeTab === 'stock' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
              color: activeTab === 'stock' ? '#a5b4fc' : 'var(--text-muted)',
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'var(--transition)'
            }}
          >
            <Package size={16} />
            Stock
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--success)'
              }}
            />
          </button>

          {/* Move History (Ledger) */}
          <button
            onClick={() => alert('Module 6: Unified Double-Entry Stock Ledger will load here')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'var(--transition)'
            }}
          >
            <History size={16} />
            Move History
          </button>

          {/* Settings Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              onBlur={() => setTimeout(() => setSettingsOpen(false), 200)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'var(--transition)'
              }}
            >
              Settings
              <ChevronDown size={14} />
            </button>

            {settingsOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  width: '180px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.5rem',
                  zIndex: 600
                }}
              >
                <div
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}
                  onMouseDown={() => alert('Warehouse Settings (Main Central Warehouse - WH)')}
                >
                  <Warehouse size={14} />
                  Warehouses
                </div>
                <div
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}
                  onMouseDown={() => alert('Spatial Locations (WH/Stock1, WH/Stock2)')}
                >
                  <MapPin size={14} />
                  Locations
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Tools: Role Switcher & User Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Module 1 Innovation: Simulated Quick-Role Switcher */}
        <div
          title="Module 1 Differentiator: Instant Role Switcher for Live Permission Testing"
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '999px',
            padding: '2px',
            fontSize: '0.725rem'
          }}
        >
          <button
            onClick={() => switchRole('MANAGER')}
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              border: 'none',
              background: isManager ? 'var(--primary)' : 'transparent',
              color: isManager ? '#ffffff' : 'var(--text-muted)',
              fontWeight: isManager ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'var(--transition)'
            }}
          >
            <Shield size={11} /> Manager
          </button>
          <button
            onClick={() => switchRole('STAFF')}
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              border: 'none',
              background: !isManager ? '#059669' : 'transparent',
              color: !isManager ? '#ffffff' : 'var(--text-muted)',
              fontWeight: !isManager ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'var(--transition)'
            }}
          >
            <UserCheck size={11} /> Staff
          </button>
        </div>

        {/* User Identity Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            className="user-avatar-btn"
            title={`${user?.name} (${user?.role})`}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: isManager ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'linear-gradient(135deg, #059669, #10b981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              padding: '0.35rem 0.5rem',
              borderRadius: '6px'
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </nav>
  );
};
