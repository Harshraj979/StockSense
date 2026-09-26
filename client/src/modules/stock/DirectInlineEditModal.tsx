import React, { useState } from 'react';
import { X, RefreshCw, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { ProductItem } from '../../api/client';

interface DirectInlineEditModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onSave: (productId: string, newOnHand: number, reason: string) => Promise<void>;
}

const REASONS = [
  'Physical Cycle Count Audit',
  'Supplier Inward Restock',
  'Damaged / Scrap Write-off',
  'Production Floor Return',
  'Warehouse Relocation Adjustment'
];

export const DirectInlineEditModal: React.FC<DirectInlineEditModalProps> = ({
  product,
  onClose,
  onSave
}) => {
  const [newOnHand, setNewOnHand] = useState<number | ''>(product ? product.onHand : 0);
  const [reason, setReason] = useState(REASONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!product) return null;

  const currentOnHand = product.onHand;
  const reserved = product.reserved;
  const targetOnHand = newOnHand === '' ? currentOnHand : Number(newOnHand);

  // Instant Balance Recalculation
  const recalculatedFreeToUse = Math.max(0, targetOnHand - reserved);
  const difference = targetOnHand - currentOnHand;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newOnHand === '' || targetOnHand < 0) {
      setError('Please enter a valid on-hand stock quantity.');
      return;
    }

    if (targetOnHand < reserved) {
      setError(`Cannot set on-hand to ${targetOnHand}: ${reserved} units are already reserved for confirmed outgoing deliveries.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave(product.id, targetOnHand, reason);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error updating stock level');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1.5rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '500px',
          padding: '2rem',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '6px'
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8'
            }}
          >
            <RefreshCw size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Direct Inline Stock Update
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Instant balance recalculation & ledger audit synchronization
            </p>
          </div>
        </div>

        {/* Product Identity */}
        <div
          style={{
            background: 'var(--bg-tertiary)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
            {product.name}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>SKU: <strong style={{ color: '#818cf8', fontFamily: 'var(--font-mono)' }}>{product.sku}</strong></span>
            <span>•</span>
            <span>UoM: <strong>{product.uom}</strong></span>
            <span>•</span>
            <span>Cost: <strong>₹{product.unitCost}</strong></span>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger)',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              color: 'var(--danger)',
              fontSize: '0.8rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertTriangle size={15} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Real-time Recalculation Card */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.25rem',
              textAlign: 'center'
            }}
          >
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>CURRENT ON-HAND</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                {currentOnHand}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                {product.freeToUse} Free
              </div>
            </div>

            <div style={{ color: '#818cf8', padding: '0 0.5rem' }}>
              <ArrowRight size={20} />
            </div>

            <div>
              <div style={{ color: '#10b981', fontSize: '0.7rem' }}>NEW RECALCULATED</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
                {targetOnHand}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                {recalculatedFreeToUse} Free to Use
              </div>
            </div>
          </div>

          {/* New On Hand Input */}
          <div className="form-group">
            <label className="form-label">
              Physical Counted On-Hand Quantity ({product.uom}) *
            </label>
            <input
              type="number"
              min="0"
              className="form-input"
              value={newOnHand}
              onChange={(e) => setNewOnHand(e.target.value === '' ? '' : Number(e.target.value))}
              style={{ fontSize: '1.1rem', fontWeight: 700 }}
              required
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-dim)' }}>
                Reserved for orders: <strong>{reserved} {product.uom}</strong>
              </span>
              <span
                style={{
                  fontWeight: 700,
                  color: difference > 0 ? 'var(--success)' : difference < 0 ? 'var(--danger)' : 'var(--text-muted)'
                }}
              >
                Variance: {difference > 0 ? `+${difference}` : difference} {product.uom}
              </span>
            </div>
          </div>

          {/* Audit Reason Selector */}
          <div className="form-group">
            <label className="form-label">Audit Ledger Reason *</label>
            <select
              className="form-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Shield notice */}
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: '#34d399',
              marginBottom: '1.5rem'
            }}
          >
            <ShieldCheck size={16} />
            <span>
              Stock Allocation Shield will immediately recalculate Free to Use = {targetOnHand} - {reserved} = <strong>{recalculatedFreeToUse} {product.uom}</strong>.
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Commit Stock Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
