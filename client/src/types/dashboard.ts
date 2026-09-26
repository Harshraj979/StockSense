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
  reference: string;
  type: 'RECEIPT' | 'DELIVERY' | 'INTERNAL' | 'ADJUSTMENT';
  typeCode: 'IN' | 'OUT' | 'INT' | 'ADJ';
  status: 'DRAFT' | 'WAITING' | 'READY' | 'DONE' | 'CANCELED';
  partnerContact: string;
  deliveryAddress?: string;
  scheduleDate: string;
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
