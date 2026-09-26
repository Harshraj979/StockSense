import { useState, useEffect, useCallback } from 'react';
import {
  ArrowRightLeft, Search, Filter, RefreshCw,
  TrendingUp, TrendingDown, Layers, Activity,
  LayoutList, Kanban, ChevronDown, X,
  PackageCheck, PackageX, ArrowLeftRight, Clock
} from 'lucide-react';
import { api } from '../../api/client';

interface LedgerEntry {
  id: string;
  reference: string;
  date: string;
  contact: string;
  fromLocation: string;
  toLocation: string;
  productName: string;
  productId: string;
  quantity: number;
  status: string;
  moveType: 'IN' | 'OUT' | 'INT';
  createdAt: string;
}

const DEMO_LEDGER: LedgerEntry[] = [
  {
    id: 'led-001',
    reference: 'WH/IN/0003',
    date: '2026-09-26T14:00:00.000Z',
    contact: 'Samsung Parts Dist.',
    fromLocation: 'Vendor/Samsung HQ',
    toLocation: 'WH/Stock2',
    productName: 'OLED Display Modules 6.7"',
    productId: 'prod-oled-001',
    quantity: 200,
    status: 'DONE',
    moveType: 'IN',
    createdAt: '2026-09-26T14:05:00.000Z'
  },
  {
    id: 'led-002',
    reference: 'WH/OUT/0001',
    date: '2026-09-25T10:00:00.000Z',
    contact: 'Tesla Gigafactory',
    fromLocation: 'WH/Stock1',
    toLocation: 'Customer/Tesla Dock',
    productName: 'Ergonomic Executive Chair',
    productId: 'prod-chair-01',
    quantity: 10,
    status: 'DONE',
    moveType: 'OUT',
    createdAt: '2026-09-25T10:10:00.000Z'
  },
  {
    id: 'led-003',
    reference: 'WH/OUT/0001',
    date: '2026-09-25T10:00:00.000Z',
    contact: 'Tesla Gigafactory',
    fromLocation: 'WH/Stock2',
    toLocation: 'Customer/Tesla Dock',
    productName: 'Industrial Optical Sensor',
    productId: 'prod-sensor-01',
    quantity: 5,
    status: 'DONE',
    moveType: 'OUT',
    createdAt: '2026-09-25T10:10:00.000Z'
  },
  {
    id: 'led-004',
    reference: 'WH/INT/0001',
    date: '2026-09-24T08:30:00.000Z',
    contact: 'Internal Transfer',
    fromLocation: 'WH/Stock1',
    toLocation: 'WH/Stock2',
    productName: 'Heavy-Duty Wooden Pallets',
    productId: 'prod-pallet-01',
    quantity: 20,
    status: 'DONE',
    moveType: 'INT',
    createdAt: '2026-09-24T08:35:00.000Z'
  },
  {
    id: 'led-005',
    reference: 'WH/IN/0001',
    date: '2026-09-23T09:00:00.000Z',
    contact: 'SteelCorp International',
    fromLocation: 'Vendor/SteelCorp Dock',
    toLocation: 'WH/Stock1',
    productName: 'Steel Rods (12mm TMT)',
    productId: 'prod-steel-001',
    quantity: 50,
    status: 'READY',
    moveType: 'IN',
    createdAt: '2026-09-23T09:05:00.000Z'
  },
  {
    id: 'led-006',
    reference: 'WH/IN/0001',
    date: '2026-09-23T09:00:00.000Z',
    contact: 'SteelCorp International',
    fromLocation: 'Vendor/SteelCorp Dock',
    toLocation: 'WH/Stock1',
    productName: 'Aluminum Sheet 2mm (4x8ft)',
    productId: 'prod-alum-001',
    quantity: 25,
    status: 'READY',
    moveType: 'IN',
    createdAt: '2026-09-23T09:05:00.000Z'
  },
  {
    id: 'led-007',
    reference: 'WH/OUT/0002',
    date: '2026-09-22T15:30:00.000Z',
    contact: 'Google Cloud HQ',
    fromLocation: 'WH/Stock2',
    toLocation: 'Customer/Google Depot',
    productName: 'High-Torque Electric Motor 1HP',
    productId: 'prod-motor-001',
    quantity: 3,
    status: 'DONE',
    moveType: 'OUT',
    createdAt: '2026-09-22T15:35:00.000Z'
  },
  {
    id: 'led-008',
    reference: 'WH/ADJ/0001',
    date: '2026-09-21T11:00:00.000Z',
    contact: 'Cycle Count Audit',
    fromLocation: 'WH/Stock1',
    toLocation: 'WH/Scrap',
    productName: 'Ergonomic Mesh Chair',
    productId: 'prod-chair-02',
    quantity: 2,
    status: 'DONE',
    moveType: 'OUT',
    createdAt: '2026-09-21T11:05:00.000Z'
  },
  {
    id: 'led-009',
    reference: 'WH/IN/0002',
    date: '2026-09-20T10:00:00.000Z',
    contact: 'Apple Logistics Inc.',
    fromLocation: 'Vendor/Apple Depot',
    toLocation: 'WH/Stock1',
    productName: 'M3 Max Ultra SoC Modules',
    productId: 'prod-m3-001',
    quantity: 100,
    status: 'DRAFT',
    moveType: 'IN',
    createdAt: '2026-09-20T10:05:00.000Z'
  },
  {
    id: 'led-010',
    reference: 'WH/INT/0002',
    date: '2026-09-19T13:00:00.000Z',
    contact: 'Internal Transfer',
    fromLocation: 'WH/Stock2',
    toLocation: 'Production Floor',
    productName: 'Steel Rods (12mm TMT)',
    productId: 'prod-steel-001',
    quantity: 15,
    status: 'DONE',
    moveType: 'INT',
    createdAt: '2026-09-19T13:05:00.000Z'
  }
];

