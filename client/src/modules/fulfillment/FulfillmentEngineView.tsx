import { useState, useEffect } from 'react';
import {
  Truck,
  RefreshCw,
  Sliders,
  Search,
  Plus,
  ArrowRight,
  X,
  Compass
} from 'lucide-react';
import { api } from '../../api/client';

export interface FulfillmentLine {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  demandQty: number;
  onHandQty: number;
  rackLocation: string;
  uom: string;
}

export interface DeliveryOrder {
  id: string;
  reference: string;
  partnerContact: string;
  deliveryAddress: string;
  scheduleDate: string;
  responsibleName: string;
  status: 'DRAFT' | 'WAITING' | 'READY' | 'DONE';
  sourceLocation: string;
  destLocation: string;
  lines: FulfillmentLine[];
  createdAt: string;
  updatedAt: string;
}

export interface InternalTransfer {
  id: string;
  reference: string;
  sourceLocation: string;
  destLocation: string;
  scheduleDate: string;
  responsibleName: string;
  status: 'DRAFT' | 'READY' | 'DONE';
  lines: FulfillmentLine[];
  createdAt: string;
  updatedAt: string;
}

export interface StockAdjustment {
  id: string;
  reference: string;
  location: string;
  productId: string;
  productName: string;
  sku: string;
  recordedQty: number;
  countedQty: number;
  variance: number;
  reasonTag: 'Damaged' | 'Theft' | 'Expired' | 'Misplaced' | 'Data Correction';
  responsibleName: string;
  createdAt: string;
}

export interface PickingRoute {
  deliveryRef: string;
  customer: string;
  totalItems: number;
  totalStopPoints: number;
  estimatedWalkingMins: number;
  route: Array<{
    stepNumber: number;
    rackLocation: string;
    zone: string;
    itemsToPick: Array<{
      productName: string;
      sku: string;
      quantityToPick: number;
      uom: string;
    }>;
  }>;
}

interface FulfillmentEngineViewProps {
  initialSubTab?: 'deliveries' | 'transfers' | 'adjustments';
}

