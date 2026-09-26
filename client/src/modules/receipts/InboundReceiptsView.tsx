import { useState, useEffect } from 'react';
import {
  FileCheck,
  Search,
  Plus,
  ArrowRight,
  CheckCircle2,
  Printer,
  Lock,
  MapPin,
  X,
  ShieldCheck,
  PackageCheck,
  Layers
} from 'lucide-react';
import { api } from '../../api/client';

export interface ReceiptLine {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  demandQty: number;
  doneQty: number;
  uom: string;
}

export interface Receipt {
  id: string;
  reference: string;
  partnerContact: string; // Receive From
  sourceLocation: string; // From
  destLocation: string;   // To
  scheduleDate: string;
  responsibleName?: string;
  status: 'DRAFT' | 'READY' | 'DONE';
  lines: ReceiptLine[];
  createdAt: string;
  updatedAt: string;
}

export interface GRNData {
  grnNumber: string;
  reference: string;
  vendorName: string;
  sourceLocation: string;
  receivedLocation: string;
  receivedDate: string;
  scheduledDate: string;
  verifiedBy: string;
  items: Array<{
    productName: string;
    sku: string;
    expectedQty: number;
    receivedQty: number;
    uom: string;
    variance: number;
    status: string;
  }>;
  signatureRequired: boolean;
}

