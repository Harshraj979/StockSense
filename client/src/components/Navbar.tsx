import { useState, useRef, useEffect } from 'react';
import {
  Package,
  LayoutDashboard,
  Boxes,
  ArrowRightLeft,
  Settings,
  ChevronDown,
  LogOut,
  Warehouse,
  MapPin,
  FileCheck,
  Truck,
  Sliders,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string, subFilter?: { type?: string; status?: string }) => void;
}

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const { user, logout } = useAuth();
  const [opsDropdownOpen, setOpsDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const opsRef = useRef<HTMLLIElement>(null);
  const settingsRef = useRef<HTMLLIElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (opsRef.current && !opsRef.current.contains(event.target as Node)) {
        setOpsDropdownOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'A';

  return (
    <header className="top-navbar">
      <div className="nav-brand-section">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onTabChange('Dashboard');
          }}
          className="nav-brand-logo"
        >
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
            boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)'
          }}>
            <Package size={18} color="#ffffff" />
          </div>
          <span style={{ letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            StockSense
          </span>
        </a>

        {/* Navigation Menu */}
        <nav>
          <ul className="nav-menu-links">
            {/* Dashboard */}
            <li>
              <button
                className={`nav-link ${activeTab === 'Dashboard' ? 'active' : ''}`}
                onClick={() => onTabChange('Dashboard')}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>
            </li>

            {/* Operations Dropdown */}
            <li className="nav-dropdown" ref={opsRef}>
              <button
                className={`nav-link ${activeTab.startsWith('Operations') ? 'active' : ''}`}
                onClick={() => setOpsDropdownOpen(!opsDropdownOpen)}
              >
                <Boxes size={16} />
                Operations
                <ChevronDown size={14} style={{ transform: opsDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </button>
              {opsDropdownOpen && (
                <div className="nav-dropdown-menu">
                  <button
                    className={`dropdown-item ${activeTab === 'Operations-Receipt' ? 'active' : ''}`}
                    onClick={() => {
                      onTabChange('Dashboard', { type: 'IN' });
                      setOpsDropdownOpen(false);
                    }}
                  >
                    <FileCheck size={15} color="#10b981" />
                    Receipt
                  </button>
                  <button
                    className={`dropdown-item ${activeTab === 'Operations-Delivery' ? 'active' : ''}`}
                    onClick={() => {
                      onTabChange('Dashboard', { type: 'OUT' });
                      setOpsDropdownOpen(false);
                    }}
                  >
                    <Truck size={15} color="#6366f1" />
                    Delivery
                  </button>
                  <button
                    className={`dropdown-item ${activeTab === 'Operations-Adjustment' ? 'active' : ''}`}
                    onClick={() => {
                      onTabChange('Dashboard', { type: 'ADJ' });
                      setOpsDropdownOpen(false);
                    }}
                  >
                    <Sliders size={15} color="#f59e0b" />
                    Adjustment
                  </button>
                  <button
                    className={`dropdown-item ${activeTab === 'Operations-Internal' ? 'active' : ''}`}
                    onClick={() => {
                      onTabChange('Dashboard', { type: 'INT' });
                      setOpsDropdownOpen(false);
                    }}
                  >
                    <RefreshCw size={15} color="#06b6d4" />
                    Internal Move
                  </button>
                </div>
              )}
            </li>

            {/* Stock */}
            <li>
              <button
                className={`nav-link ${activeTab === 'Stock' ? 'active' : ''}`}
                onClick={() => onTabChange('Stock')}
              >
                <Boxes size={16} />
                Stock
              </button>
            </li>

            {/* Move History */}
            <li>
              <button
                className={`nav-link ${activeTab === 'Move History' ? 'active' : ''}`}
                onClick={() => onTabChange('Move History')}
              >
                <ArrowRightLeft size={16} />
                Move History
              </button>
            </li>

            {/* Settings Dropdown */}
            <li className="nav-dropdown" ref={settingsRef}>
              <button
                className={`nav-link ${activeTab.startsWith('Settings') ? 'active' : ''}`}
                onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
              >
                <Settings size={16} />
                Settings
                <ChevronDown size={14} style={{ transform: settingsDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </button>
              {settingsDropdownOpen && (
                <div className="nav-dropdown-menu">
                  <button
                    className={`dropdown-item ${activeTab === 'Settings-Warehouse' ? 'active' : ''}`}
                    onClick={() => {
                      onTabChange('Settings-Warehouse');
                      setSettingsDropdownOpen(false);
                    }}
                  >
                    <Warehouse size={15} color="#818cf8" />
                    Warehouse
                  </button>
                  <button
                    className={`dropdown-item ${activeTab === 'Settings-Locations' ? 'active' : ''}`}
                    onClick={() => {
                      onTabChange('Settings-Locations');
                      setSettingsDropdownOpen(false);
                    }}
                  >
                    <MapPin size={15} color="#38bdf8" />
                    Locations
                  </button>
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>

      {/* User Section with Avatar A */}
      <div className="nav-user-section" ref={userRef}>
        <span className={`role-badge ${user?.role === 'MANAGER' ? 'manager' : 'staff'}`}>
          {user?.role || 'MANAGER'}
        </span>

        {/* User Avatar (A) */}
        <button
          className="user-avatar-btn"
          title={user?.name || 'User Profile'}
          onClick={() => setUserMenuOpen(!userMenuOpen)}
        >
          {avatarInitial}
        </button>

        {userMenuOpen && (
          <div className="nav-dropdown-menu" style={{ right: 0, left: 'auto', minWidth: '220px' }}>
            <div style={{ padding: '0.65rem 0.85rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                ID: {user?.loginId}
              </div>
            </div>
            <button
              className="dropdown-item"
              style={{ color: '#f87171', marginTop: '0.25rem' }}
              onClick={logout}
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