export default function FulfillmentEngineView({ initialSubTab = 'deliveries' }: FulfillmentEngineViewProps) {
  const [subTab, setSubTab] = useState<'deliveries' | 'transfers' | 'adjustments'>(initialSubTab);

  // Deliveries state
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);
  const [pickingRouteModal, setPickingRouteModal] = useState<boolean>(false);
  const [pickingRouteData, setPickingRouteData] = useState<PickingRoute | null>(null);

  // Transfers state
  const [transfers, setTransfers] = useState<InternalTransfer[]>([]);

  // Adjustments state
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);

  // Modals and inputs
  const [createDeliveryOpen, setCreateDeliveryOpen] = useState(false);
  const [createTransferOpen, setCreateTransferOpen] = useState(false);
  const [createAdjustmentOpen, setCreateAdjustmentOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // New Delivery Form
  const [delvCustomer, setDelvCustomer] = useState('');
  const [delvAddress, setDelvAddress] = useState('');
  const [delvDate, setDelvDate] = useState(new Date().toISOString().split('T')[0]);
  const [delvLines] = useState([
    { productName: 'Ergonomic Executive Chair', sku: 'SKU-FURN-2021', demandQty: 10, rackLocation: 'Rack A-02', uom: 'Units' }
  ]);

  // New Transfer Form
  const [transSource, setTransSource] = useState('Main Warehouse (WH/Stock1)');
  const [transDest, setTransDest] = useState('Production Floor (WH/Prod)');
  const [transDate, setTransDate] = useState(new Date().toISOString().split('T')[0]);
  const [transLines] = useState([
    { productName: 'Steel Rods 12mm', sku: 'SKU-RAW-1001', demandQty: 20, uom: 'Units' }
  ]);

  // New Adjustment Form
  const [adjLoc, setAdjLoc] = useState('WH/Stock1');
  const [adjProd, setAdjProd] = useState('Ergonomic Executive Chair');
  const [adjSku] = useState('SKU-FURN-2021');
  const [adjRecorded, setAdjRecorded] = useState<number>(50);
  const [adjCounted, setAdjCounted] = useState<number>(47);
  const [adjReason, setAdjReason] = useState<'Damaged' | 'Theft' | 'Expired' | 'Misplaced' | 'Data Correction'>('Damaged');

  useEffect(() => {
    fetchData();
  }, [subTab, searchTerm]);

  const fetchData = async () => {
    try {
      if (subTab === 'deliveries') {
        const res = await api.fulfillment.getDeliveries({ search: searchTerm || undefined });
        if (res.success && res.data) {
          setDeliveries(res.data as DeliveryOrder[]);
        }
      } else if (subTab === 'transfers') {
        const res = await api.fulfillment.getInternalTransfers();
        if (res.success && res.data) {
          setTransfers(res.data as InternalTransfer[]);
        }
      } else if (subTab === 'adjustments') {
        const res = await api.fulfillment.getAdjustments();
        if (res.success && res.data) {
          setAdjustments(res.data as StockAdjustment[]);
        }
      }
    } catch (err) {
      console.error('Failed fetching fulfillment data:', err);
    }
  };

  const handleDeliveryStatusUpdate = async (id: string, status: 'DRAFT' | 'WAITING' | 'READY' | 'DONE') => {
    try {
      const res = await api.fulfillment.updateDeliveryStatus(id, status);
      if (res.success && res.data) {
        if (res.message && res.message.includes('insufficient')) {
          alert(res.message);
        }
        setSelectedDelivery(res.data as DeliveryOrder);
        fetchData();
      }
    } catch (err) {
      console.error('Failed delivery status update:', err);
    }
  };

  const handleOpenSmartPicking = async (deliveryId: string) => {
    try {
      const res = await api.fulfillment.getPickingRoute(deliveryId);
      if (res.success && res.data) {
        setPickingRouteData(res.data as PickingRoute);
        setPickingRouteModal(true);
      }
    } catch (err) {
      console.error('Failed to get smart picking route:', err);
    }
  };

  const handleCreateDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.fulfillment.createDelivery({
        partnerContact: delvCustomer,
        deliveryAddress: delvAddress,
        scheduleDate: delvDate,
        lines: delvLines
      });
      if (res.success && res.data) {
        setCreateDeliveryOpen(false);
        setDelvCustomer('');
        setDelvAddress('');
        fetchData();
        setSelectedDelivery(res.data as DeliveryOrder);
      }
    } catch (err) {
      console.error('Failed to create delivery:', err);
    }
  };

  const handleCreateTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.fulfillment.createInternalTransfer({
        sourceLocation: transSource,
        destLocation: transDest,
        scheduleDate: transDate,
        lines: transLines
      });
      if (res.success) {
        setCreateTransferOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to create transfer:', err);
    }
  };

  const handleCreateAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.fulfillment.createAdjustment({
        location: adjLoc,
        productName: adjProd,
        sku: adjSku,
        recordedQty: adjRecorded,
        countedQty: adjCounted,
        reasonTag: adjReason
      });
      if (res.success) {
        setCreateAdjustmentOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to create adjustment:', err);
    }
  };

  return (
    <div className="command-dashboard">
      {/* Top Banner */}
      <div className="glass-card page-header-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={18} color="#6366f1" />
            </div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Outbound Operations & Internal Stock Transfers
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Fulfillment engine for outgoing deliveries, inter-location moves, cycle count adjustments, and smart rack picking routes.
          </p>
        </div>

        {/* Sub-tab Navigation Switcher */}
        <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.6)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setSubTab('deliveries')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              background: subTab === 'deliveries' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
              color: subTab === 'deliveries' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Truck size={14} />
            Delivery Orders
          </button>

          <button
            onClick={() => setSubTab('transfers')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              background: subTab === 'transfers' ? 'linear-gradient(135deg, #06b6d4, #0284c7)' : 'transparent',
              color: subTab === 'transfers' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <RefreshCw size={14} />
            Internal Transfers
          </button>

          <button
            onClick={() => setSubTab('adjustments')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              background: subTab === 'adjustments' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
              color: subTab === 'adjustments' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Sliders size={14} />
            Stock Adjustments
          </button>
        </div>
      </div>

      {/* --- TAB 1: OUTBOUND DELIVERY ORDERS --- */}
      {subTab === 'deliveries' && (
        <>
          <div className="glass-card" style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="search-input"
                placeholder="Search WH/OUT/0001 or address..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.4rem', height: '36px', fontSize: '0.85rem', borderRadius: '6px' }}
              />
            </div>
            <button className="btn btn-primary" onClick={() => setCreateDeliveryOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={16} /> Create Delivery Order
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: selectedDelivery ? '1fr 420px' : '1fr', gap: '1.25rem' }}>
            {/* Deliveries Table */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="ops-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Delivery Address</th>
                    <th>Schedule Date</th>
                    <th>Responsible</th>
                    <th>Operation Type</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Smart Picking</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map(delv => (
                    <tr
                      key={delv.id}
                      onClick={() => setSelectedDelivery(delv)}
                      style={{
                        cursor: 'pointer',
                        background: selectedDelivery?.id === delv.id ? 'rgba(99, 102, 241, 0.08)' : 'transparent'
                      }}
                    >
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-light)' }}>
                        {delv.reference}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{delv.partnerContact}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{delv.deliveryAddress}</div>
                      </td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                        {new Date(delv.scheduleDate).toLocaleDateString()}
                      </td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--text-main)' }}>{delv.responsibleName}</td>
                      <td>
                        <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                          Outgoing Goods
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${delv.status === 'DONE' ? 'badge-done' : delv.status === 'READY' ? 'badge-ready' : delv.status === 'WAITING' ? 'badge-waiting' : 'badge-draft'}`}>
                          {delv.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                        <button
                          className="btn btn-outline"
                          onClick={() => handleOpenSmartPicking(delv.id)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Compass size={13} color="#06b6d4" /> Route
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Delivery Detail Panel */}
            {selectedDelivery && (
              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery Order</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.1rem 0 0', color: 'var(--primary-light)', fontFamily: 'var(--font-mono)' }}>
                      {selectedDelivery.reference}
                    </h2>
                  </div>
                  <button onClick={() => setSelectedDelivery(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>

                {/* State Machine Lifecycle Indicator */}
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Lifecycle State Machine:</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                    <span style={{ fontWeight: 700, color: selectedDelivery.status === 'DRAFT' ? '#f59e0b' : '#94a3b8' }}>Draft</span>
                    <ArrowRight size={12} color="var(--text-muted)" />
                    <span style={{ fontWeight: 700, color: selectedDelivery.status === 'WAITING' ? '#ef4444' : '#94a3b8' }}>Waiting</span>
                    <ArrowRight size={12} color="var(--text-muted)" />
                    <span style={{ fontWeight: 700, color: selectedDelivery.status === 'READY' ? '#38bdf8' : '#94a3b8' }}>Ready</span>
                    <ArrowRight size={12} color="var(--text-muted)" />
                    <span style={{ fontWeight: 700, color: selectedDelivery.status === 'DONE' ? '#10b981' : '#94a3b8' }}>Done</span>
                  </div>
                </div>

                {/* Exact Required Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.825rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Delivery Address</span>
                    <strong style={{ color: 'var(--text-main)' }}>{selectedDelivery.deliveryAddress}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Schedule Date</span>
                    <strong style={{ color: 'var(--text-main)' }}>{new Date(selectedDelivery.scheduleDate).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Responsible</span>
                    <span style={{ color: 'var(--text-main)' }}>{selectedDelivery.responsibleName}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Operation Type</span>
                    <span style={{ color: '#818cf8', fontWeight: 600 }}>Outgoing Goods</span>
                  </div>
                </div>

                {/* Products Table */}
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Pick & Pack Items</div>
                  <div style={{ borderRadius: '6px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                      <thead style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                        <tr>
                          <th style={{ padding: '0.4rem 0.5rem', textAlign: 'left' }}>Product</th>
                          <th style={{ padding: '0.4rem 0.5rem', textAlign: 'center' }}>Demand</th>
                          <th style={{ padding: '0.4rem 0.5rem', textAlign: 'center' }}>Rack Loc</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDelivery.lines.map(line => (
                          <tr key={line.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <td style={{ padding: '0.4rem 0.5rem' }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{line.productName}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{line.sku}</div>
                            </td>
                            <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center', fontWeight: 600 }}>{line.demandQty} {line.uom}</td>
                            <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center' }}>
                              <span style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                                {line.rackLocation}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Smart Picking Route Button */}
                <button
                  className="btn btn-outline"
                  onClick={() => handleOpenSmartPicking(selectedDelivery.id)}
                  style={{ width: '100%', justifyContent: 'center', borderColor: '#06b6d4', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Compass size={16} />
                  Launch Smart Picking Route Assistant
                </button>

                {/* State Machine Action Controls */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  {selectedDelivery.status === 'DRAFT' && (
                    <button className="btn btn-primary" onClick={() => handleDeliveryStatusUpdate(selectedDelivery.id, 'WAITING')} style={{ width: '100%', justifyContent: 'center' }}>
                      Check Inventory Availability
                    </button>
                  )}
                  {selectedDelivery.status === 'WAITING' && (
                    <button className="btn btn-primary" onClick={() => handleDeliveryStatusUpdate(selectedDelivery.id, 'READY')} style={{ width: '100%', justifyContent: 'center', background: '#0284c7' }}>
                      Reserve Stock & Mark Ready
                    </button>
                  )}
                  {selectedDelivery.status === 'READY' && (
                    <button className="btn btn-primary" onClick={() => handleDeliveryStatusUpdate(selectedDelivery.id, 'DONE')} style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}>
                      Validate & Dispatch Order
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* --- TAB 2: INTERNAL TRANSFERS --- */}
      {subTab === 'transfers' && (
        <>
          <div className="glass-card" style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Inter-location movements within company premises (maintains constant total stock ledger).
            </div>
            <button className="btn btn-primary" onClick={() => setCreateTransferOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg, #06b6d4, #0284c7)', border: 'none' }}>
              <Plus size={16} /> New Internal Move
            </button>
          </div>

          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Source Location (From)</th>
                  <th>Destination Location (To)</th>
                  <th>Schedule Date</th>
                  <th>Responsible</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map(tr => (
                  <tr key={tr.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>{tr.reference}</td>
                    <td style={{ color: 'var(--text-main)', fontWeight: 600 }}>{tr.sourceLocation}</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{tr.destLocation}</td>
                    <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{new Date(tr.scheduleDate).toLocaleDateString()}</td>
                    <td>{tr.responsibleName}</td>
                    <td>
                      <span className={`status-badge ${tr.status === 'DONE' ? 'badge-done' : 'badge-ready'}`}>
                        {tr.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* --- TAB 3: STOCK ADJUSTMENTS & CYCLE COUNT VARIANCE CALCULATOR --- */}
      {subTab === 'adjustments' && (
        <>
          <div className="glass-card" style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Cycle Count Discrepancy & Variance Calculator</span>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Realign physical inventory counts with automated audit reason tags (Damaged, Theft, Expired, Misplaced).
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => setCreateAdjustmentOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
              <Plus size={16} /> Log Cycle Count Discrepancy
            </button>
          </div>

          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Location</th>
                  <th>Product</th>
                  <th>Recorded Qty</th>
                  <th>Counted Qty</th>
                  <th>Variance</th>
                  <th>Audit Reason Tag</th>
                  <th>Log Date</th>
                </tr>
              </thead>
              <tbody>
                {adjustments.map(adj => (
                  <tr key={adj.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f59e0b' }}>{adj.reference}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem' }}>{adj.location}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{adj.productName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{adj.sku}</div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{adj.recordedQty}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#38bdf8' }}>{adj.countedQty}</td>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: adj.variance < 0 ? '#ef4444' : '#10b981' }}>
                      {adj.variance > 0 ? `+${adj.variance}` : adj.variance}
                    </td>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: adj.reasonTag === 'Damaged' ? 'rgba(239, 68, 68, 0.2)' : adj.reasonTag === 'Theft' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: adj.reasonTag === 'Damaged' ? '#f87171' : adj.reasonTag === 'Theft' ? '#c084fc' : '#fbbf24'
                      }}>
                        {adj.reasonTag}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(adj.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* MODAL: Smart Picking Route Assistant */}
      {pickingRouteModal && pickingRouteData && (
        <div className="modal-backdrop" onClick={() => setPickingRouteModal(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px', width: '100%', background: '#0f172a', border: '1px solid rgba(6, 182, 212, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass size={22} color="#06b6d4" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>Smart Picking Route Assistant</h3>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Optimized rack walking sequence for {pickingRouteData.deliveryRef}</div>
                </div>
              </div>
              <button onClick={() => setPickingRouteModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Picking stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', background: '#1e293b', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem', textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>TOTAL ITEMS</span>
                <strong style={{ fontSize: '1.1rem', color: '#38bdf8' }}>{pickingRouteData.totalItems}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>RACK STOPS</span>
                <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>{pickingRouteData.totalStopPoints} Stops</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>EST. WALKING TIME</span>
                <strong style={{ fontSize: '1.1rem', color: '#f59e0b' }}>~{pickingRouteData.estimatedWalkingMins} Mins</strong>
              </div>
            </div>

            {/* Route Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '360px', overflowY: 'auto' }}>
              {pickingRouteData.route.map(step => (
                <div key={step.stepNumber} style={{ borderLeft: '3px solid #06b6d4', background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem 1rem', borderRadius: '0 8px 8px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#06b6d4', fontFamily: 'var(--font-mono)' }}>
                      Stop #{step.stepNumber}: {step.rackLocation}
                    </span>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                      {step.zone}
                    </span>
                  </div>
                  {step.itemsToPick.map((item, idx) => (
                    <div key={idx} style={{ fontSize: '0.8rem', color: '#f8fafc', display: 'flex', justifyContent: 'space-between' }}>
                      <span>• {item.productName} (<code style={{ color: '#94a3b8' }}>{item.sku}</code>)</span>
                      <strong style={{ color: '#10b981' }}>Pick {item.quantityToPick} {item.uom}</strong>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create Delivery Order */}
      {createDeliveryOpen && (
        <div className="modal-backdrop" onClick={() => setCreateDeliveryOpen(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Create Outbound Delivery Order</h3>
              <button onClick={() => setCreateDeliveryOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateDeliverySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input type="text" required placeholder="Customer Name" value={delvCustomer} onChange={e => setDelvCustomer(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              <input type="text" required placeholder="Delivery Address" value={delvAddress} onChange={e => setDelvAddress(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              <input type="date" required value={delvDate} onChange={e => setDelvDate(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCreateDeliveryOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Delivery</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create Internal Transfer */}
      {createTransferOpen && (
        <div className="modal-backdrop" onClick={() => setCreateTransferOpen(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>New Internal Stock Transfer</h3>
              <button onClick={() => setCreateTransferOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateTransferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input type="text" required placeholder="Source Location (From)" value={transSource} onChange={e => setTransSource(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              <input type="text" required placeholder="Target Location (To)" value={transDest} onChange={e => setTransDest(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              <input type="date" required value={transDate} onChange={e => setTransDate(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCreateTransferOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#0284c7' }}>Create Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Log Cycle Count Stock Adjustment */}
      {createAdjustmentOpen && (
        <div className="modal-backdrop" onClick={() => setCreateAdjustmentOpen(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Cycle Count Discrepancy Logger</h3>
              <button onClick={() => setCreateAdjustmentOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateAdjustmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Warehouse Location</label>
                <input type="text" required value={adjLoc} onChange={e => setAdjLoc(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Product Name</label>
                <input type="text" required value={adjProd} onChange={e => setAdjProd(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>System Recorded Qty</label>
                  <input type="number" required value={adjRecorded} onChange={e => setAdjRecorded(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Physical Counted Qty</label>
                  <input type="number" required value={adjCounted} onChange={e => setAdjCounted(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                </div>
              </div>

              {/* Live Variance Calculation Display */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Computed Variance:</span>
                <strong style={{ fontSize: '1.1rem', color: (adjCounted - adjRecorded) < 0 ? '#ef4444' : '#10b981' }}>
                  {(adjCounted - adjRecorded) > 0 ? `+${adjCounted - adjRecorded}` : adjCounted - adjRecorded}
                </strong>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Audit Reason Tag</label>
                <select
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value as any)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: '#1e293b', color: 'white' }}
                >
                  <option value="Damaged">Damaged</option>
                  <option value="Theft">Theft</option>
                  <option value="Expired">Expired</option>
                  <option value="Misplaced">Misplaced</option>
                  <option value="Data Correction">Data Correction</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCreateAdjustmentOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
                  Re-align Ledger & Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
