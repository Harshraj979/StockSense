import { Flame, Activity } from 'lucide-react';

interface UrgencyHeatmapHeaderProps {
  heatRiskIndex: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  heatmapActive: boolean;
  onToggleHeatmap: () => void;
  totalLate: number;
  totalWaiting: number;
}

export default function UrgencyHeatmapHeader({
  heatRiskIndex,
  heatmapActive,
  onToggleHeatmap,
  totalLate,
  totalWaiting
}: UrgencyHeatmapHeaderProps) {
  return (
    <div className={`heatmap-banner ${heatmapActive ? 'heatmap-active-border' : ''}`}>
      <div className="heatmap-status-indicator">
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '36px', height: '36px', borderRadius: '10px',
          background: heatmapActive ? 'rgba(239, 68, 68, 0.2)' : 'var(--primary-light)',
          color: heatmapActive ? '#ef4444' : '#818cf8',
          border: heatmapActive ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(99, 102, 241, 0.3)'
        }}>
          <Flame size={20} className={heatmapActive ? 'pulse-icon' : ''} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Operational Urgency Heatmap & Risk Index
            </h4>
            <span className={`heat-badge ${heatRiskIndex.toLowerCase()}`}>
              {heatRiskIndex} RISK
            </span>
          </div>

          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            {totalLate} Overdue schedule date(s) • {totalWaiting} Stock shortage bottleneck(s) require active intervention
          </p>
        </div>
      </div>

      {/* Heatmap Mode Toggle Button */}
      <button
        className={`toggle-switch-btn ${heatmapActive ? 'active' : ''}`}
        onClick={onToggleHeatmap}
        title="Toggle high-contrast Operational Heatmap visual pulses"
      >
        <Activity size={15} />
        <span>Heatmap Pulse Mode: <strong>{heatmapActive ? 'ON' : 'OFF'}</strong></span>
      </button>
    </div>
  );
}
