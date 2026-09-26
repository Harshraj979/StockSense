import { Boxes, ArrowRightLeft, Warehouse, MapPin } from 'lucide-react';

export function StockView() {
  return (
    <div className="dashboard-container">
      <div className="operations-table-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', padding: '1rem', borderRadius: '50%',
          background: 'var(--primary-light)', color: '#818cf8', marginBottom: '1rem'
        }}>
          <Boxes size={36} />
        </div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Stock & On-Hand Inventory Overview</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0.5rem auto 1.5rem' }}>
          Real-time view of all tracked stock levels across warehouses, reserved quantities, and available free stock.
        </p>

        <div className="table-responsive" style={{ textAlign: 'left', marginTop: '1.5rem' }}>
          <table className="ops-table">
            <thead>
              <tr>
                <th>Product SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Warehouse / Location</th>
                <th>On Hand</th>
                <th>Reserved</th>
                <th>Available Free</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontFamily: 'var(--font-mono)', color: '#818cf8', fontWeight: 700 }}>SKU-ELEC-8901</td>
                <td style={{ fontWeight: 600 }}>M3 Max Ultra SoC Modules</td>
                <td>Electronics</td>
                <td>WH / Stock Location 1</td>
                <td>10 units</td>
                <td style={{ color: '#fbbf24' }}>5 units</td>
                <td style={{ color: '#ef4444', fontWeight: 700 }}>5 units (Deficit)</td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'var(--font-mono)', color: '#818cf8', fontWeight: 700 }}>SKU-FG-4420</td>
                <td style={{ fontWeight: 600 }}>Titanium Heatsink Enclosures</td>
                <td>Finished Goods</td>
                <td>WH / Stock Location 2</td>
                <td>20 units</td>
                <td style={{ color: '#fbbf24' }}>10 units</td>
                <td style={{ color: '#ef4444', fontWeight: 700 }}>10 units (Deficit)</td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'var(--font-mono)', color: '#818cf8', fontWeight: 700 }}>SKU-ACC-1002</td>
                <td style={{ fontWeight: 600 }}>Logitech MX Master 3S</td>
                <td>Accessories</td>
                <td>WH / Stock Location 1</td>
                <td>450 units</td>
                <td style={{ color: '#fbbf24' }}>50 units</td>
                <td style={{ color: '#34d399', fontWeight: 700 }}>400 units</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function MoveHistoryView() {
  return (
    <div className="dashboard-container">
      <div className="operations-table-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', padding: '1rem', borderRadius: '50%',
          background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', marginBottom: '1rem'
        }}>
          <ArrowRightLeft size={36} />
        </div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Stock Ledger & Move History</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0.5rem auto 1.5rem' }}>
          Complete audit ledger of physical inventory movements, receipts, dispatches, and location transfers.
        </p>

        <div className="table-responsive" style={{ textAlign: 'left', marginTop: '1.5rem' }}>
          <table className="ops-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Reference</th>
                <th>From Location</th>
                <th>To Location</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sep 26, 2026, 11:30 AM</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: '#818cf8', fontWeight: 700 }}>WH/IN/0005</td>
                <td>Vendor/Dell Dock</td>
                <td>WH/Stock2</td>
                <td>Dell UltraSharp Monitors</td>
                <td>+15 units</td>
                <td><span className="status-badge ready">INBOUND</span></td>
              </tr>
              <tr>
                <td>Sep 25, 2026, 04:15 PM</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: '#818cf8', fontWeight: 700 }}>WH/OUT/0005</td>
                <td>WH/Stock2</td>
                <td>Customer/Google</td>
                <td>Pixel 9 Pro Modules</td>
                <td>-30 units</td>
                <td><span className="status-badge late">OUTBOUND</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function WarehouseSettingsView() {
  return (
    <div className="dashboard-container">
      <div className="operations-table-card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Warehouse size={28} color="#818cf8" />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Warehouse Infrastructure Settings</h2>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Configure physical warehouses, short codes, and fulfillment rules</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>Main Warehouse (WH)</h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Short Code: WH • Primary Central Distribution Hub</p>
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>Locations: WH/Stock1, WH/Stock2, Input Dock, Output Dock</div>
          </div>
          <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>Secondary Warehouse (WH2)</h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Short Code: WH2 • Overflow & Regional Depot</p>
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>Locations: WH2/Stock1, Receiving Bay</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LocationSettingsView() {
  return (
    <div className="dashboard-container">
      <div className="operations-table-card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <MapPin size={28} color="#38bdf8" />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Location Hierarchy Settings</h2>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Manage internal racks, bins, virtual locations, and partner zones</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Location Shortcode</th>
                <th>Location Name</th>
                <th>Parent Warehouse</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8', fontWeight: 700 }}>WH/Stock1</td>
                <td>Main Stock Floor - Rack A</td>
                <td>Main Warehouse (WH)</td>
                <td>Internal Location</td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8', fontWeight: 700 }}>WH/Stock2</td>
                <td>High-Value Vault - Bay B</td>
                <td>Main Warehouse (WH)</td>
                <td>Internal Location</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
