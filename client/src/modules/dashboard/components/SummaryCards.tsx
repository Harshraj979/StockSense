import { FileCheck, Truck, Clock, AlertTriangle, Boxes, ArrowRight, ShieldAlert } from 'lucide-react';
import { DashboardMetrics } from '../../../types/dashboard';

interface SummaryCardsProps {
  metrics: DashboardMetrics | null;
  onFilterClick: (type: 'IN' | 'OUT', status?: string) => void;
  onOpenBottlenecks: () => void;
  heatmapActive?: boolean;
}

export default function SummaryCards({
  metrics,
  onFilterClick,
  onOpenBottlenecks,
  heatmapActive = false
}: SummaryCardsProps) {
  const receipts = metrics?.receipts || { toReceive: 4, late: 1, operations: 6 };
  const deliveries = metrics?.deliveries || { toDeliver: 4, late: 1, waiting: 2, operations: 6 };

  return (
    <div className="summary-cards-grid">
      {/* Receipt Summary Card */}
      <div className={`summary-card ${heatmapActive && receipts.late > 0 ? 'heatmap-active-border' : ''}`}>
        <div className="summary-card-header">
          <div className="summary-card-title">
            <div className="card-icon-wrapper receipt">
              <FileCheck size={22} />
            </div>
            <div>
              <h3>Receipts Summary</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                Inbound inventory operations & vendor dockets
              </span>
            </div>
          </div>

          {/* Action trigger: "4 to receive" */}
          <button
            className="action-trigger-btn receipt"
            onClick={() => onFilterClick('IN')}
            title="Click to view all pending inbound receipts"
          >
            <span>{receipts.toReceive} to receive</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Dynamic counters: "1 Late" and "6 operations" */}
        <div className="counters-bar">
          <button
            className="counter-pill late"
            onClick={() => onFilterClick('IN', 'LATE')}
            title="Click to filter 1 overdue receipt operation"
          >
            <Clock size={14} />
            <span>{receipts.late} Late</span>
          </button>

          <button
            className="counter-pill operations"
            onClick={() => onFilterClick('IN')}
            title="Total inbound operations count"
          >
            <Boxes size={14} />
            <span>{receipts.operations} operations</span>
          </button>
        </div>
      </div>

      {/* Delivery Summary Card */}
      <div className={`summary-card ${heatmapActive && (deliveries.late > 0 || deliveries.waiting > 0) ? 'heatmap-active-border' : ''}`}>
        <div className="summary-card-header">
          <div className="summary-card-title">
            <div className="card-icon-wrapper delivery">
              <Truck size={22} />
            </div>
            <div>
              <h3>Delivery Orders Summary</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                Outbound customer orders & dispatch tracking
              </span>
            </div>
          </div>

          {/* Action trigger: "4 to Deliver" */}
          <button
            className="action-trigger-btn delivery"
            onClick={() => onFilterClick('OUT')}
            title="Click to view all pending outbound deliveries"
          >
            <span>{deliveries.toDeliver} to Deliver</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Dynamic counters: "1 Late", "2 waiting", and "6 operations" */}
        <div className="counters-bar">
          <button
            className="counter-pill late"
            onClick={() => onFilterClick('OUT', 'LATE')}
            title="Click to filter 1 overdue delivery operation"
          >
            <Clock size={14} />
            <span>{deliveries.late} Late</span>
          </button>

          {/* Smart Bottleneck Telemetry: Direct click on "2 waiting" badge takes user to blocked stock items */}
          <button
            className="counter-pill waiting"
            onClick={onOpenBottlenecks}
            title="Smart Telemetry: Click to inspect blocked stock items causing waiting status"
          >
            <AlertTriangle size={14} />
            <span>{deliveries.waiting} waiting</span>
            <ShieldAlert size={13} style={{ marginLeft: '2px', opacity: 0.8 }} />
          </button>

          <button
            className="counter-pill operations"
            onClick={() => onFilterClick('OUT')}
            title="Total outbound operations count"
          >
            <Boxes size={14} />
            <span>{deliveries.operations} operations</span>
          </button>
        </div>
      </div>
    </div>
  );
}
