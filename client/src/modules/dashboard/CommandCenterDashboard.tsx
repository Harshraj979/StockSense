import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/client';
import SummaryCards from './components/SummaryCards';
import UrgencyHeatmapHeader from './components/UrgencyHeatmapHeader';
import FilterToolbar, { FilterState } from './components/FilterToolbar';
import OperationsTable from './components/OperationsTable';
import BottleneckTelemetryDrawer from './components/BottleneckTelemetryDrawer';
import { DashboardMetrics, OperationItem, BottleneckItem } from '../../types/dashboard';
import '../../styles/dashboard.css';

interface CommandCenterDashboardProps {
  initialTypeFilter?: string;
}

export default function CommandCenterDashboard({ initialTypeFilter }: CommandCenterDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [operations, setOperations] = useState<OperationItem[]>([]);
  const [bottlenecks, setBottlenecks] = useState<BottleneckItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [heatmapActive, setHeatmapActive] = useState<boolean>(false);
  const [bottleneckDrawerOpen, setBottleneckDrawerOpen] = useState<boolean>(false);

  const [filters, setFilters] = useState<FilterState>({
    type: initialTypeFilter || 'ALL',
    status: 'ALL',
    warehouse: 'ALL',
    category: 'ALL',
    search: ''
  });

  // Load summary metrics & filter options
  const fetchDashboardData = useCallback(async () => {
    try {
      const [summaryRes, bottleneckRes] = await Promise.all([
        api.dashboard.getSummary(),
        api.dashboard.getBottlenecks()
      ]);

      if (summaryRes.success && summaryRes.data) {
        setMetrics(summaryRes.data as DashboardMetrics);
      }
      if (bottleneckRes.success && bottleneckRes.data) {
        setBottlenecks(bottleneckRes.data as BottleneckItem[]);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    }
  }, []);

  // Fetch operations list based on filters
  const fetchOperations = useCallback(async () => {
    setLoading(true);
    try {
      const opsRes = await api.dashboard.getOperations({
        type: filters.type !== 'ALL' ? filters.type : undefined,
        status: filters.status !== 'ALL' ? filters.status : undefined,
        warehouse: filters.warehouse !== 'ALL' ? filters.warehouse : undefined,
        category: filters.category !== 'ALL' ? filters.category : undefined,
        search: filters.search.trim() !== '' ? filters.search : undefined
      });

      if (opsRes.success && opsRes.data) {
        setOperations(opsRes.data as OperationItem[]);
      }
    } catch (err) {
      console.error('Failed to load operations list:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchOperations();
  }, [fetchOperations]);

  useEffect(() => {
    if (initialTypeFilter) {
      setFilters(prev => ({ ...prev, type: initialTypeFilter }));
    }
  }, [initialTypeFilter]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      type: 'ALL',
      status: 'ALL',
      warehouse: 'ALL',
      category: 'ALL',
      search: ''
    });
  };

  const handleCardFilterClick = (type: 'IN' | 'OUT', status?: string) => {
    setFilters(prev => ({
      ...prev,
      type,
      status: status || 'ALL'
    }));
  };

  return (
    <div className="dashboard-container">
      {/* 1. Operational Urgency Heatmap Banner */}
      <UrgencyHeatmapHeader
        heatRiskIndex={metrics?.heatRiskIndex || 'HIGH'}
        heatmapActive={heatmapActive}
        onToggleHeatmap={() => setHeatmapActive(!heatmapActive)}
        totalLate={(metrics?.receipts.late || 1) + (metrics?.deliveries.late || 1)}
        totalWaiting={metrics?.deliveries.waiting || 2}
      />

      {/* 2. Receipt & Delivery Summary Cards with exact badges */}
      <SummaryCards
        metrics={metrics}
        onFilterClick={handleCardFilterClick}
        onOpenBottlenecks={() => setBottleneckDrawerOpen(true)}
        heatmapActive={heatmapActive}
      />

      {/* 3. Dynamic Multi-Filters Toolbar */}
      <FilterToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        activeCount={operations.length}
      />

      {/* 4. Automated Status Operations Table */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{
            width: '32px', height: '32px', border: '3px solid var(--border-subtle)',
            borderTop: '3px solid var(--primary)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem'
          }} />
          Loading operational records...
        </div>
      ) : (
        <OperationsTable
          operations={operations}
          heatmapActive={heatmapActive}
          onOpenBottlenecks={() => setBottleneckDrawerOpen(true)}
        />
      )}

      {/* 5. Smart Bottleneck Telemetry Drawer */}
      <BottleneckTelemetryDrawer
        isOpen={bottleneckDrawerOpen}
        onClose={() => setBottleneckDrawerOpen(false)}
        bottlenecks={bottlenecks}
        onReplenishSuccess={() => {
          fetchDashboardData();
          fetchOperations();
        }}
      />
    </div>
  );
}
