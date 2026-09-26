import { useState, useEffect, useCallback } from 'react';
import {
  MapPin, Plus, Pencil, Trash2, X, Check, AlertTriangle,
  RefreshCw, Search, Building2, Hash, ChevronDown, Filter
} from 'lucide-react';
import { api } from '../../api/client';

interface LocationRecord {
  id: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  name: string;
  shortCode: string;
  createdAt: string;
}

interface WarehouseOption { id: string; name: string; shortCode: string; }

const DEMO_LOCATIONS: LocationRecord[] = [
  { id: 'loc-001', warehouseId: 'wh-001', warehouseName: 'Main Central Warehouse', warehouseCode: 'WH', name: 'Warehouse Stock Zone 1', shortCode: 'WH/Stock1', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'loc-002', warehouseId: 'wh-001', warehouseName: 'Main Central Warehouse', warehouseCode: 'WH', name: 'Warehouse Stock Zone 2', shortCode: 'WH/Stock2', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'loc-003', warehouseId: 'wh-001', warehouseName: 'Main Central Warehouse', warehouseCode: 'WH', name: 'Inbound Receiving Dock', shortCode: 'WH/Input', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'loc-004', warehouseId: 'wh-001', warehouseName: 'Main Central Warehouse', warehouseCode: 'WH', name: 'Outbound Dispatch Dock', shortCode: 'WH/Output', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'loc-005', warehouseId: 'wh-002', warehouseName: 'Secondary Regional Depot', warehouseCode: 'WH2', name: 'Regional Stock Floor', shortCode: 'WH2/Stock1', createdAt: '2026-02-15T00:00:00.000Z' },
  { id: 'loc-006', warehouseId: 'wh-002', warehouseName: 'Secondary Regional Depot', warehouseCode: 'WH2', name: 'Regional Receiving Bay', shortCode: 'WH2/Input', createdAt: '2026-02-15T00:00:00.000Z' }
];

const DEMO_WAREHOUSES: WarehouseOption[] = [
  { id: 'wh-001', name: 'Main Central Warehouse', shortCode: 'WH' },
  { id: 'wh-002', name: 'Secondary Regional Depot', shortCode: 'WH2' }
];

