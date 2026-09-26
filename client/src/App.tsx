import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import AuthPage from './modules/auth/AuthPage';
import StockView from './modules/stock/StockView';
import { TopNavbar } from './components/TopNavbar';
import DashboardPlaceholder from './modules/dashboard/DashboardPlaceholder';
import './styles/index.css';

export default function App() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'stock' | 'dashboard' | 'operations'>('stock');

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

  // If no user session → show auth pages (Module 1); otherwise show the application
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <TopNavbar activeTab={activeTab} setActiveTab={(tab: any) => setActiveTab(tab)} />

      <main style={{ flex: 1 }}>
        {activeTab === 'stock' ? (
          <StockView />
        ) : (
          <DashboardPlaceholder />
        )}
      </main>
    </div>
  );
}