const STATUS_ORDER = ['DRAFT', 'WAITING', 'READY', 'DONE'];

const moveTypeConfig = {
  IN: { color: '#15803d', bg: '#ecfdf5', border: '#a7f3d0', label: 'INBOUND', Icon: TrendingUp },
  OUT: { color: '#b91c1c', bg: '#fef2f2', border: '#fecaca', label: 'OUTBOUND', Icon: TrendingDown },
  INT: { color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', label: 'INTERNAL', Icon: ArrowLeftRight }
};

const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
  DRAFT: { color: '#475569', bg: '#f1f5f9', border: '#e2e8f0' },
  WAITING: { color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  READY: { color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  DONE: { color: '#15803d', bg: '#ecfdf5', border: '#a7f3d0' }
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function StatusPill({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig['DONE'];
  return (
    <span style={{
      fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.55rem',
      borderRadius: '6px', letterSpacing: '0.04em', textTransform: 'uppercase',
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
      whiteSpace: 'nowrap'
    }}>
      {status}
    </span>
  );
}

function MoveTypeBadge({ moveType }: { moveType: 'IN' | 'OUT' | 'INT' }) {
  const cfg = moveTypeConfig[moveType];
  const IconComponent = cfg.Icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      fontSize: '0.7rem', fontWeight: 700, padding: '0.22rem 0.6rem',
      borderRadius: '6px', letterSpacing: '0.04em',
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
      whiteSpace: 'nowrap'
    }}>
      <IconComponent size={11} />
      {cfg.label}
    </span>
  );
}

// ─── KANBAN CARD ─────────────────────────────────────────────────────────────

function KanbanCard({ entry }: { entry: LedgerEntry }) {
  const cfg = moveTypeConfig[entry.moveType];
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid var(--border-subtle)`,
      borderLeft: `3px solid ${cfg.color}`,
      borderRadius: '10px',
      padding: '0.85rem 1rem',
      marginBottom: '0.6rem',
      transition: 'all 0.2s ease',
      cursor: 'default',
      boxShadow: 'var(--shadow-sm)'
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)';
        (e.currentTarget as HTMLDivElement).style.borderColor = cfg.border;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = '';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-subtle)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.45rem' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
          {entry.reference}
        </span>
        <MoveTypeBadge moveType={entry.moveType} />
      </div>
      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.35rem', lineHeight: 1.3 }}>
        {entry.productName}
      </div>
      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
        {entry.contact}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
        <span style={{ color: cfg.color, fontWeight: 700, fontSize: '0.82rem' }}>{entry.quantity}</span>
        <span>units</span>
        <span style={{ margin: '0 0.2rem', color: 'var(--border-hover)' }}>·</span>
        <span>{entry.fromLocation}</span>
        <span style={{ color: 'var(--text-dim)' }}>→</span>
        <span>{entry.toLocation}</span>
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <Clock size={10} />
        {formatDate(entry.date)}
      </div>
    </div>
  );
}

// ─── KANBAN COLUMN ────────────────────────────────────────────────────────────

function KanbanColumn({ status, entries }: { status: string; entries: LedgerEntry[] }) {
  const cfg = statusConfig[status] || statusConfig['DONE'];
  const icons: Record<string, React.ReactNode> = {
    DRAFT: <PackageCheck size={14} />,
    WAITING: <Clock size={14} />,
    READY: <Activity size={14} />,
    DONE: <PackageX size={14} />
  };
  return (
    <div style={{
      flex: 1, minWidth: '220px', maxWidth: '290px',
      background: '#f8fafc',
      border: '1px solid var(--border-subtle)',
      borderRadius: '10px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Column header */}
      <div style={{
        padding: '0.85rem 1rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: cfg.color }}>{icons[status]}</span>
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: cfg.color }}>{status}</span>
        </div>
        <span style={{
          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
          padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700
        }}>
          {entries.length}
        </span>
      </div>

      {/* Cards */}
      <div style={{ padding: '0.75rem', overflowY: 'auto', flex: 1, maxHeight: '500px' }}>
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.78rem', padding: '1.5rem 0' }}>
            No moves
          </div>
        ) : (
          entries.map(entry => <KanbanCard key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function MoveHistoryView() {
  const [entries, setEntries] = useState<LedgerEntry[]>(DEMO_LEDGER);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [search, setSearch] = useState('');
  const [filterMoveType, setFilterMoveType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [kpis, setKpis] = useState({
    total: 10, inbound: 4, outbound: 4, internal: 2, totalQtyMoved: 430
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.ledger.getEntries({
        search: search || undefined,
        moveType: filterMoveType || undefined,
        status: filterStatus || undefined
      }) as any;
      if (res?.success && res?.data) setEntries(res.data);
    } catch {
      // Keep demo data
    }
    try {
      const kpiRes = await api.ledger.getKPIs() as any;
      if (kpiRes?.success && kpiRes?.data) setKpis(kpiRes.data);
    } catch { }
    setIsLoading(false);
  }, [search, filterMoveType, filterStatus]);

  useEffect(() => { load(); }, [load]);

  // Client-side filter for demo fallback
  const filtered = entries.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.reference.toLowerCase().includes(q) ||
      e.contact.toLowerCase().includes(q) || e.productName.toLowerCase().includes(q) ||
      e.fromLocation.toLowerCase().includes(q) || e.toLocation.toLowerCase().includes(q);
    const matchType = !filterMoveType || e.moveType === filterMoveType;
    const matchStatus = !filterStatus || e.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  // Kanban grouped
  const kanbanGroups = STATUS_ORDER.map(s => ({
    status: s,
    entries: filtered.filter(e => e.status === s)
  }));

  const hasFilter = Boolean(search || filterMoveType || filterStatus);
  const kpiCards = [
    { label: 'Total Moves', value: hasFilter ? filtered.length : kpis.total, icon: ArrowRightLeft, color: '#0f172a', bg: '#f1f5f9' },
    { label: 'Inbound (IN)', value: hasFilter ? filtered.filter(e => e.moveType === 'IN').length : kpis.inbound, icon: TrendingUp, color: '#15803d', bg: '#ecfdf5' },
    { label: 'Outbound (OUT)', value: hasFilter ? filtered.filter(e => e.moveType === 'OUT').length : kpis.outbound, icon: TrendingDown, color: '#b91c1c', bg: '#fef2f2' },
    { label: 'Internal (INT)', value: hasFilter ? filtered.filter(e => e.moveType === 'INT').length : kpis.internal, icon: Layers, color: '#0284c7', bg: '#f0f9ff' }
  ];

  return (
    <div style={{ padding: '1.5rem 2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '8px',
              background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0'
            }}>
              <ArrowRightLeft size={18} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                Stock Ledger — Move History
              </h1>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                Immutable double-entry audit trail of all inventory movements
              </p>
            </div>
          </div>
        </div>
        <button
          id="ledger-refresh-btn"
          onClick={load}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.55rem 1rem', borderRadius: '8px',
            background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-main)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle)';
          }}
        >
          <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.9rem' }}>
        {kpiCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: '12px', padding: '1rem 1.2rem',
            display: 'flex', alignItems: 'center', gap: '0.85rem',
            transition: 'all 0.2s ease'
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = '';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '9px', background: bg, color, flexShrink: 0 }}>
              <Icon size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
        borderRadius: '12px', padding: '0.85rem 1rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            id="ledger-search"
            type="text"
            placeholder="Search reference, product, contact, location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.2rem',
              background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
              borderRadius: '8px', color: 'var(--text-main)', fontSize: '0.85rem',
              fontFamily: 'inherit', outline: 'none', transition: 'all 0.2s'
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--border-focus)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
          />
        </div>

        {/* Move Type Filter */}
        <div style={{ position: 'relative' }}>
          <Filter size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <ChevronDown size={12} style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
          <select
            id="ledger-type-filter"
            value={filterMoveType}
            onChange={e => setFilterMoveType(e.target.value)}
            style={{
              padding: '0.5rem 2rem 0.5rem 1.8rem', appearance: 'none',
              background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
              borderRadius: '8px', color: filterMoveType ? 'var(--text-main)' : 'var(--text-muted)',
              fontSize: '0.82rem', fontFamily: 'inherit', cursor: 'pointer', outline: 'none'
            }}
          >
            <option value="">All Types</option>
            <option value="IN">Inbound (IN)</option>
            <option value="OUT">Outbound (OUT)</option>
            <option value="INT">Internal (INT)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ position: 'relative' }}>
          <Activity size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <ChevronDown size={12} style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
          <select
            id="ledger-status-filter"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              padding: '0.5rem 2rem 0.5rem 1.8rem', appearance: 'none',
              background: 'var(--bg-input)', border: '1px solid var(--border-subtle)',
              borderRadius: '8px', color: filterStatus ? 'var(--text-main)' : 'var(--text-muted)',
              fontSize: '0.82rem', fontFamily: 'inherit', cursor: 'pointer', outline: 'none'
            }}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="WAITING">Waiting</option>
            <option value="READY">Ready</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(search || filterMoveType || filterStatus) && (
          <button
            id="ledger-clear-filters"
            onClick={() => { setSearch(''); setFilterMoveType(''); setFilterStatus(''); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.5rem 0.75rem', borderRadius: '8px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
            }}
          >
            <X size={13} /> Clear
          </button>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border-subtle)' }}>
          {/* View Toggle */}
          {(['list', 'kanban'] as const).map(mode => (
            <button
              key={mode}
              id={`ledger-${mode}-view`}
              onClick={() => setViewMode(mode)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                background: viewMode === mode ? 'var(--primary)' : 'transparent',
                color: viewMode === mode ? '#fff' : 'var(--text-muted)'
              }}
            >
              {mode === 'list' ? <LayoutList size={14} /> : <Kanban size={14} />}
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content Area ── */}
      {viewMode === 'list' ? (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: '12px', overflow: 'hidden'
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 1.4fr 1.5fr 1.5fr 1.3fr 0.7fr 0.95fr 0.85fr',
            padding: '0.75rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: '#f8fafc'
          }}>
            {['Date & Time', 'Reference', 'Contact', 'From', 'To', 'Qty', 'Type', 'Status'].map(h => (
              <div key={h} style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <ArrowRightLeft size={36} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p style={{ fontSize: '0.9rem' }}>No ledger entries match your filters</p>
            </div>
          ) : (
            filtered.map((entry, idx) => {
              const cfg = moveTypeConfig[entry.moveType];
              return (
                <div
                  key={entry.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.6fr 1.4fr 1.5fr 1.5fr 1.3fr 0.7fr 0.95fr 0.85fr',
                    padding: '0.7rem 1.25rem', alignItems: 'center',
                    borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    transition: 'all 0.15s ease',
                    borderLeft: `3px solid ${cfg.color}`
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#f8fafc'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = ''}
                >
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {formatDate(entry.date)}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.82rem',
                    fontWeight: 700, color: '#0f172a'
                  }}>
                    {entry.reference}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    {entry.contact}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {entry.fromLocation}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {entry.toLocation}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: cfg.color }}>
                    {entry.quantity}
                  </div>
                  <MoveTypeBadge moveType={entry.moveType} />
                  <StatusPill status={entry.status} />
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ── Kanban View ── */
        <div style={{ display: 'flex', gap: '0.85rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {kanbanGroups.map(({ status, entries: cols }) => (
            <KanbanColumn key={status} status={status} entries={cols} />
          ))}
        </div>
      )}

      {/* Footer count */}
      <div style={{ textAlign: 'right', fontSize: '0.775rem', color: 'var(--text-dim)' }}>
        Showing {filtered.length} of {entries.length} ledger entries
      </div>
    </div>
  );
}
