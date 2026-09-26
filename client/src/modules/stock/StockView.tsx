import { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  QrCode,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  Boxes,
  MapPin,
  Check,
  X
} from 'lucide-react';
import { api, ProductItem } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { StockAllocationShield } from './StockAllocationShield';
import { SkuQrGeneratorModal } from './SkuQrGeneratorModal';
import { ProductMasterModal } from './ProductMasterModal';
import { DirectInlineEditModal } from './DirectInlineEditModal';

export default function StockView() {
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modals state
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [qrModalProduct, setQrModalProduct] = useState<ProductItem | null>(null);
  const [inlineModalProduct, setInlineModalProduct] = useState<ProductItem | null>(null);

  // Direct table row inline editing state
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [inlineRowValue, setInlineRowValue] = useState<number>(0);
  const [inlineSaving, setInlineSaving] = useState(false);

  // Notification banner state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await api.products.getAll();
      if (res.success && res.data) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        selectedCategory === 'All' || p.category === selectedCategory;
      const matchesLowStock = !showLowStockOnly || p.isLowStock;
      return matchesSearch && matchesCat && matchesLowStock;
    });
  }, [products, searchQuery, selectedCategory, showLowStockOnly]);

  // Aggregate KPI metrics
  const totalValuation = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.totalValuation || p.onHand * p.unitCost), 0);
  }, [products]);

  const totalOnHand = useMemo(() => {
    return products.reduce((acc, p) => acc + p.onHand, 0);
  }, [products]);

  const totalReserved = useMemo(() => {
    return products.reduce((acc, p) => acc + p.reserved, 0);
  }, [products]);

  const totalFreeToUse = useMemo(() => {
    return products.reduce((acc, p) => acc + p.freeToUse, 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.isLowStock).length;
  }, [products]);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Handlers
  const handleProductSaved = (saved: ProductItem) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      if (exists) {
        return prev.map((p) => (p.id === saved.id ? saved : p));
      }
      return [saved, ...prev];
    });
    showToast(`Product "${saved.name}" committed to Master Catalog`);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the inventory catalog?`)) {
      return;
    }
    try {
      const res = await api.products.delete(id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast(`Product "${name}" deleted successfully.`);
      }
    } catch (err: any) {
      alert(err?.message || 'Error deleting product');
    }
  };

  const handleStockUpdate = async (productId: string, newOnHand: number, reason: string) => {
    const res = await api.products.updateStock(productId, { onHand: newOnHand, reason });
    if (res.success && res.data) {
      setProducts((prev) => prev.map((p) => (p.id === productId ? res.data! : p)));
      showToast(`Stock updated: ${newOnHand} on hand (${res.data.freeToUse} free to use)`);
    }
  };

  const startRowInlineEdit = (p: ProductItem) => {
    setEditingRowId(p.id);
    setInlineRowValue(p.onHand);
  };

  const saveRowInlineEdit = async (productId: string) => {
    if (inlineRowValue < 0) return;
    setInlineSaving(true);
    try {
      await handleStockUpdate(productId, inlineRowValue, 'Direct Table Quick Adjustment');
      setEditingRowId(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to update stock');
    } finally {
      setInlineSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.75rem 2rem' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--success)',
            borderRadius: '10px',
            padding: '0.85rem 1.25rem',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 2000,
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <CheckCircle2 size={18} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8'
              }}
            >
              <Package size={18} />
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Master Catalog & Stock Engine
            </h1>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}
            >
              Module 3
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Live Multi-Location Inventory • Stock Allocation Shield • Instant QR Code Matrix
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={loadProducts}
            className="btn btn-secondary"
            title="Refresh Stock Balances"
            style={{ padding: '0.65rem' }}
          >
            <RefreshCw size={16} />
          </button>

          {isManager ? (
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsMasterModalOpen(true);
              }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem' }}
            >
              <Plus size={18} />
              + New Product
            </button>
          ) : (
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-tertiary)',
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              Staff View (Manager required to add/delete products)
            </div>
          )}
        </div>
      </div>

      {/* 4 Interactive Operational KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}
      >
        {/* KPI 1: Catalog Size */}
        <div className="card-kpi">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Catalog Items
            </span>
            <div style={{ color: '#818cf8' }}><Boxes size={18} /></div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.4rem 0', color: 'var(--text-main)' }}>
            {products.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{totalOnHand} physical units on hand</span>
          </div>
        </div>

        {/* KPI 2: Inventory Valuation */}
        <div className="card-kpi">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Total Stock Valuation
            </span>
            <div style={{ color: '#10b981' }}><DollarSign size={18} /></div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.4rem 0', color: 'var(--success)' }}>
            ₹{totalValuation.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Physical asset value on hand
          </div>
        </div>

        {/* KPI 3: Allocation Shield (Free vs Reserved) */}
        <div className="card-kpi">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Free to Dispatch
            </span>
            <div style={{ color: '#38bdf8' }}><ShieldCheck size={18} /></div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.4rem 0', color: '#38bdf8' }}>
            {totalFreeToUse} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>units</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#a78bfa' }}>
            {totalReserved} units reserved for pending orders
          </div>
        </div>

        {/* KPI 4: Low Stock Alert */}
        <div
          className="card-kpi"
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          style={{
            cursor: 'pointer',
            border: showLowStockOnly ? '1px solid var(--warning)' : undefined,
            background: showLowStockOnly ? 'var(--warning-bg)' : undefined
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Reorder Alerts
            </span>
            <div style={{ color: 'var(--warning)' }}><AlertTriangle size={18} /></div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.4rem 0', color: lowStockCount > 0 ? 'var(--warning)' : 'var(--text-main)' }}>
            {lowStockCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: showLowStockOnly ? 'var(--warning)' : 'var(--text-dim)' }}>
            {showLowStockOnly ? '✓ Filtering Low Stock (Click to Reset)' : 'Click to filter low stock items'}
          </div>
        </div>
      </div>

      {/* Search & Dynamic Filter Controls */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1', minWidth: '260px', maxWidth: '420px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)'
            }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>

        {/* Category Pills Filter */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginRight: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={13} /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '999px',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--primary)' : 'var(--border-subtle)',
                background: selectedCategory === cat ? 'var(--primary-light)' : 'rgba(255,255,255,0.02)',
                color: selectedCategory === cat ? '#a5b4fc' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: selectedCategory === cat ? 700 : 500,
                transition: 'var(--transition)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stock View Table */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  background: 'rgba(15, 23, 42, 0.75)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-dim)'
                }}
              >
                <th style={{ padding: '1rem 1.25rem' }}>Product Master</th>
                <th style={{ padding: '1rem' }}>SKU / Bin Code</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Per Unit Cost</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>On Hand (Physical)</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Reserved (Orders)</th>
                <th style={{ padding: '1rem' }}>Free to Use (Shield)</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Reorder Rules</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        border: '3px solid var(--border-subtle)',
                        borderTop: '3px solid var(--primary)',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        margin: '0 auto 0.75rem'
                      }}
                    />
                    Loading stock records...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                      <Package size={36} />
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                      No stock items found
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Try adjusting your search query or category filters.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isEditingRow = editingRowId === p.id;
                  const isLow = p.onHand <= p.reorderMin;

                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.15s ease',
                        background: isLow ? 'rgba(245, 158, 11, 0.03)' : 'transparent'
                      }}
                      className="stock-table-row"
                    >
                      {/* 1. Product Name & Category */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.925rem' }}>
                          {p.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              background: 'var(--bg-tertiary)',
                              color: 'var(--text-muted)'
                            }}
                          >
                            {p.category}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>•</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                            UoM: <strong>{p.uom}</strong>
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>•</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <MapPin size={10} /> {p.locationCode || 'WH/Stock1'}
                          </span>
                        </div>
                      </td>

                      {/* 2. SKU / Code */}
                      <td style={{ padding: '1rem' }}>
                        <button
                          onClick={() => setQrModalProduct(p)}
                          title="Generate Printable Bin Tag & QR Code"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: 'rgba(99, 102, 241, 0.08)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            borderRadius: '6px',
                            padding: '0.25rem 0.55rem',
                            color: '#818cf8',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <QrCode size={13} />
                          {p.sku}
                        </button>
                      </td>

                      {/* 3. Per Unit Cost */}
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>
                          ₹{p.unitCost.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.675rem', color: 'var(--text-dim)' }}>
                          Total: ₹{(p.onHand * p.unitCost).toLocaleString('en-IN')}
                        </div>
                      </td>

                      {/* 4. On Hand (Physical) with Direct Inline Quick Update */}
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {isEditingRow ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <input
                              type="number"
                              min="0"
                              value={inlineRowValue}
                              onChange={(e) => setInlineRowValue(Number(e.target.value))}
                              style={{
                                width: '70px',
                                padding: '0.25rem 0.4rem',
                                borderRadius: '6px',
                                background: 'var(--bg-input)',
                                border: '1px solid var(--primary)',
                                color: 'var(--text-main)',
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                textAlign: 'center'
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => saveRowInlineEdit(p.id)}
                              disabled={inlineSaving}
                              title="Commit update"
                              style={{
                                background: 'var(--success)',
                                border: 'none',
                                borderRadius: '4px',
                                color: '#fff',
                                padding: '0.25rem',
                                cursor: 'pointer'
                              }}
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingRowId(null)}
                              title="Cancel"
                              style={{
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '4px',
                                color: 'var(--text-muted)',
                                padding: '0.25rem',
                                cursor: 'pointer'
                              }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => startRowInlineEdit(p)}
                            title="Click to inline update stock count"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              cursor: 'pointer',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '6px',
                              background: isLow ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                              border: isLow ? '1px solid rgba(245, 158, 11, 0.3)' : '1px dashed rgba(255, 255, 255, 0.15)'
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.95rem',
                                fontWeight: 800,
                                color: isLow ? 'var(--warning)' : 'var(--text-main)',
                                fontFamily: 'var(--font-mono)'
                              }}
                            >
                              {p.onHand}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{p.uom}</span>
                            <Edit2 size={11} color="var(--text-dim)" />
                          </div>
                        )}
                      </td>

                      {/* 5. Reserved Quantities (Deliveries) */}
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            color: p.reserved > 0 ? '#a78bfa' : 'var(--text-dim)',
                            background: p.reserved > 0 ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                            padding: p.reserved > 0 ? '0.2rem 0.5rem' : '0',
                            borderRadius: '4px'
                          }}
                        >
                          {p.reserved > 0 ? `-${p.reserved}` : '0'} {p.uom}
                        </span>
                      </td>

                      {/* 6. Free to Use with Stock Allocation Shield */}
                      <td style={{ padding: '1rem' }}>
                        <StockAllocationShield product={p} compact />
                      </td>

                      {/* 7. Reorder Rules (Min / Max) */}
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          Min: <strong style={{ color: isLow ? 'var(--warning)' : 'var(--text-main)' }}>{p.reorderMin}</strong> / Max: <strong>{p.reorderMax}</strong>
                        </div>
                        {isLow && (
                          <div
                            style={{
                              fontSize: '0.675rem',
                              fontWeight: 700,
                              color: 'var(--warning)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              marginTop: '2px'
                            }}
                          >
                            <AlertTriangle size={10} /> REORDER REQUIRED
                          </div>
                        )}
                      </td>

                      {/* 8. Actions */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          {/* Quick Adjust Modal */}
                          <button
                            onClick={() => setInlineModalProduct(p)}
                            title="Audit Stock Adjustment Modal"
                            style={{
                              background: 'var(--bg-tertiary)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: '6px',
                              padding: '0.35rem',
                              color: '#818cf8',
                              cursor: 'pointer'
                            }}
                          >
                            <RefreshCw size={14} />
                          </button>

                          {/* QR Code Tag Generator */}
                          <button
                            onClick={() => setQrModalProduct(p)}
                            title="Generate QR / Barcode Tag"
                            style={{
                              background: 'var(--bg-tertiary)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: '6px',
                              padding: '0.35rem',
                              color: 'var(--text-muted)',
                              cursor: 'pointer'
                            }}
                          >
                            <QrCode size={14} />
                          </button>

                          {/* Edit Master (Manager only) */}
                          {isManager && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsMasterModalOpen(true);
                                }}
                                title="Edit Product Master Data"
                                style={{
                                  background: 'var(--bg-tertiary)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: '6px',
                                  padding: '0.35rem',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer'
                                }}
                              >
                                <Edit2 size={14} />
                              </button>

                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                title="Delete Product"
                                style={{
                                  background: 'var(--bg-tertiary)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: '6px',
                                  padding: '0.35rem',
                                  color: 'var(--danger)',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Embedded Modals */}
      <ProductMasterModal
        isOpen={isMasterModalOpen}
        onClose={() => {
          setIsMasterModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={handleProductSaved}
        editingProduct={editingProduct}
      />

      <SkuQrGeneratorModal
        product={qrModalProduct}
        onClose={() => setQrModalProduct(null)}
      />

      <DirectInlineEditModal
        product={inlineModalProduct}
        onClose={() => setInlineModalProduct(null)}
        onSave={handleStockUpdate}
      />
    </div>
  );
}