export default function InboundReceiptsView() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal states
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [dockModalOpen, setDockModalOpen] = useState<boolean>(false);
  const [selectedDockLocation, setSelectedDockLocation] = useState<string>('WH/Stock1');
  const [grnModalOpen, setGRNModalOpen] = useState<boolean>(false);
  const [grnData, setGRNData] = useState<GRNData | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

  // New receipt form state
  const [newVendor, setNewVendor] = useState('');
  const [newSourceLoc, setNewSourceLoc] = useState('Vendor/Supplier Dock');
  const [newDestLoc, setNewDestLoc] = useState('WH/Stock1');
  const [newScheduleDate, setNewScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLines, setNewLines] = useState([
    { productName: 'Steel Rods 12mm', sku: 'SKU-RAW-1001', demandQty: 50, uom: 'Units' }
  ]);

  useEffect(() => {
    fetchReceipts();
  }, [searchTerm, statusFilter]);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await api.receipts.getReceipts({
        search: searchTerm || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined
      });
      if (res.success && res.data) {
        setReceipts(res.data as Receipt[]);
      }
    } catch (err) {
      console.error('Failed to fetch receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReceipt = async (receipt: Receipt) => {
    try {
      const res = await api.receipts.getReceiptById(receipt.id);
      if (res.success && res.data) {
        setSelectedReceipt(res.data as Receipt);
      } else {
        setSelectedReceipt(receipt);
      }
    } catch (err) {
      setSelectedReceipt(receipt);
    }
  };

  const handleStatusChange = async (receiptId: string, newStatus: 'DRAFT' | 'READY' | 'DONE') => {
    try {
      const res = await api.receipts.updateStatus(receiptId, newStatus);
      if (res.success && res.data) {
        setSelectedReceipt(res.data as Receipt);
        fetchReceipts();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDockAcceptance = async () => {
    if (!selectedReceipt) return;
    try {
      const res = await api.receipts.dockAcceptance(selectedReceipt.id, selectedDockLocation);
      if (res.success && res.data) {
        setSelectedReceipt(res.data as Receipt);
        setDockModalOpen(false);
        fetchReceipts();
      }
    } catch (err) {
      console.error('Failed dock acceptance:', err);
    }
  };

  const handlePrintGRN = async (receipt: Receipt) => {
    if (receipt.status !== 'DONE') {
      alert('Receipt Goods Received Note (GRN) is strictly locked until status is DONE.');
      return;
    }
    try {
      const res = await api.receipts.getGRN(receipt.id);
      if (res.success && res.data) {
        setGRNData(res.data as GRNData);
        setGRNModalOpen(true);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to fetch GRN data');
    }
  };

  const handleCreateReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor) return;
    try {
      const res = await api.receipts.createReceipt({
        partnerContact: newVendor,
        sourceLocation: newSourceLoc,
        destLocation: newDestLoc,
        scheduleDate: newScheduleDate,
        lines: newLines
      });
      if (res.success && res.data) {
        setCreateModalOpen(false);
        setNewVendor('');
        setNewLines([{ productName: 'Steel Rods 12mm', sku: 'SKU-RAW-1001', demandQty: 50, uom: 'Units' }]);
        fetchReceipts();
        setSelectedReceipt(res.data as Receipt);
      }
    } catch (err) {
      console.error('Failed to create receipt:', err);
    }
  };

  const addLineItem = () => {
    setNewLines([...newLines, { productName: '', sku: '', demandQty: 10, uom: 'Units' }]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="status-badge badge-draft">Draft</span>;
      case 'READY':
        return <span className="status-badge badge-ready">Ready (Dock)</span>;
      case 'DONE':
        return <span className="status-badge badge-done"><CheckCircle2 size={12} style={{ marginRight: '3px' }} /> Done</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="command-dashboard">
      {/* Module Banner */}
      <div className="glass-card page-header-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileCheck size={18} color="#10b981" />
            </div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Inbound Operations & Vendor Receipts
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Inward stock flow, dock acceptance validation, and automated Goods Received Notes (GRN).
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setCreateModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
        >
          <Plus size={16} />
          Create Receipt
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="search-input"
              placeholder="Search reference (WH/IN/0001), vendor, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.4rem', height: '36px', fontSize: '0.85rem', borderRadius: '6px' }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {['ALL', 'DRAFT', 'READY', 'DONE'].map(st => (
              <button
                key={st}
                className={`filter-chip ${statusFilter === st ? 'active' : ''}`}
                onClick={() => setStatusFilter(st)}
                style={{ fontSize: '0.775rem', padding: '0.3rem 0.65rem' }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Showing {receipts.length} Receipt Record(s)
        </div>
      </div>

      {/* Main Workspace: Table + Detail View Split */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedReceipt ? '1fr 420px' : '1fr', gap: '1.25rem' }}>
        
        {/* Table view with required columns: Reference, From, To, Contact, Schedule date, Status */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={16} color="#10b981" />
              Inbound Receipt Ledger
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Contact</th>
                  <th>Schedule Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Loading receipts...
                    </td>
                  </tr>
                ) : receipts.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No receipts found matching filter.
                    </td>
                  </tr>
                ) : (
                  receipts.map(rcpt => (
                    <tr
                      key={rcpt.id}
                      onClick={() => handleSelectReceipt(rcpt)}
                      style={{
                        cursor: 'pointer',
                        background: selectedReceipt?.id === rcpt.id ? 'rgba(16, 185, 129, 0.08)' : 'transparent'
                      }}
                    >
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-light)' }}>
                        {rcpt.reference}
                      </td>
                      <td style={{ color: 'var(--text-main)' }}>{rcpt.sourceLocation}</td>
                      <td style={{ color: 'var(--text-main)' }}>
                        <span style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                          {rcpt.destLocation}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500, color: 'var(--text-main)' }}>{rcpt.partnerContact}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                        {new Date(rcpt.scheduleDate).toLocaleDateString()}
                      </td>
                      <td>{getStatusBadge(rcpt.status)}</td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleSelectReceipt(rcpt)}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            Details
                          </button>
                          <button
                            className={`btn ${rcpt.status === 'DONE' ? 'btn-secondary' : 'btn-outline'}`}
                            onClick={() => handlePrintGRN(rcpt)}
                            title={rcpt.status === 'DONE' ? 'Print Goods Received Note' : 'GRN Locked (Requires status DONE)'}
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.75rem',
                              opacity: rcpt.status === 'DONE' ? 1 : 0.65,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            {rcpt.status === 'DONE' ? <Printer size={12} /> : <Lock size={12} color="#f59e0b" />}
                            GRN
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Receipt Detail View Panel */}
        {selectedReceipt && (
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Receipt Document
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.1rem 0 0', color: 'var(--primary-light)', fontFamily: 'var(--font-mono)' }}>
                  {selectedReceipt.reference}
                </h2>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* State Machine Lifecycle Indicator */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                State Machine Lifecycle:
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: selectedReceipt.status === 'DRAFT' ? '#f59e0b' : '#94a3b8' }}>
                    Draft
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Initial creation</div>
                </div>
                <ArrowRight size={14} color="var(--text-muted)" />
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: selectedReceipt.status === 'READY' ? '#38bdf8' : selectedReceipt.status === 'DONE' ? '#10b981' : '#94a3b8' }}>
                    Ready
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Dock Confirmed</div>
                </div>
                <ArrowRight size={14} color="var(--text-muted)" />
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: selectedReceipt.status === 'DONE' ? '#10b981' : '#94a3b8' }}>
                    Done
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Stock Validated</div>
                </div>
              </div>
            </div>

            {/* Required Fields View */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.825rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Receive From</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedReceipt.partnerContact}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Schedule Date</span>
                <strong style={{ color: 'var(--text-main)' }}>{new Date(selectedReceipt.scheduleDate).toLocaleDateString()}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Source Location</span>
                <span style={{ color: 'var(--text-main)' }}>{selectedReceipt.sourceLocation}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Target Sub-location</span>
                <span style={{ color: '#10b981', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{selectedReceipt.destLocation}</span>
              </div>
            </div>

            {/* Line-item Products table */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Line Items & Quantities</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedReceipt.lines.length} item(s)</span>
              </div>
              <div style={{ borderRadius: '6px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <tr>
                      <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left' }}>Product</th>
                      <th style={{ padding: '0.4rem 0.6rem', textAlign: 'center' }}>Demand</th>
                      <th style={{ padding: '0.4rem 0.6rem', textAlign: 'center' }}>Done</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReceipt.lines.map(line => (
                      <tr key={line.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '0.5rem 0.6rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{line.productName}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{line.sku}</div>
                        </td>
                        <td style={{ padding: '0.5rem 0.6rem', textAlign: 'center', fontWeight: 600 }}>
                          {line.demandQty} {line.uom}
                        </td>
                        <td style={{ padding: '0.5rem 0.6rem', textAlign: 'center', fontWeight: 700, color: selectedReceipt.status === 'DONE' ? '#10b981' : '#f59e0b' }}>
                          {line.doneQty} {line.uom}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons: State transitions, 1-Click Dock Acceptance, Print GRN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
              {selectedReceipt.status === 'DRAFT' && (
                <button
                  className="btn btn-primary"
                  onClick={() => handleStatusChange(selectedReceipt.id, 'READY')}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Confirm Shipment & Mark Ready
                </button>
              )}

              {selectedReceipt.status === 'READY' && (
                <button
                  className="btn btn-primary"
                  onClick={() => setDockModalOpen(true)}
                  style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
                >
                  <PackageCheck size={16} style={{ marginRight: '0.4rem' }} />
                  1-Click Dock Acceptance
                </button>
              )}

              {/* Print GRN button strictly locked until DONE */}
              <button
                className={`btn ${selectedReceipt.status === 'DONE' ? 'btn-secondary' : 'btn-outline'}`}
                onClick={() => handlePrintGRN(selectedReceipt)}
                disabled={selectedReceipt.status !== 'DONE'}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  opacity: selectedReceipt.status === 'DONE' ? 1 : 0.6,
                  cursor: selectedReceipt.status === 'DONE' ? 'pointer' : 'not-allowed'
                }}
              >
                {selectedReceipt.status === 'DONE' ? (
                  <>
                    <Printer size={16} style={{ marginRight: '0.4rem' }} />
                    Print Goods Received Note (GRN)
                  </>
                ) : (
                  <>
                    <Lock size={16} color="#f59e0b" style={{ marginRight: '0.4rem' }} />
                    GRN Locked (Requires DONE Status)
                  </>
                )}
              </button>

              {selectedReceipt.status === 'DONE' && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.6rem', borderRadius: '6px', fontSize: '0.75rem', color: '#10b981', textAlign: 'center' }}>
                  <ShieldCheck size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Stock automatically incremented into {selectedReceipt.destLocation}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal: 1-Click Dock Acceptance */}
      {dockModalOpen && selectedReceipt && (
        <div className="modal-backdrop" onClick={() => setDockModalOpen(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PackageCheck color="#10b981" size={20} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>1-Click Dock Acceptance</h3>
              </div>
              <button onClick={() => setDockModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Confirm receiving items for <strong style={{ color: 'var(--primary-light)' }}>{selectedReceipt.reference}</strong>.
              This will automatically increment product stock levels in the designated warehouse location.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Select Designated Sub-location:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {['WH/Stock1', 'WH/Stock2', 'WH/Dock-A', 'WH/Rack-1'].map(loc => (
                  <button
                    key={loc}
                    className={`btn ${selectedDockLocation === loc ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setSelectedDockLocation(loc)}
                    style={{
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-mono)',
                      justifyContent: 'center',
                      background: selectedDockLocation === loc ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                      borderColor: selectedDockLocation === loc ? '#10b981' : 'var(--border-subtle)',
                      color: selectedDockLocation === loc ? '#10b981' : 'var(--text-main)'
                    }}
                  >
                    <MapPin size={14} style={{ marginRight: '4px' }} />
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDockModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleDockAcceptance} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}>
                Validate & Increment Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Automated Goods Received Note (GRN) Formatter */}
      {grnModalOpen && grnData && (
        <div className="modal-backdrop" onClick={() => setGRNModalOpen(false)}>
          <div
            className="modal-content glass-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '680px', width: '100%', background: '#0f172a', color: '#f8fafc', padding: '1.75rem', border: '1px solid rgba(16, 185, 129, 0.4)' }}
          >
            {/* Header / Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #334155', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={20} color="#10b981" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10b981' }}>
                    StockSense Goods Received Note (GRN)
                  </span>
                </div>
                <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>
                  {grnData.grnNumber}
                </h2>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => window.print()}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#10b981' }}
                >
                  <Printer size={15} />
                  Print GRN
                </button>
                <button onClick={() => setGRNModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* GRN Summary Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#1e293b', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Vendor / Received From:</span>
                <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>{grnData.vendorName}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Reference:</span>
                <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{grnData.reference}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Validated Target Location:</span>
                <span style={{ color: '#10b981', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{grnData.receivedLocation}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Date Received:</span>
                <span style={{ color: '#cbd5e1' }}>{new Date(grnData.receivedDate).toLocaleString()}</span>
              </div>
            </div>

            {/* Verified Items Table */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Verified Stock Items
              </div>
              <table style={{ width: '100%', fontSize: '0.825rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#1e293b', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left', color: '#cbd5e1' }}>Item Description</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center', color: '#cbd5e1' }}>Expected Qty</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center', color: '#cbd5e1' }}>Received Qty</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center', color: '#cbd5e1' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {grnData.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '0.5rem' }}>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{item.productName}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{item.sku}</div>
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>{item.expectedQty} {item.uom}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 700, color: '#10b981' }}>
                        {item.receivedQty} {item.uom}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                          VERIFIED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature Lines ready for physical goods verification */}
            <div style={{ borderTop: '1px dashed #475569', paddingTop: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2rem' }}>
                  Received & Verified By (Warehouse Dock Inspector):
                </div>
                <div style={{ borderBottom: '1px solid #64748b', width: '80%', paddingBottom: '0.2rem', color: '#f8fafc', fontWeight: 600 }}>
                  {grnData.verifiedBy}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>Authorized Signature</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2rem' }}>
                  Carrier / Driver Sign-off:
                </div>
                <div style={{ borderBottom: '1px solid #64748b', width: '80%', paddingBottom: '0.2rem', color: '#64748b', fontStyle: 'italic' }}>
                  _______________________
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>Carrier Signature & Stamp</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Inbound Receipt */}
      {createModalOpen && (
        <div className="modal-backdrop" onClick={() => setCreateModalOpen(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileCheck color="#10b981" size={20} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Create New Vendor Receipt</h3>
              </div>
              <button onClick={() => setCreateModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateReceiptSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Receive From (Vendor Contact)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SteelCorp International"
                  value={newVendor}
                  onChange={e => setNewVendor(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Source Location (From)</label>
                  <input
                    type="text"
                    value={newSourceLoc}
                    onChange={e => setNewSourceLoc(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Target Sub-location (To)</label>
                  <input
                    type="text"
                    value={newDestLoc}
                    onChange={e => setNewDestLoc(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Schedule Date</label>
                  <input
                    type="date"
                    required
                    value={newScheduleDate}
                    onChange={e => setNewScheduleDate(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                  />
                </div>
              </div>

              {/* Line items section */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Line Items</label>
                  <button type="button" onClick={addLineItem} style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                    + Add Item
                  </button>
                </div>

                {newLines.map((line, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={line.productName}
                      onChange={e => {
                        const copy = [...newLines];
                        copy[idx].productName = e.target.value;
                        setNewLines(copy);
                      }}
                      style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '0.8rem' }}
                    />
                    <input
                      type="number"
                      placeholder="Demand Qty"
                      value={line.demandQty}
                      onChange={e => {
                        const copy = [...newLines];
                        copy[idx].demandQty = Number(e.target.value);
                        setNewLines(copy);
                      }}
                      style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '0.8rem' }}
                    />
                    <input
                      type="text"
                      placeholder="UOM"
                      value={line.uom}
                      onChange={e => {
                        const copy = [...newLines];
                        copy[idx].uom = e.target.value;
                        setNewLines(copy);
                      }}
                      style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '0.8rem' }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCreateModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}>
                  Create Draft Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
