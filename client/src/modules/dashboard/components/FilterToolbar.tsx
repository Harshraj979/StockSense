import { Search, Filter, RotateCcw } from 'lucide-react';

export interface FilterState {
  type: string;
  status: string;
  warehouse: string;
  category: string;
  search: string;
}

interface FilterToolbarProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onResetFilters: () => void;
  activeCount: number;
}

export default function FilterToolbar({
  filters,
  onFilterChange,
  onResetFilters,
  activeCount
}: FilterToolbarProps) {
  const docTypes = [
    { code: 'ALL', label: 'All Docs' },
    { code: 'IN', label: 'Receipt (IN)' },
    { code: 'OUT', label: 'Delivery (OUT)' },
    { code: 'INT', label: 'Internal (INT)' },
    { code: 'ADJ', label: 'Adjustment (ADJ)' }
  ];

  return (
    <div className="filters-toolbar">
      <div className="filter-row">
        {/* Real-time Search Box */}
        <div className="search-input-box">
          <Search size={16} className="search-icon-pos" />
          <input
            type="text"
            placeholder="Search by reference, partner, product, or responsible name..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </div>

        {/* Warehouse Dropdown Filter */}
        <select
          className="filter-select"
          value={filters.warehouse}
          onChange={(e) => onFilterChange('warehouse', e.target.value)}
        >
          <option value="ALL">All Warehouses & Locations</option>
          <option value="Main Warehouse (WH)">Main Warehouse (WH)</option>
          <option value="WH/Stock1">WH / Stock Location 1</option>
          <option value="WH/Stock2">WH / Stock Location 2</option>
        </select>

        {/* Category Dropdown Filter */}
        <select
          className="filter-select"
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
        >
          <option value="ALL">All Product Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Raw Materials">Raw Materials</option>
          <option value="Finished Goods">Finished Goods</option>
          <option value="Accessories">Accessories</option>
          <option value="Packaging">Packaging</option>
        </select>

        {/* Status Dropdown Filter */}
        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="WAITING">Waiting (Insufficient Stock)</option>
          <option value="READY">Ready</option>
          <option value="DONE">Done</option>
          <option value="CANCELED">Canceled</option>
          <option value="LATE">Overdue (Late)</option>
        </select>

        {/* Reset button */}
        {(filters.type !== 'ALL' || filters.status !== 'ALL' || filters.warehouse !== 'ALL' || filters.category !== 'ALL' || filters.search !== '') && (
          <button
            onClick={onResetFilters}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.65rem 0.9rem', borderRadius: '10px',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)', fontSize: '0.825rem', cursor: 'pointer'
            }}
            title="Reset all filters"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        )}
      </div>

      {/* Quick Doc Type Filter Pills (IN, OUT, INT, ADJ) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="filter-pills-group">
          <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-dim)', marginRight: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Filter size={13} />
            Document Type:
          </span>
          {docTypes.map((dt) => (
            <button
              key={dt.code}
              className={`doc-type-pill ${filters.type === dt.code ? 'active' : ''}`}
              onClick={() => onFilterChange('type', dt.code)}
            >
              {dt.label}
            </button>
          ))}
        </div>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          Showing <strong style={{ color: 'var(--text-main)' }}>{activeCount}</strong> operations
        </span>
      </div>
    </div>
  );
}
