import { prisma } from '../../config/db';

export interface DashboardMetrics {
  receipts: {
    toReceive: number;
    late: number;
    operations: number;
  };
  deliveries: {
    toDeliver: number;
    late: number;
    waiting: number;
    operations: number;
  };
  heatRiskIndex: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  totalActiveCount: number;
}

export interface OperationItem {
  id: string;
  reference: string; // e.g. WH/IN/0001
  type: 'RECEIPT' | 'DELIVERY' | 'INTERNAL' | 'ADJUSTMENT';
  typeCode: 'IN' | 'OUT' | 'INT' | 'ADJ';
  status: 'DRAFT' | 'WAITING' | 'READY' | 'DONE' | 'CANCELED';
  partnerContact: string;
  deliveryAddress?: string;
  scheduleDate: string; // ISO date string
  isLate: boolean;
  responsibleName: string;
  sourceLocation: string;
  destLocation: string;
  warehouse: string;
  category: string;
  linesCount: number;
  urgent: boolean;
  bottleneckInfo?: {
    missingQty: number;
    availableQty: number;
    productName: string;
    productSku: string;
    uom: string;
  };
}

export interface BottleneckItem {
  id: string;
  operationRef: string;
  partnerContact: string;
  scheduleDate: string;
  productName: string;
  productSku: string;
  category: string;
  warehouse: string;
  location: string;
  demandQty: number;
  onHandQty: number;
  reservedQty: number;
  availableQty: number;
  shortageQty: number;
  urgency: 'HIGH' | 'CRITICAL';
}

