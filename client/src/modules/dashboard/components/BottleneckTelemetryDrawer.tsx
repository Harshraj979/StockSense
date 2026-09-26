import { X, AlertTriangle, ShieldAlert, Box, RefreshCw, Zap } from 'lucide-react';
import { BottleneckItem } from '../../../types/dashboard';

interface BottleneckTelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bottlenecks: BottleneckItem[];
  onReplenishSuccess?: () => void;
}

export default function BottleneckTelemetryDrawer({
  isOpen,
  onClose,
  bottlenecks,
  onReplenishSuccess
}: BottleneckTelemetryDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="telemetry-drawer-overlay" onClick={onClose}>
      <div className="telemetry-drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="telemetry-header">
          <div className="telemetry-title-group">
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24',
              border: '1px solid rgba(245, 158, 11, 0.4)'
            }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Smart Bottleneck Telemetry
              </h2>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Real-time blocked inventory diagnostics & stock shortages
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', padding: '0.5rem', borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Telemetry Body */}
        <div className="telemetry-body">
          {/* Diagnostic Summary Banner */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem'
          }}>
            <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fca5a5' }}>
                {bottlenecks.length} Outbound Deliveries Blocked
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Automated status engine detected insufficient available stock to fulfill customer demand.
              </div>
            </div>
          </div>

          {/* Bottleneck Items List */}
          {bottlenecks.map((item) => (
            <div key={item.id} className="bottleneck-card">
              {/* Item Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="reference-badge" style={{ fontSize: '0.95rem' }}>
                    {item.operationRef}
                  </span>
                  <span style={{
                    fontSize: '0.725rem', fontWeight: 800, padding: '0.2rem 0.55rem',
                    borderRadius: '6px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.4)'
                  }}>
                    {item.urgency} BOTTLENECK
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  {item.warehouse} ({item.location})
                </span>
              </div>

              {/* Product Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.25rem 0' }}>
                <div style={{
                  padding: '0.6rem', background: 'var(--bg-tertiary)', borderRadius: '8px',
                  color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Box size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    {item.productName}
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    SKU: {item.productSku} • Partner: <span style={{ color: 'var(--text-muted)' }}>{item.partnerContact}</span>
                  </div>
                </div>
              </div>

              {/* Stat Telemetry Grid */}
              <div className="telemetry-stat-row">
                <div className="telemetry-stat-box">
                  <div className="telemetry-stat-label">Demanded</div>
                  <div className="telemetry-stat-val">{item.demandQty} units</div>
                </div>
                <div className="telemetry-stat-box">
                  <div className="telemetry-stat-label">Free Available</div>
                  <div className="telemetry-stat-val" style={{ color: '#34d399' }}>{item.availableQty} units</div>
                </div>
                <div className="telemetry-stat-box">
                  <div className="telemetry-stat-label">Shortage Deficit</div>
                  <div className="telemetry-stat-val shortage">-{item.shortageQty} units</div>
                </div>
              </div>

              {/* Immediate Telemetry Action */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.35rem' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.55rem 0.85rem', fontSize: '0.825rem' }}
                  onClick={() => {
                    alert(`Initiated Stock Replenishment Request for ${item.shortageQty} units of ${item.productName} into ${item.location}!`);
                    if (onReplenishSuccess) onReplenishSuccess();
                  }}
                >
                  <Zap size={14} />
                  Trigger Quick Replenishment
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.55rem 0.85rem', fontSize: '0.825rem' }}
                  onClick={() => {
                    alert(`Opened stock allocation manager for ${item.productSku}`);
                  }}
                >
                  <RefreshCw size={14} />
                  Reallocate Stock
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
