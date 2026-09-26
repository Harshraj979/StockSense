import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Info } from 'lucide-react';
import { ProductItem } from '../../api/client';

interface StockAllocationShieldProps {
  product: ProductItem;
  compact?: boolean;
}

export const StockAllocationShield: React.FC<StockAllocationShieldProps> = ({ product, compact = false }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const { onHand, reserved, freeToUse, reorderMin } = product;

  // Percentage calculations
  const total = Math.max(onHand, 1);
  const freePct = Math.min(100, Math.max(0, (freeToUse / total) * 100));
  const reservedPct = Math.min(100 - freePct, Math.max(0, (reserved / total) * 100));

  // Allocation status
  const isHealthy = freeToUse > reorderMin;
  const isWarning = freeToUse <= reorderMin && freeToUse > 0;
  const isLocked = freeToUse === 0;

  const statusColor = isLocked
    ? 'var(--danger)'
    : isWarning
    ? 'var(--warning)'
    : 'var(--success)';

  const statusBg = isLocked
    ? 'var(--danger-bg)'
    : isWarning
    ? 'var(--warning-bg)'
    : 'var(--success-bg)';

  if (compact) {
    return (
      <div
        className="shield-badge-container"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: statusBg,
            color: statusColor,
            border: `1px solid ${statusColor}33`,
            cursor: 'help'
          }}
        >
          {isLocked ? (
            <ShieldAlert size={13} />
          ) : isHealthy ? (
            <ShieldCheck size={13} />
          ) : (
            <Shield size={13} />
          )}
          <span>{freeToUse} {product.uom} Free</span>
        </div>

        {/* Floating Tooltip with Math Breakdown */}
        {showTooltip && (
          <div
            style={{
              position: 'absolute',
              bottom: '125%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#0d1322',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '0.75rem',
              width: '240px',
              zIndex: 100,
              boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
              fontSize: '0.75rem',
              color: 'var(--text-main)',
              pointerEvents: 'none'
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: statusColor }}>
              <Shield size={13} />
              Stock Allocation Shield
            </div>
            <div style={{ color: 'var(--text-muted)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
              Free = On-Hand ({onHand}) - Reserved ({reserved})
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ color: 'var(--text-dim)' }}>Physical On-Hand:</span>
              <strong>{onHand} {product.uom}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ color: '#a78bfa' }}>Committed Delivery:</span>
              <strong>-{reserved} {product.uom}</strong>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.3rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: statusColor, fontWeight: 700 }}>Free to Dispatch:</span>
              <strong style={{ color: statusColor }}>{freeToUse} {product.uom}</strong>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.65)',
        border: `1px solid ${statusColor}40`,
        borderRadius: '12px',
        padding: '1rem',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: statusBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: statusColor
            }}
          >
            {isLocked ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
          </div>
          <div>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Stock Allocation Shield
            </span>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              Prevents overselling & inventory collision
            </div>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.7rem',
            padding: '0.2rem 0.5rem',
            borderRadius: '6px',
            background: statusBg,
            color: statusColor,
            fontWeight: 700
          }}
        >
          {isLocked ? 'ZERO FREE BUFFER' : isWarning ? 'BUFFER WARNING' : 'PROTECTED & READY'}
        </span>
      </div>

      {/* Allocation Multi-Segment Visual Bar */}
      <div
        style={{
          width: '100%',
          height: '10px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '999px',
          overflow: 'hidden',
          display: 'flex',
          margin: '0.75rem 0'
        }}
      >
        <div
          title={`Free to use: ${freeToUse} ${product.uom} (${freePct.toFixed(0)}%)`}
          style={{
            width: `${freePct}%`,
            background: 'linear-gradient(90deg, #10b981, #34d399)',
            transition: 'width 0.4s ease'
          }}
        />
        <div
          title={`Reserved: ${reserved} ${product.uom} (${reservedPct.toFixed(0)}%)`}
          style={{
            width: `${reservedPct}%`,
            background: 'linear-gradient(90deg, #6366f1, #818cf8)',
            transition: 'width 0.4s ease'
          }}
        />
      </div>

      {/* Formula & Numbers breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          fontSize: '0.75rem',
          textAlign: 'center'
        }}
      >
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '6px' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.675rem' }}>ON HAND</div>
          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
            {onHand}
          </div>
        </div>

        <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '0.4rem', borderRadius: '6px' }}>
          <div style={{ color: '#a78bfa', fontSize: '0.675rem' }}>RESERVED (DELIVERY)</div>
          <div style={{ fontWeight: 700, color: '#c4b5fd', fontSize: '0.9rem' }}>
            -{reserved}
          </div>
        </div>

        <div style={{ background: `${statusBg}`, padding: '0.4rem', borderRadius: '6px' }}>
          <div style={{ color: statusColor, fontSize: '0.675rem' }}>FREE TO USE</div>
          <div style={{ fontWeight: 700, color: statusColor, fontSize: '0.9rem' }}>
            {freeToUse} {product.uom}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '0.6rem', fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <Info size={12} />
        <span>Formula: <code>Free to Use = On Hand - Reserved</code> (Safety trigger: Min {reorderMin} {product.uom})</span>
      </div>
    </div>
  );
};