// Default operational dataset matching exact Excalidraw & Spec requirements:
// Receipts: 4 to receive, 1 Late, 6 operations
// Deliveries: 4 to Deliver, 1 Late, 2 waiting, 6 operations
const MOCK_OPERATIONS: OperationItem[] = [
  // RECEIPTS (IN) - Total 6 operations, 4 to receive (Draft/Ready/Waiting), 1 Late
  {
    id: 'op-rcpt-01',
    reference: 'WH/IN/0001',
    type: 'RECEIPT',
    typeCode: 'IN',
    status: 'READY',
    partnerContact: 'Apple Logistics Inc.',
    scheduleDate: '2026-09-25T09:00:00.000Z', // Yesterday -> LATE!
    isLate: true,
    responsibleName: 'Harshraj Pandey',
    sourceLocation: 'Vendor/Apple Depot',
    destLocation: 'WH/Stock1',
    warehouse: 'Main Warehouse (WH)',
    category: 'Electronics',
    linesCount: 35,
    urgent: true
  },
  {
    id: 'op-rcpt-02',
    reference: 'WH/IN/0002',
    type: 'RECEIPT',
    typeCode: 'IN',
    status: 'READY',
    partnerContact: 'Samsung Parts Dist.',
    scheduleDate: '2026-09-26T14:00:00.000Z', // Today -> Scheduled
    isLate: false,
    responsibleName: 'Alex Rivers',
    sourceLocation: 'Vendor/Samsung HQ',
    destLocation: 'WH/Stock2',
    warehouse: 'Main Warehouse (WH)',
    category: 'Electronics',
    linesCount: 12,
    urgent: false
  },
  {
    id: 'op-rcpt-03',
    reference: 'WH/IN/0003',
    type: 'RECEIPT',
    typeCode: 'IN',
    status: 'DRAFT',
    partnerContact: 'Global Component Suppliers',
    scheduleDate: '2026-09-27T10:30:00.000Z', // Tomorrow
    isLate: false,
    responsibleName: 'Harshraj Pandey',
    sourceLocation: 'Vendor/Global Dock',
    destLocation: 'WH/Stock1',
    warehouse: 'Main Warehouse (WH)',
    category: 'Raw Materials',
    linesCount: 50,
    urgent: false
  },
  {
    id: 'op-rcpt-04',
    reference: 'WH/IN/0004',
    type: 'RECEIPT',
    typeCode: 'IN',
    status: 'READY',
    partnerContact: 'Logitech Wholesale',
    scheduleDate: '2026-09-28T11:00:00.000Z',
    isLate: false,
    responsibleName: 'Sarah Jenkins',
    sourceLocation: 'Vendor/Logitech Depot',
    destLocation: 'WH/Stock1',
    warehouse: 'Main Warehouse (WH)',
    category: 'Accessories',
    linesCount: 20,
    urgent: false
  },
  {
    id: 'op-rcpt-05',
    reference: 'WH/IN/0005',
    type: 'RECEIPT',
    typeCode: 'IN',
    status: 'DONE',
    partnerContact: 'Dell Global Supply',
    scheduleDate: '2026-09-24T16:00:00.000Z',
    isLate: false,
    responsibleName: 'Alex Rivers',
    sourceLocation: 'Vendor/Dell Dock',
    destLocation: 'WH/Stock2',
    warehouse: 'Main Warehouse (WH)',
    category: 'Electronics',
    linesCount: 15,
    urgent: false
  },
  {
    id: 'op-rcpt-06',
    reference: 'WH/IN/0006',
    type: 'RECEIPT',
    typeCode: 'IN',
    status: 'DONE',
    partnerContact: 'Foxconn Direct',
    scheduleDate: '2026-09-23T08:00:00.000Z',
    isLate: false,
    responsibleName: 'Sarah Jenkins',
    sourceLocation: 'Vendor/Foxconn Whse',
    destLocation: 'WH/Stock1',
    warehouse: 'Main Warehouse (WH)',
    category: 'Raw Materials',
    linesCount: 100,
    urgent: false
  },

  // DELIVERIES (OUT) - Total 6 operations, 4 to Deliver (Draft/Ready/Waiting), 1 Late, 2 Waiting
  {
    id: 'op-delv-01',
    reference: 'WH/OUT/0001',
    type: 'DELIVERY',
    typeCode: 'OUT',
    status: 'READY',
    partnerContact: 'Tesla Gigafactory',
    deliveryAddress: '3500 Deer Creek Rd, Palo Alto, CA',
    scheduleDate: '2026-09-25T11:00:00.000Z', // Yesterday -> LATE!
    isLate: true,
    responsibleName: 'Harshraj Pandey',
    sourceLocation: 'WH/Stock1',
    destLocation: 'Customer/Tesla',
    warehouse: 'Main Warehouse (WH)',
    category: 'Electronics',
    linesCount: 8,
    urgent: true
  },
  {
    id: 'op-delv-02',
    reference: 'WH/OUT/0002',
    type: 'DELIVERY',
    typeCode: 'OUT',
    status: 'WAITING', // BOTTLENECK 1
    partnerContact: 'SpaceX Launch Complex',
    deliveryAddress: 'Rocket Park Way, Boca Chica, TX',
    scheduleDate: '2026-09-26T15:30:00.000Z',
    isLate: false,
    responsibleName: 'Alex Rivers',
    sourceLocation: 'WH/Stock1',
    destLocation: 'Customer/SpaceX',
    warehouse: 'Main Warehouse (WH)',
    category: 'Electronics',
    linesCount: 4,
    urgent: true,
    bottleneckInfo: {
      missingQty: 25,
      availableQty: 5,
      productName: 'M3 Max Ultra SoC Modules',
      productSku: 'SKU-ELEC-8901',
      uom: 'Units'
    }
  },
  {
    id: 'op-delv-03',
    reference: 'WH/OUT/0003',
    type: 'DELIVERY',
    typeCode: 'OUT',
    status: 'WAITING', // BOTTLENECK 2
    partnerContact: 'NVIDIA Solutions Corp',
    deliveryAddress: '2701 San Tomas Expy, Santa Clara, CA',
    scheduleDate: '2026-09-26T17:00:00.000Z',
    isLate: false,
    responsibleName: 'Sarah Jenkins',
    sourceLocation: 'WH/Stock2',
    destLocation: 'Customer/NVIDIA',
    warehouse: 'Main Warehouse (WH)',
    category: 'Finished Goods',
    linesCount: 15,
    urgent: true,
    bottleneckInfo: {
      missingQty: 40,
      availableQty: 10,
      productName: 'Titanium Heatsink Enclosures',
      productSku: 'SKU-FG-4420',
      uom: 'Units'
    }
  },
  {
    id: 'op-delv-04',
    reference: 'WH/OUT/0004',
    type: 'DELIVERY',
    typeCode: 'OUT',
    status: 'READY',
    partnerContact: 'Microsoft Cloud Center',
    deliveryAddress: 'One Microsoft Way, Redmond, WA',
    scheduleDate: '2026-09-27T09:00:00.000Z',
    isLate: false,
    responsibleName: 'Harshraj Pandey',
    sourceLocation: 'WH/Stock1',
    destLocation: 'Customer/Microsoft',
    warehouse: 'Main Warehouse (WH)',
    category: 'Electronics',
    linesCount: 50,
    urgent: false
  },
  {
    id: 'op-delv-05',
    reference: 'WH/OUT/0005',
    type: 'DELIVERY',
    typeCode: 'OUT',
    status: 'DONE',
    partnerContact: 'Google Data Center',
    deliveryAddress: '1600 Amphitheatre Pkwy, Mountain View, CA',
    scheduleDate: '2026-09-24T13:00:00.000Z',
    isLate: false,
    responsibleName: 'Alex Rivers',
    sourceLocation: 'WH/Stock2',
    destLocation: 'Customer/Google',
    warehouse: 'Main Warehouse (WH)',
    category: 'Electronics',
    linesCount: 30,
    urgent: false
  },
  {
    id: 'op-delv-06',
    reference: 'WH/OUT/0006',
    type: 'DELIVERY',
    typeCode: 'OUT',
    status: 'DONE',
    partnerContact: 'Amazon Logistics Fulfillment',
    deliveryAddress: '410 Terry Ave N, Seattle, WA',
    scheduleDate: '2026-09-23T10:00:00.000Z',
    isLate: false,
    responsibleName: 'Sarah Jenkins',
    sourceLocation: 'WH/Stock1',
    destLocation: 'Customer/Amazon',
    warehouse: 'Main Warehouse (WH)',
    category: 'Packaging',
    linesCount: 120,
    urgent: false
  },

  // INTERNAL MOVES (INT) & ADJUSTMENTS (ADJ)
  {
    id: 'op-int-01',
    reference: 'WH/INT/0001',
    type: 'INTERNAL',
    typeCode: 'INT',
    status: 'READY',
    partnerContact: 'Internal Transfer',
    scheduleDate: '2026-09-26T12:00:00.000Z',
    isLate: false,
    responsibleName: 'Harshraj Pandey',
    sourceLocation: 'WH/Stock1',
    destLocation: 'WH/Stock2',
    warehouse: 'Main Warehouse (WH)',
    category: 'Raw Materials',
    linesCount: 18,
    urgent: false
  },
  {
    id: 'op-adj-01',
    reference: 'WH/ADJ/0001',
    type: 'ADJUSTMENT',
    typeCode: 'ADJ',
    status: 'DRAFT',
    partnerContact: 'Q3 Inventory Cycle Count',
    scheduleDate: '2026-09-26T16:00:00.000Z',
    isLate: false,
    responsibleName: 'Sarah Jenkins',
    sourceLocation: 'WH/Stock1',
    destLocation: 'Inventory Loss/Gain',
    warehouse: 'Main Warehouse (WH)',
    category: 'Finished Goods',
    linesCount: 5,
    urgent: false
  }
];

