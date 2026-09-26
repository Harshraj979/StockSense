import {
  FileCheck,
  Truck,
  RefreshCw,
  Sliders,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Flame,
  User
} from 'lucide-react';
import { OperationItem } from '../../../types/dashboard';

interface OperationsTableProps {
  operations: OperationItem[];
  heatmapActive?: boolean;
  onSelectOperation?: (op: OperationItem) => void;
  onOpenBottlenecks?: () => void;
}

export default function OperationsTable({
  operations,
  heatmapActive = false,
  onSelectOperation,
  onOpenBottlenecks
}: OperationsTableProps) {
  if (operations.length === 0) {
    return (
      <div className="operations-table-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '1rem', fontWeight: 600 }}>No operations match the selected filter criteria.</p>
        <p style={{ fontSize: '0.85rem', marginTop: '0.35rem', color: 'var(--text-dim)' }}>
          Try clearing search terms or selecting 'All' in the filters above.
        </p>
      </div>
    );
  }

  const getTypeIcon = (typeCode: string) => {
    switch (typeCode) {
      case 'IN': return <FileCheck size={16} color="#10b981" />;
      case 'OUT': return <Truck size={16} color="#6366f1" />;
      case 'INT': return <RefreshCw size={16} color="#06b6d4" />;
      case 'ADJ': return <Sliders size={16} color="#f59e0b" />;
      default: return <FileCheck size={16} />;
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`operations-table-card ${heatmapActive ? 'heatmap-table-container' : ''}`}>
      <div className="table-responsive">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Type</th>
              <th>Contact / Partner</th>
              <th>Scheduled Date</th>
              <th>Locations (From → To)</th>
              <th>Category</th>
              <th>Status</th>
              <th>Lines</th>
              <th>Responsible</th>
            </tr>
          </thead>
          <tbody>
            {operations.map((op) => {
              const isOverdue = op.isLate && !['DONE', 'CANCELED'].includes(op.status);
              const isWaiting = op.status === 'WAITING';

              return (
                <tr
                  key={op.id}
                  className={`${op.urgent || isOverdue || isWaiting ? 'row-urgent' : ''}`}
                  onClick={() => onSelectOperation && onSelectOperation(op)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Reference */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {heatmapActive && (isOverdue || isWaiting) && (
                        <Flame
                          size={15}
                          color={isOverdue ? '#ef4444' : '#f59e0b'}
                          style={{ animation: 'pulseDanger 1.8s infinite' }}
                        />
                      )}
                      <span className="reference-badge">
                        {op.reference}
                      </span>
                    </div>
                  </td>

                  {/* Type */}
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', fontWeight: 600 }}>
                      {getTypeIcon(op.typeCode)}
                      {op.typeCode}
                    </span>
                  </td>

                  {/* Contact */}
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {op.partnerContact}
                    </div>
                    {op.deliveryAddress && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {op.deliveryAddress}
                      </div>
                    )}
                  </td>

                  {/* Scheduled Date */}
                  <td>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      color: isOverdue ? '#f87171' : 'var(--text-muted)',
                      fontWeight: isOverdue ? 700 : 500
                    }}>
                      <Clock size={14} />
                      {formatDate(op.scheduleDate)}
                    </div>
                  </td>

                  {/* Locations */}
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span style={{ color: 'var(--text-main)' }}>{op.sourceLocation}</span>
                      <span style={{ margin: '0 0.35rem', color: 'var(--text-dim)' }}>→</span>
                      <span style={{ color: 'var(--text-main)' }}>{op.destLocation}</span>
                    </div>
                  </td>

                  {/* Category */}
                  <td>
                    <span style={{
                      fontSize: '0.775rem', padding: '0.25rem 0.5rem', borderRadius: '6px',
                      background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontWeight: 600
                    }}>
                      {op.category}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    {isOverdue ? (
                      <span className="status-badge late">
                        <Clock size={13} />
                        LATE
                      </span>
                    ) : isWaiting ? (
                      <span
                        className="status-badge waiting"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenBottlenecks) onOpenBottlenecks();
                        }}
                        title="Click to view telemetry for blocked stock"
                      >
                        <AlertTriangle size={13} />
                        WAITING
                      </span>
                    ) : op.status === 'READY' ? (
                      <span className="status-badge ready">
                        <CheckCircle2 size={13} />
                        READY
                      </span>
                    ) : op.status === 'DONE' ? (
                      <span className="status-badge done">
                        <CheckCircle2 size={13} />
                        DONE
                      </span>
                    ) : op.status === 'DRAFT' ? (
                      <span className="status-badge draft">
                        DRAFT
                      </span>
                    ) : (
                      <span className="status-badge canceled">
                        <XCircle size={13} />
                        CANCELED
                      </span>
                    )}
                  </td>

                  {/* Lines Count */}
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.85rem' }}>
                      {op.linesCount} items
                    </span>
                  </td>

                  {/* Responsible */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      <User size={13} />
                      {op.responsibleName}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
