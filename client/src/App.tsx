import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import AuthPage from './modules/auth/AuthPage';
import Navbar from './components/Navbar';
import CommandCenterDashboard from './modules/dashboard/CommandCenterDashboard';
import StockView from './modules/stock/StockView';
import MoveHistoryView from './modules/ledger/MoveHistoryView';
import WarehouseSettingsView from './modules/ledger/WarehouseSettingsView';
import LocationSettingsView from './modules/ledger/LocationSettingsView';
import './styles/index.css';

import FulfillmentEngineView from './modules/fulfillment/FulfillmentEngineView';
import InboundReceiptsView from './modules/receipts/InboundReceiptsView';

export default function App() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [opsFilter, setOpsFilter] = useState<string | undefined>(undefined);

  const handleTabChange = (tab: string, subFilter?: { type?: string; status?: string }) => {
    if (subFilter?.type) {
      setOpsFilter(subFilter.type);
      setActiveTab('Dashboard');
    } else {
      setOpsFilter(undefined);
      setActiveTab(tab);
    }
  };

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
          <span style={{ fontSize: '0.9rem' }}>Loading StockSense Command Center...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // If no user session, show auth pages; otherwise show the full application
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="app-container">
      {/* Global Navigation Top Bar */}
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Workspace Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'Dashboard' && (
          <CommandCenterDashboard initialTypeFilter={opsFilter} />
        )}
        {activeTab === 'Receipts' && <InboundReceiptsView />}
        {activeTab.startsWith('Fulfillment') && (
          <FulfillmentEngineView
            initialSubTab={
              activeTab === 'Fulfillment-transfers'
                ? 'transfers'
                : activeTab === 'Fulfillment-adjustments'
                ? 'adjustments'
                : 'deliveries'
            }
          />
        )}
        {activeTab === 'Stock' && <StockView />}
        {activeTab === 'Move History' && <MoveHistoryView />}
        {activeTab === 'Settings-Warehouse' && <WarehouseSettingsView />}
        {activeTab === 'Settings-Locations' && <LocationSettingsView />}
      </main>
    </div>
  );
}