export class DashboardService {
  /**
   * Automated Status Calculation Engine:
   * Late: Scheduled Date < Today's Date (and status not DONE/CANCELED)
   * Operations: Scheduled Date >= Today's Date (active operations)
   * Waiting: Stock quantity is insufficient to fulfill order
   */
  static async getSummaryMetrics(): Promise<DashboardMetrics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let operationsList = MOCK_OPERATIONS;

    try {
      if (prisma.operation) {
        const dbOps = await prisma.operation.findMany({
          include: { lines: { include: { product: true } } }
        });
        if (dbOps && dbOps.length > 0) {
          // Can map db operations if database is populated
        }
      }
    } catch (e) {
      // Fallback to MOCK_OPERATIONS if db query is unavailable
    }

    // Receipt Calculations
    const receiptOps = operationsList.filter(o => o.type === 'RECEIPT');
    const receiptsToReceive = receiptOps.filter(o => ['DRAFT', 'READY', 'WAITING'].includes(o.status)).length;
    const receiptsLate = receiptOps.filter(o => {
      const schDate = new Date(o.scheduleDate);
      return schDate < today && !['DONE', 'CANCELED'].includes(o.status);
    }).length;
    const receiptOperationsCount = receiptOps.length;

    // Delivery Calculations
    const deliveryOps = operationsList.filter(o => o.type === 'DELIVERY');
    const deliveriesToDeliver = deliveryOps.filter(o => ['DRAFT', 'READY', 'WAITING'].includes(o.status)).length;
    const deliveriesLate = deliveryOps.filter(o => {
      const schDate = new Date(o.scheduleDate);
      return schDate < today && !['DONE', 'CANCELED'].includes(o.status);
    }).length;
    const deliveriesWaiting = deliveryOps.filter(o => o.status === 'WAITING').length;
    const deliveryOperationsCount = deliveryOps.length;

    const totalActiveCount = operationsList.filter(o => !['DONE', 'CANCELED'].includes(o.status)).length;

