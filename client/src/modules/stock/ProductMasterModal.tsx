import React, { useState, useEffect } from 'react';
import { X, PackagePlus, Sparkles, AlertCircle } from 'lucide-react';
import { api, ProductItem } from '../../api/client';

interface ProductMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product: ProductItem) => void;
  editingProduct?: ProductItem | null;
}

const CATEGORIES = [
  'Raw Materials',
  'Finished Goods',
  'Electronics',
  'Components',
  'Furniture',
  'Packaging',
  'Hardware'
];

const UOM_OPTIONS = ['Units', 'kg', 'Sheets', 'Meters', 'Liters', 'Box', 'Pallet', 'Pcs'];

const LOCATIONS = [
  { code: 'WH/Stock1', label: 'Warehouse Stock Zone 1 (Main Shelving)' },
  { code: 'WH/Stock2', label: 'Warehouse Stock Zone 2 (Pallet Stacking)' }
];

export const ProductMasterModal: React.FC<ProductMasterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingProduct
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Raw Materials');
  const [uom, setUom] = useState('Units');
  const [unitCost, setUnitCost] = useState<number | ''>(1000);
  const [initialStock, setInitialStock] = useState<number | ''>(20);
  const [locationCode, setLocationCode] = useState('WH/Stock1');
  const [reorderMin, setReorderMin] = useState<number | ''>(10);
  const [reorderMax, setReorderMax] = useState<number | ''>(100);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setSku(editingProduct.sku);
      setCategory(editingProduct.category);
      setUom(editingProduct.uom);
      setUnitCost(editingProduct.unitCost);
      setInitialStock(editingProduct.onHand);
      setLocationCode(editingProduct.locationCode || 'WH/Stock1');
      setReorderMin(editingProduct.reorderMin);
      setReorderMax(editingProduct.reorderMax);
    } else {
      setName('');
      setSku('');
      setCategory('Raw Materials');
      setUom('Units');
      setUnitCost(1000);
      setInitialStock(25);
      setLocationCode('WH/Stock1');
      setReorderMin(10);
      setReorderMax(100);
    }
    setError(null);
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleGenerateSku = () => {
    const catCode = category.slice(0, 3).toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900);
    setSku(`PRD-${catCode}-${randomNum}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a Product Name.');
      return;
    }

    if (!sku.trim()) {
      setError('Please provide an SKU / Code.');
      return;
    }

    const numCost = Number(unitCost);
    const numInitial = Number(initialStock);
    const numMin = Number(reorderMin);
    const numMax = Number(reorderMax);

    if (numCost < 0 || isNaN(numCost)) {
      setError('Unit Cost must be a valid positive number.');
      return;
    }

    if (numMax < numMin) {
      setError('Reorder Max rule must be greater than or equal to Reorder Min rule.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        const res = await api.products.update(editingProduct.id, {
          name: name.trim(),
          sku: sku.trim().toUpperCase(),
          category,
          uom,
          unitCost: numCost,
          reorderMin: numMin,
          reorderMax: numMax
        });
        if (res.success && res.data) {
          onSuccess(res.data);
          onClose();
        } else {
          setError(res.message || 'Error updating product');
        }
      } else {
        const res = await api.products.create({
          name: name.trim(),
          sku: sku.trim().toUpperCase(),
          category,
          uom,
          unitCost: numCost,
          initialStock: numInitial,
          locationShortCode: locationCode,
          reorderMin: numMin,
          reorderMax: numMax
        });
        if (res.success && res.data) {
          onSuccess(res.data);
          onClose();
        } else {
          setError(res.message || 'Error creating product');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save product in master catalog');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatedValuation = (Number(initialStock) || 0) * (Number(unitCost) || 0);

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
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2.25rem',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
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

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
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
            <PackagePlus size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {editingProduct ? 'Edit Product Master' : 'Product Master Setup'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Module 3 — Register item details, location, cost, initial stock, and reordering rules
            </p>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: 'var(--danger)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Identifiers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Steel Rods (12mm TMT)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>SKU / Code *</label>
                <button
                  type="button"
                  onClick={handleGenerateSku}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#818cf8',
                    fontSize: '0.725rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    fontWeight: 600
                  }}
                >
                  <Sparkles size={11} /> Auto SKU
                </button>
              </div>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. PRD-STL-001"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
                required
              />
            </div>
          </div>

          {/* Section 2: Classification & Measurement */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category *</label>
              <select
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Unit of Measure (UoM) *</label>
              <select
                className="form-input"
                value={uom}
                onChange={(e) => setUom(e.target.value)}
              >
                {UOM_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Cost & Initial Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Per Unit Cost (₹ / Rs) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-input"
                placeholder="e.g. 2000"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value === '' ? '' : Number(e.target.value))}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                {editingProduct ? 'Current On-Hand Stock' : 'Initial Opening Stock *'}
              </label>
              <input
                type="number"
                min="0"
                className="form-input"
                placeholder="e.g. 50"
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={Boolean(editingProduct)}
                required
              />
            </div>
          </div>

          {/* Section 4: Target Location */}
          {!editingProduct && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Target Warehouse & Location</label>
              <select
                className="form-input"
                value={locationCode}
                onChange={(e) => setLocationCode(e.target.value)}
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc.code} value={loc.code}>
                    {loc.label} ({loc.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Section 5: Reordering Rules */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.65rem' }}>
              ⚙️ Automated Reordering Rules (Min / Max Stock Engine)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>
                  Reorder Min (Safety Trigger)
                </label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="e.g. 10"
                  value={reorderMin}
                  onChange={(e) => setReorderMin(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                />
                <span style={{ fontSize: '0.675rem', color: 'var(--text-dim)' }}>
                  Triggers "Low Stock" warning when on-hand falls below this
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>
                  Reorder Max (Inventory Ceiling)
                </label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="e.g. 100"
                  value={reorderMax}
                  onChange={(e) => setReorderMax(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                />
                <span style={{ fontSize: '0.675rem', color: 'var(--text-dim)' }}>
                  Maximum capacity cap for replenishment purchase orders
                </span>
              </div>
            </div>
          </div>

          {/* Live Valuation Summary */}
          <div
            style={{
              background: 'var(--primary-light)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.825rem',
              marginBottom: '1.5rem',
              border: '1px solid rgba(99, 102, 241, 0.25)'
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>Estimated Stock Valuation:</span>
            <strong style={{ color: '#818cf8', fontSize: '1rem', fontFamily: 'var(--font-mono)' }}>
              ₹{calculatedValuation.toLocaleString('en-IN')}
            </strong>
          </div>

          {/* Actions */}
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
              style={{ minWidth: '150px' }}
            >
              {isSubmitting
                ? 'Saving...'
                : editingProduct
                ? 'Update Product'
                : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
