import { useState, useEffect, useCallback } from 'react';
import {
  Warehouse, Plus, Pencil, Trash2, X, Check, AlertTriangle,
  Building2, Hash, MapPin as MapPinIcon, RefreshCw, Search
} from 'lucide-react';
import { api } from '../../api/client';

interface WarehouseRecord {
  id: string;
  name: string;
  shortCode: string;
  address: string;
  locationCount: number;
  createdAt: string;
}

const DEMO_WAREHOUSES: WarehouseRecord[] = [
  { id: 'wh-001', name: 'Main Central Warehouse', shortCode: 'WH', address: 'Building 4, Logistics Park, Sector 62', locationCount: 4, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'wh-002', name: 'Secondary Regional Depot', shortCode: 'WH2', address: 'Plot 22B, Industrial Zone, Phase 3', locationCount: 2, createdAt: '2026-02-15T00:00:00.000Z' }
];

interface FormState { name: string; shortCode: string; address: string; }

function InputField({ label, id, value, onChange, placeholder, disabled, icon: Icon, required }: {
  label: string; id: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean; icon?: React.ElementType; required?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label htmlFor={id} style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
        )}
        <input
          id={id}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%', padding: `0.6rem ${Icon ? '0.75rem 0.6rem 2.2rem' : '0.75rem'}`,
            background: disabled ? 'rgba(255,255,255,0.03)' : 'var(--bg-input)',
            border: '1px solid var(--border-subtle)', borderRadius: '8px',
            color: disabled ? 'var(--text-dim)' : 'var(--text-main)',
            fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none',
            cursor: disabled ? 'not-allowed' : 'text', transition: 'all 0.2s'
          }}
          onFocus={e => { if (!disabled) e.target.style.borderColor = 'var(--border-focus)'; }}
          onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
        />
      </div>
    </div>
  );
}