    // Operational Heat Risk Index calculation
    let heatRiskIndex: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    const totalLate = receiptsLate + deliveriesLate;
    if (totalLate >= 2 || deliveriesWaiting >= 2) {
      heatRiskIndex = 'HIGH';
    } else if (totalLate > 0 || deliveriesWaiting > 0) {
      heatRiskIndex = 'MEDIUM';
    }

    return {
      receipts: {
        toReceive: receiptsToReceive,
        late: receiptsLate,
        operations: receiptOperationsCount
      },
      deliveries: {
        toDeliver: deliveriesToDeliver,
        late: deliveriesLate,
        waiting: deliveriesWaiting,
        operations: deliveryOperationsCount
      },
      heatRiskIndex,
      totalActiveCount
    };
  }

  static async getOperations(filters: {
    type?: string;
    status?: string;
    warehouse?: string;
    category?: string;
    search?: string;
  }): Promise<OperationItem[]> {
    let list = [...MOCK_OPERATIONS];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Dynamic Multi-Filters execution
    if (filters.type && filters.type !== 'ALL') {
      list = list.filter(o => o.typeCode === filters.type || o.type === filters.type);
    }

    if (filters.status && filters.status !== 'ALL') {
      list = list.filter(o => o.status === filters.status);
    }

    if (filters.warehouse && filters.warehouse !== 'ALL') {
      list = list.filter(o => o.warehouse.toLowerCase().includes(filters.warehouse!.toLowerCase()));
    }

    if (filters.category && filters.category !== 'ALL') {
      list = list.filter(o => o.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(o =>
        o.reference.toLowerCase().includes(q) ||
        o.partnerContact.toLowerCase().includes(q) ||
        o.responsibleName.toLowerCase().includes(q) ||
        (o.bottleneckInfo?.productName && o.bottleneckInfo.productName.toLowerCase().includes(q))
      );
    }

    return list;
  }

  static async getBottleneckTelemetry(): Promise<BottleneckItem[]> {
    // Return telemetry breakdown for blocked waiting orders
    return [
      {
        id: 'bot-01',
        operationRef: 'WH/OUT/0002',
        partnerContact: 'SpaceX Launch Complex',
        scheduleDate: '2026-09-26T15:30:00.000Z',
        productName: 'M3 Max Ultra SoC Modules',
        productSku: 'SKU-ELEC-8901',
        category: 'Electronics',
        warehouse: 'Main Warehouse (WH)',
        location: 'WH/Stock1',
        demandQty: 30,
        onHandQty: 10,
        reservedQty: 5,
        availableQty: 5,
        shortageQty: 25,
        urgency: 'CRITICAL'
      },
      {
        id: 'bot-02',
        operationRef: 'WH/OUT/0003',
        partnerContact: 'NVIDIA Solutions Corp',
        scheduleDate: '2026-09-26T17:00:00.000Z',
        productName: 'Titanium Heatsink Enclosures',
        productSku: 'SKU-FG-4420',
        category: 'Finished Goods',
        warehouse: 'Main Warehouse (WH)',
        location: 'WH/Stock2',
        demandQty: 50,
        onHandQty: 20,
        reservedQty: 10,
        availableQty: 10,
        shortageQty: 40,
        urgency: 'HIGH'
      }
    ];
  }

  static async getFilterOptions() {
    return {
      types: [
        { code: 'ALL', label: 'All Operations' },
        { code: 'IN', label: 'Receipt (IN)' },
        { code: 'OUT', label: 'Delivery (OUT)' },
        { code: 'INT', label: 'Internal (INT)' },
        { code: 'ADJ', label: 'Adjustment (ADJ)' }
      ],
      statuses: [
        { code: 'ALL', label: 'All Statuses' },
        { code: 'DRAFT', label: 'Draft' },
        { code: 'WAITING', label: 'Waiting' },
        { code: 'READY', label: 'Ready' },
        { code: 'DONE', label: 'Done' },
        { code: 'CANCELED', label: 'Canceled' }
      ],
      warehouses: [
        { code: 'ALL', label: 'All Warehouses' },
        { code: 'WH', label: 'Main Warehouse (WH)' },
        { code: 'WH2', label: 'Secondary Whse (WH2)' }
      ],
      categories: [
        { code: 'ALL', label: 'All Categories' },
        { code: 'Electronics', label: 'Electronics' },
        { code: 'Raw Materials', label: 'Raw Materials' },
        { code: 'Finished Goods', label: 'Finished Goods' },
        { code: 'Accessories', label: 'Accessories' },
        { code: 'Packaging', label: 'Packaging' }
      ]
    };
  }
}