function LocationFormModal({ warehouses, initial, onSave, onClose, mode }: {
  warehouses: WarehouseOption[];
  initial?: LocationRecord;
  onSave: (data: { warehouseId: string; name: string; shortCode: string }) => Promise<void>;
  onClose: () => void;
  mode: 'create' | 'edit';
}) {
  const [warehouseId, setWarehouseId] = useState(initial?.warehouseId || (warehouses[0]?.id || ''));
  const [name, setName] = useState(initial?.name || '');
  const [shortCode, setShortCode] = useState(initial?.shortCode || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim() || !shortCode.trim()) {
      setError('Name and Short Code are required.');
      return;
    }
    if (!warehouseId) {
      setError('Please select a warehouse.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({ warehouseId, name, shortCode });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '460px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '1.75rem', boxShadow: 'var(--shadow-lg)', animation: 'fadeInScale 0.2s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>
              <MapPin size={16} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {mode === 'create' ? 'Add New Location' : 'Edit Location'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.85rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.825rem', marginBottom: '1rem' }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Warehouse Select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Parent Warehouse <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Building2 size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
              <ChevronDown size={12} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
              <select
                id="loc-warehouse-select"
                value={warehouseId}
                onChange={e => setWarehouseId(e.target.value)}
                disabled={mode === 'edit'}
                style={{
                  width: '100%', padding: '0.6rem 2rem 0.6rem 2.2rem', appearance: 'none',
                  background: mode === 'edit' ? 'rgba(255,255,255,0.03)' : 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)', borderRadius: '8px',
                  color: 'var(--text-main)', fontSize: '0.875rem', fontFamily: 'inherit',
                  cursor: mode === 'edit' ? 'not-allowed' : 'pointer', outline: 'none'
                }}
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.shortCode})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Location Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
              <input
                id="loc-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Warehouse Stock Zone 1"
                style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.2rem', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-main)', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none' }}
                onFocus={e => (e.target.style.borderColor = 'var(--border-focus)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
              />
            </div>
          </div>

          {/* Short Code */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Short Code <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Hash size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
              <input
                id="loc-shortcode"
                value={shortCode}
                onChange={e => setShortCode(e.target.value)}
                placeholder="e.g. WH/Stock1, WH/Bin-04"
                disabled={mode === 'edit'}
                style={{
                  width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.2rem',
                  background: mode === 'edit' ? 'rgba(255,255,255,0.03)' : 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)', borderRadius: '8px',
                  color: mode === 'edit' ? 'var(--text-dim)' : 'var(--text-main)',
                  fontSize: '0.875rem', fontFamily: 'var(--font-mono)', fontWeight: 700,
                  cursor: mode === 'edit' ? 'not-allowed' : 'text', outline: 'none'
                }}
                onFocus={e => { if (mode !== 'edit') e.target.style.borderColor = 'var(--border-focus)'; }}
                onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
              />
            </div>
            {mode === 'create' && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Use format: <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>WH/Stock1</span>, <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>WH/Bin-04</span>, etc.
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
            Cancel
          </button>
          <button
            id="loc-form-submit"
            onClick={handleSubmit}
            disabled={saving}
            style={{
              flex: 2, padding: '0.65rem', borderRadius: '8px',
              background: saving ? 'rgba(56,189,248,0.3)' : 'linear-gradient(135deg, #0891b2, #06b6d4)',
              border: 'none', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              boxShadow: '0 4px 12px rgba(6,182,212,0.3)'
            }}
          >
            {saving ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Check size={14} /> {mode === 'create' ? 'Create Location' : 'Save Changes'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ name, onConfirm, onClose }: { name: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '380px', background: 'var(--bg-secondary)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '16px', padding: '1.75rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'inline-flex', padding: '0.85rem', borderRadius: '50%', background: 'rgba(239,68,68,0.12)', color: '#ef4444', marginBottom: '0.85rem' }}>
            <Trash2 size={24} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>Delete Location?</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Delete <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>"{name}"</strong>? This cannot be undone.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>Cancel</button>
          <button id="loc-confirm-delete" onClick={onConfirm} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', background: 'linear-gradient(135deg, #dc2626, #ef4444)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LocationSettingsView() {
  const [locations, setLocations] = useState<LocationRecord[]>(DEMO_LOCATIONS);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>(DEMO_WAREHOUSES);
  const [search, setSearch] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<LocationRecord | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    try {
      const [locRes, whRes] = await Promise.all([
        api.locations.getAll() as any,
        api.warehouses.getAll() as any
      ]);
      if (locRes?.success && locRes?.data) setLocations(locRes.data);
      if (whRes?.success && whRes?.data) setWarehouses(whRes.data.map((w: any) => ({ id: w.id, name: w.name, shortCode: w.shortCode })));
    } catch { }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = locations.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.name.toLowerCase().includes(q) || l.shortCode.toLowerCase().includes(q) || l.warehouseName.toLowerCase().includes(q);
    const matchWh = !filterWarehouse || l.warehouseId === filterWarehouse;
    return matchSearch && matchWh;
  });

  const handleCreate = async (data: { warehouseId: string; name: string; shortCode: string }) => {
    const res = await api.locations.create(data) as any;
    if (!res?.success) throw new Error(res?.message || 'Failed to create location');
    showToast(`Location "${data.shortCode}" created!`);
    setLocations(prev => [...prev, res.data]);
  };

  const handleEdit = async (data: { warehouseId: string; name: string; shortCode: string }) => {
    if (!selected) return;
    const res = await api.locations.update(selected.id, { name: data.name }) as any;
    if (!res?.success) throw new Error(res?.message || 'Failed to update');
    showToast('Location updated!');
    setLocations(prev => prev.map(l => l.id === selected.id ? { ...l, name: data.name } : l));
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await api.locations.delete(selected.id);
      setLocations(prev => prev.filter(l => l.id !== selected.id));
      showToast(`Location "${selected.shortCode}" deleted`);
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
    setModal(null);
    setSelected(null);
  };

  // Group by warehouse
  const grouped = warehouses.map(wh => ({
    warehouse: wh,
    locations: filtered.filter(l => l.warehouseId === wh.id)
  })).filter(g => g.locations.length > 0 || !filterWarehouse);

  return (
    <div style={{ padding: '1.5rem 2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 999,
          padding: '0.75rem 1.25rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem',
          background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
          color: toast.type === 'success' ? '#10b981' : '#ef4444',
          boxShadow: 'var(--shadow-md)', animation: 'fadeInScale 0.2s ease'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>
            <MapPin size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              Location Hierarchy
            </h1>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              Manage internal zones, racks, bins, and virtual partner locations
            </p>
          </div>
        </div>
        <button
          id="loc-add-btn"
          onClick={() => { setSelected(null); setModal('create'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1.1rem', borderRadius: '9px',
            background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
            border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
            boxShadow: '0 4px 12px rgba(6,182,212,0.3)', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; }}
        >
          <Plus size={16} /> Add Location
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            id="loc-search"
            placeholder="Search locations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.2rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-main)', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none' }}
            onFocus={e => (e.target.style.borderColor = 'var(--border-focus)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <Filter size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
          <ChevronDown size={12} style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
          <select
            id="loc-warehouse-filter"
            value={filterWarehouse}
            onChange={e => setFilterWarehouse(e.target.value)}
            style={{ padding: '0.55rem 2rem 0.55rem 1.8rem', appearance: 'none', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: filterWarehouse ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '0.82rem', fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}
          >
            <option value="">All Warehouses</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.shortCode})</option>)}
          </select>
        </div>
      </div>

      {/* Location Table by warehouse group */}
      {grouped.map(({ warehouse, locations: locs }) => (
        <div key={warehouse.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
          {/* Group header */}
          <div style={{
            padding: '0.8rem 1.25rem',
            background: 'rgba(255,255,255,0.02)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: '0.6rem'
          }}>
            <Building2 size={15} color="#818cf8" />
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>{warehouse.name}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#818cf8', background: 'rgba(129,140,248,0.12)', padding: '0.15rem 0.5rem', borderRadius: '5px', fontWeight: 700 }}>{warehouse.shortCode}</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-dim)' }}>{locs.length} location{locs.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1.2fr 1fr 100px', padding: '0.6rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
            {['Short Code', 'Location Name', 'Parent WH', 'Added', 'Actions'].map(h => (
              <div key={h} style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
            ))}
          </div>

          {locs.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              No locations in this warehouse
            </div>
          ) : locs.map((loc, idx) => (
            <div
              key={loc.id}
              style={{
                display: 'grid', gridTemplateColumns: '1.5fr 2fr 1.2fr 1fr 100px',
                padding: '0.7rem 1.25rem', alignItems: 'center',
                borderBottom: idx < locs.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.025)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = ''}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8' }}>{loc.shortCode}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{loc.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{loc.warehouseName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {new Date(loc.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  id={`loc-edit-${loc.id}`}
                  onClick={() => { setSelected(loc); setModal('edit'); }}
                  style={{ padding: '0.35rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', transition: 'color 0.2s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#38bdf8')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)')}
                >
                  <Pencil size={12} />
                </button>
                <button
                  id={`loc-delete-${loc.id}`}
                  onClick={() => { setSelected(loc); setModal('delete'); }}
                  style={{ padding: '0.35rem', borderRadius: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', transition: 'color 0.2s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#ef4444')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)')}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
          <MapPin size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
          <p>No locations match your filters</p>
        </div>
      )}

      {/* Modals */}
      {(modal === 'create' || modal === 'edit') && (
        <LocationFormModal
          warehouses={warehouses}
          initial={modal === 'edit' ? selected || undefined : undefined}
          onSave={modal === 'create' ? handleCreate : handleEdit}
          onClose={() => { setModal(null); setSelected(null); }}
          mode={modal}
        />
      )}
      {modal === 'delete' && selected && (
        <ConfirmDeleteModal
          name={selected.shortCode}
          onConfirm={handleDelete}
          onClose={() => { setModal(null); setSelected(null); }}
        />
      )}
    </div>
  );
}