function WarehouseFormModal({ initial, onSave, onClose, mode }: {
  initial?: WarehouseRecord;
  onSave: (form: FormState) => Promise<void>;
  onClose: () => void;
  mode: 'create' | 'edit';
}) {
  const [form, setForm] = useState<FormState>({
    name: initial?.name || '',
    shortCode: initial?.shortCode || '',
    address: initial?.address || ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.shortCode.trim()) {
      setError('Name and Short Code are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
      <div style={{
        width: '100%', maxWidth: '460px',
        background: '#ffffff', border: '1px solid var(--border-subtle)',
        borderRadius: '12px', padding: '1.75rem', boxShadow: 'var(--shadow-modal)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0' }}>
              <Warehouse size={16} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {mode === 'create' ? 'Add New Warehouse' : 'Edit Warehouse'}
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
          <InputField label="Warehouse Name" id="wh-name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Main Central Warehouse" icon={Building2} required />
          <InputField label="Short Code" id="wh-code" value={form.shortCode} onChange={v => setForm(f => ({ ...f, shortCode: v.toUpperCase() }))} placeholder="e.g. WH, NY_CENTRAL" icon={Hash} disabled={mode === 'edit'} required />
          <InputField label="Address" id="wh-address" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} placeholder="e.g. Building 4, Logistics Park" icon={MapPinIcon} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
            Cancel
          </button>
          <button
            id="wh-form-submit"
            onClick={handleSubmit}
            disabled={saving}
            style={{
              flex: 2, padding: '0.65rem', borderRadius: '8px',
              background: saving ? '#475569' : '#0f172a',
              border: 'none', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {saving ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Check size={14} /> {mode === 'create' ? 'Create Warehouse' : 'Save Changes'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ name, onConfirm, onClose }: { name: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '380px', background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.75rem', boxShadow: 'var(--shadow-modal)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', marginBottom: '0.75rem' }}>
            <Trash2 size={22} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>Delete Warehouse?</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            This will permanently delete <strong style={{ color: 'var(--text-main)' }}>"{name}"</strong> and all its locations. This action cannot be undone.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>Cancel</button>
          <button id="wh-confirm-delete" onClick={onConfirm} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', background: '#dc2626', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WarehouseSettingsView() {
  const [warehouses, setWarehouses] = useState<WarehouseRecord[]>(DEMO_WAREHOUSES);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<WarehouseRecord | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.warehouses.getAll() as any;
      if (res?.success && res?.data) setWarehouses(res.data);
    } catch { }
    setIsLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = warehouses.filter(w => {
    const q = search.toLowerCase();
    return !q || w.name.toLowerCase().includes(q) || w.shortCode.toLowerCase().includes(q) || w.address.toLowerCase().includes(q);
  });

  const handleCreate = async (form: FormState) => {
    const res = await api.warehouses.create(form) as any;
    if (!res?.success) throw new Error(res?.message || 'Failed to create warehouse');
    showToast(`Warehouse "${form.name}" created!`);
    setWarehouses(prev => [...prev, res.data]);
  };

  const handleEdit = async (form: FormState) => {
    if (!selected) return;
    const res = await api.warehouses.update(selected.id, { name: form.name, address: form.address }) as any;
    if (!res?.success) throw new Error(res?.message || 'Failed to update');
    showToast('Warehouse updated!');
    setWarehouses(prev => prev.map(w => w.id === selected.id ? { ...w, name: form.name, address: form.address } : w));
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await api.warehouses.delete(selected.id);
      setWarehouses(prev => prev.filter(w => w.id !== selected.id));
      showToast(`Warehouse "${selected.name}" deleted`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
    setModal(null);
    setSelected(null);
  };

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0' }}>
            <Warehouse size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              Warehouse Infrastructure
            </h1>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              Configure physical warehouses, short codes, and addresses
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            id="wh-refresh-btn"
            onClick={load}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 0.95rem', borderRadius: '8px',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button
            id="wh-add-btn"
            onClick={() => { setSelected(null); setModal('create'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.55rem 1rem', borderRadius: '8px',
              background: '#0f172a',
              border: '1px solid #0f172a', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
              boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1e293b'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0f172a'; }}
          >
            <Plus size={16} /> Add Warehouse
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '360px' }}>
        <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
        <input
          id="wh-search"
          placeholder="Search warehouses…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.2rem',
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: '8px', color: 'var(--text-main)', fontSize: '0.85rem',
            fontFamily: 'inherit', outline: 'none'
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--border-focus)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
        />
      </div>

      {/* Warehouse Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
            <Warehouse size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
            <p>No warehouses found</p>
          </div>
        ) : filtered.map(wh => (
          <div key={wh.id} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: '14px', padding: '1.25rem 1.4rem',
            transition: 'all 0.2s', position: 'relative'
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)';
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.15)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = '';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '';
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-subtle)';
            }}
          >
            {/* Card top */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(129,140,248,0.12)', color: '#818cf8', flexShrink: 0 }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{wh.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#818cf8', fontWeight: 700, marginTop: '0.1rem' }}>{wh.shortCode}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  id={`wh-edit-${wh.id}`}
                  onClick={() => { setSelected(wh); setModal('edit'); }}
                  style={{ padding: '0.4rem', borderRadius: '7px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#818cf8'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  id={`wh-delete-${wh.id}`}
                  onClick={() => { setSelected(wh); setModal('delete'); }}
                  style={{ padding: '0.4rem', borderRadius: '7px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Address */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <MapPinIcon size={13} style={{ color: 'var(--text-dim)', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {wh.address || '—'}
              </span>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                fontSize: '0.78rem', fontWeight: 600, color: '#06b6d4',
                background: 'rgba(6,182,212,0.1)', padding: '0.2rem 0.6rem', borderRadius: '6px',
                border: '1px solid rgba(6,182,212,0.2)'
              }}>
                <MapPinIcon size={11} /> {wh.locationCount} Locations
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Added {new Date(wh.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {(modal === 'create' || modal === 'edit') && (
        <WarehouseFormModal
          initial={modal === 'edit' ? selected || undefined : undefined}
          onSave={modal === 'create' ? handleCreate : handleEdit}
          onClose={() => { setModal(null); setSelected(null); }}
          mode={modal}
        />
      )}
      {modal === 'delete' && selected && (
        <ConfirmDeleteModal
          name={selected.name}
          onConfirm={handleDelete}
          onClose={() => { setModal(null); setSelected(null); }}
        />
      )}
    </div>
  );
}
