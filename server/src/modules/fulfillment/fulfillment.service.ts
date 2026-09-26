import { prisma } from '../../config/db';

export interface FulfillmentLine {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  demandQty: number;
  onHandQty: number;
  rackLocation: string; // e.g., Rack A-01, Rack B-04
  uom: string;
}

export interface DeliveryOrder {
  id: string;
  reference: string; // WH/OUT/0001
  partnerContact: string; // Customer Name
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
  reference: string; // WH/INT/0001
  sourceLocation: string; // Main Warehouse / Rack A
  destLocation: string;   // Production Floor / Rack B
  scheduleDate: string;
  responsibleName: string;
  status: 'DRAFT' | 'READY' | 'DONE';
  lines: FulfillmentLine[];
  createdAt: string;
  updatedAt: string;
}

export interface StockAdjustment {
  id: string;
  reference: string; // WH/ADJ/0001
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

// In-Memory dataset for Fulfillment Engine
const IN_MEMORY_DELIVERIES: DeliveryOrder[] = [
  {
    id: 'delv-001',
    reference: 'WH/OUT/0001',
    partnerContact: 'Tesla Gigafactory',
    deliveryAddress: '3500 Deer Creek Rd, Palo Alto, CA',
    scheduleDate: '2026-09-28T10:00:00.000Z',
    responsibleName: 'Harshraj Pandey',
    status: 'READY',
    sourceLocation: 'WH/Stock1',
    destLocation: 'Customer/Tesla Dock',
    lines: [
      {
        id: 'line-d1',
        productId: 'prod-chair-01',
        productName: 'Ergonomic Executive Chair',
        sku: 'SKU-FURN-2021',
        demandQty: 10,
        onHandQty: 45,
        rackLocation: 'Rack A-02',
        uom: 'Units'
      },
      {
        id: 'line-d2',
        productId: 'prod-desk-02',
        productName: 'Adjustable Standing Desk 60"',
        sku: 'SKU-FURN-1090',
        demandQty: 5,
        onHandQty: 12,
        rackLocation: 'Rack C-11',
        uom: 'Units'
      }
    ],
    createdAt: '2026-09-25T14:00:00.000Z',
    updatedAt: '2026-09-25T14:00:00.000Z'
  },
  {
    id: 'delv-002',
    reference: 'WH/OUT/0002',
    partnerContact: 'SpaceX Launch Complex',
    deliveryAddress: 'Rocket Park Way, Boca Chica, TX',
    scheduleDate: '2026-09-26T15:30:00.000Z',
    responsibleName: 'Alex Rivers',
    status: 'WAITING',
    sourceLocation: 'WH/Stock1',
    destLocation: 'Customer/SpaceX',
    lines: [
      {
        id: 'line-d3',
        productId: 'prod-m3-soc',
        productName: 'M3 Max Ultra SoC Modules',
        sku: 'SKU-ELEC-8901',
        demandQty: 25,
        onHandQty: 5, // Shortage -> WAITING!
        rackLocation: 'Rack B-04',
        uom: 'Units'
      }
    ],
    createdAt: '2026-09-24T16:00:00.000Z',
    updatedAt: '2026-09-24T16:00:00.000Z'
  },
  {
    id: 'delv-003',
    reference: 'WH/OUT/0003',
    partnerContact: 'NVIDIA Corp',
    deliveryAddress: '2701 San Tomas Expy, Santa Clara, CA',
    scheduleDate: '2026-09-24T12:00:00.000Z',
    responsibleName: 'Sarah Jenkins',
    status: 'DONE',
    sourceLocation: 'WH/Stock2',
    destLocation: 'Customer/NVIDIA',
    lines: [
      {
        id: 'line-d4',
        productId: 'prod-heatsink',
        productName: 'Titanium Heatsink Enclosures',
        sku: 'SKU-FG-4420',
        demandQty: 50,
        onHandQty: 100,
        rackLocation: 'Rack A-05',
        uom: 'Units'
      }
    ],
    createdAt: '2026-09-22T09:00:00.000Z',
    updatedAt: '2026-09-24T12:00:00.000Z'
  }
];

const IN_MEMORY_INTERNAL_TRANSFERS: InternalTransfer[] = [
  {
    id: 'int-001',
    reference: 'WH/INT/0001',
    sourceLocation: 'Main Warehouse (WH/Stock1)',
    destLocation: 'Production Floor (WH/Prod)',
    scheduleDate: '2026-09-27T08:30:00.000Z',
    responsibleName: 'Alex Rivers',
    status: 'READY',
    lines: [
      {
        id: 'line-i1',
        productId: 'prod-steel-rods',
        productName: 'Steel Rods 12mm',
        sku: 'SKU-RAW-1001',
        demandQty: 30,
        onHandQty: 120,
        rackLocation: 'Rack A-01',
        uom: 'Units'
      }
    ],
    createdAt: '2026-09-26T08:00:00.000Z',
    updatedAt: '2026-09-26T08:00:00.000Z'
  },
  {
    id: 'int-002',
    reference: 'WH/INT/0002',
    sourceLocation: 'Rack A-01',
    destLocation: 'Rack B-04',
    scheduleDate: '2026-09-25T11:00:00.000Z',
    responsibleName: 'Sarah Jenkins',
    status: 'DONE',
    lines: [
      {
        id: 'line-i2',
        productId: 'prod-oled-panel',
        productName: 'OLED Display Modules 6.7"',
        sku: 'SKU-ELEC-3310',
        demandQty: 50,
        onHandQty: 200,
        rackLocation: 'Rack A-01',
        uom: 'Units'
      }
    ],
    createdAt: '2026-09-25T10:00:00.000Z',
    updatedAt: '2026-09-25T11:00:00.000Z'
  }
];

const IN_MEMORY_ADJUSTMENTS: StockAdjustment[] = [
  {
    id: 'adj-001',
    reference: 'WH/ADJ/0001',
    location: 'WH/Stock1',
    productId: 'prod-chair-01',
    productName: 'Ergonomic Executive Chair',
    sku: 'SKU-FURN-2021',
    recordedQty: 50,
    countedQty: 47,
    variance: -3,
    reasonTag: 'Damaged',
    responsibleName: 'Harshraj Pandey',
    createdAt: '2026-09-26T09:15:00.000Z'
  },
  {
    id: 'adj-002',
    reference: 'WH/ADJ/0002',
    location: 'WH/Stock2',
    productId: 'prod-steel-rods',
    productName: 'Steel Rods 12mm',
    sku: 'SKU-RAW-1001',
    recordedQty: 100,
    countedQty: 98,
    variance: -2,
    reasonTag: 'Misplaced',
    responsibleName: 'Alex Rivers',
    createdAt: '2026-09-25T14:30:00.000Z'
  }
];

let delvCounter = 4;
let intCounter = 3;
let adjCounter = 3;

// --- DELIVERY ORDERS ---

export async function getAllDeliveries(search?: string, status?: string) {
  let result = [...IN_MEMORY_DELIVERIES];
  if (status && status !== 'ALL') {
    result = result.filter(d => d.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(d =>
      d.reference.toLowerCase().includes(q) ||
      d.partnerContact.toLowerCase().includes(q) ||
      d.deliveryAddress.toLowerCase().includes(q)
    );
  }
  return result;
}

export async function getDeliveryById(id: string) {
  return IN_MEMORY_DELIVERIES.find(d => d.id === id) || null;
}

export async function createDelivery(data: {
  partnerContact: string;
  deliveryAddress: string;
  scheduleDate: string;
  responsibleName?: string;
  lines: Array<{ productName: string; sku?: string; demandQty: number; rackLocation?: string; uom?: string }>;
}) {
  const formattedId = String(delvCounter++).padStart(4, '0');
  const reference = `WH/OUT/${formattedId}`;

  const newDelivery: DeliveryOrder = {
    id: `delv-${Date.now()}`,
    reference,
    partnerContact: data.partnerContact,
    deliveryAddress: data.deliveryAddress,
    scheduleDate: new Date(data.scheduleDate).toISOString(),
    responsibleName: data.responsibleName || 'Fulfillment Manager',
    status: 'DRAFT',
    sourceLocation: 'WH/Stock1',
    destLocation: `Customer/${data.partnerContact}`,
    lines: (data.lines || []).map((l, index) => ({
      id: `line-${Date.now()}-${index}`,
      productId: `prod-${Date.now()}-${index}`,
      productName: l.productName,
      sku: l.sku || `SKU-OUT-${Math.floor(1000 + Math.random() * 9000)}`,
      demandQty: l.demandQty,
      onHandQty: 50,
      rackLocation: l.rackLocation || `Rack ${String.fromCharCode(65 + (index % 4))}-0${(index % 9) + 1}`,
      uom: l.uom || 'Units'
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  IN_MEMORY_DELIVERIES.unshift(newDelivery);
  return newDelivery;
}

export async function updateDeliveryStatus(id: string, newStatus: 'DRAFT' | 'WAITING' | 'READY' | 'DONE') {
  const delivery = IN_MEMORY_DELIVERIES.find(d => d.id === id);
  if (!delivery) {
    throw new Error('Delivery order not found');
  }

  // Check inventory rule for WAITING -> READY transition
  if (newStatus === 'READY' || newStatus === 'WAITING') {
    const hasShortage = delivery.lines.some(l => l.onHandQty < l.demandQty);
    if (hasShortage && newStatus === 'READY') {
      delivery.status = 'WAITING';
      delivery.updatedAt = new Date().toISOString();
      return { delivery, warning: 'Inventory on hand is insufficient. Status set to WAITING until restocked.' };
    }
  }

  delivery.status = newStatus;
  delivery.updatedAt = new Date().toISOString();

  if (newStatus === 'DONE') {
    // Automatically decrement stock on hand (e.g. -10 Chairs)
    delivery.lines = delivery.lines.map(line => ({
      ...line,
      onHandQty: Math.max(0, line.onHandQty - line.demandQty)
    }));
  }

  return { delivery };
}

// --- SMART PICKING ROUTE ASSISTANT ---

export async function getSmartPickingRoute(deliveryId: string) {
  const delivery = await getDeliveryById(deliveryId);
  if (!delivery) {
    throw new Error('Delivery order not found');
  }

  // Group line items by warehouse rack location to minimize walking time
  const groupedRacks: Record<string, FulfillmentLine[]> = {};
  delivery.lines.forEach(line => {
    const rackKey = line.rackLocation || 'Unassigned Rack';
    if (!groupedRacks[rackKey]) {
      groupedRacks[rackKey] = [];
    }
    groupedRacks[rackKey].push(line);
  });

  // Sort racks alphabetically to form optimal pick sequence
  const sortedRacks = Object.keys(groupedRacks).sort();
  const pickSequence = sortedRacks.map((rack, idx) => ({
    stepNumber: idx + 1,
    rackLocation: rack,
    zone: rack.startsWith('Rack A') ? 'Zone A (Fast Moving)' : rack.startsWith('Rack B') ? 'Zone B (Electronics)' : 'Zone C (Bulk Storage)',
    itemsToPick: groupedRacks[rack].map(item => ({
      productName: item.productName,
      sku: item.sku,
      quantityToPick: item.demandQty,
      uom: item.uom
    }))
  }));

  const estimatedWalkingMins = Math.max(2, sortedRacks.length * 1.5);

  return {
    deliveryRef: delivery.reference,
    customer: delivery.partnerContact,
    totalItems: delivery.lines.reduce((acc, l) => acc + l.demandQty, 0),
    totalStopPoints: sortedRacks.length,
    estimatedWalkingMins,
    route: pickSequence
  };
}

// --- INTERNAL TRANSFERS ---

export async function getAllInternalTransfers() {
  return IN_MEMORY_INTERNAL_TRANSFERS;
}

export async function createInternalTransfer(data: {
  sourceLocation: string;
  destLocation: string;
  scheduleDate: string;
  responsibleName?: string;
  lines: Array<{ productName: string; sku?: string; demandQty: number; uom?: string }>;
}) {
  const formattedId = String(intCounter++).padStart(4, '0');
  const reference = `WH/INT/${formattedId}`;

  const newTransfer: InternalTransfer = {
    id: `int-${Date.now()}`,
    reference,
    sourceLocation: data.sourceLocation,
    destLocation: data.destLocation,
    scheduleDate: new Date(data.scheduleDate).toISOString(),
    responsibleName: data.responsibleName || 'Transfer Supervisor',
    status: 'READY',
    lines: (data.lines || []).map((l, index) => ({
      id: `line-int-${Date.now()}-${index}`,
      productId: `prod-${Date.now()}-${index}`,
      productName: l.productName,
      sku: l.sku || `SKU-INT-${Math.floor(1000 + Math.random() * 9000)}`,
      demandQty: l.demandQty,
      onHandQty: 100,
      rackLocation: 'Rack A-01',
      uom: l.uom || 'Units'
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  IN_MEMORY_INTERNAL_TRANSFERS.unshift(newTransfer);
  return newTransfer;
}

export async function updateTransferStatus(id: string, newStatus: 'DRAFT' | 'READY' | 'DONE') {
  const transfer = IN_MEMORY_INTERNAL_TRANSFERS.find(t => t.id === id);
  if (!transfer) {
    throw new Error('Internal transfer not found');
  }

  transfer.status = newStatus;
  transfer.updatedAt = new Date().toISOString();
  return transfer;
}

// --- STOCK ADJUSTMENTS & CYCLE COUNT VARIANCE CALCULATOR ---

export async function getAllAdjustments() {
  return IN_MEMORY_ADJUSTMENTS;
}

export async function createStockAdjustment(data: {
  location: string;
  productName: string;
  sku?: string;
  recordedQty: number;
  countedQty: number;
  reasonTag: 'Damaged' | 'Theft' | 'Expired' | 'Misplaced' | 'Data Correction';
  responsibleName?: string;
}) {
  const formattedId = String(adjCounter++).padStart(4, '0');
  const reference = `WH/ADJ/${formattedId}`;
  const variance = data.countedQty - data.recordedQty;

  const newAdjustment: StockAdjustment = {
    id: `adj-${Date.now()}`,
    reference,
    location: data.location,
    productId: `prod-adj-${Date.now()}`,
    productName: data.productName,
    sku: data.sku || `SKU-ADJ-${Math.floor(1000 + Math.random() * 9000)}`,
    recordedQty: data.recordedQty,
    countedQty: data.countedQty,
    variance,
    reasonTag: data.reasonTag,
    responsibleName: data.responsibleName || 'Inventory Auditor',
    createdAt: new Date().toISOString()
  };

  IN_MEMORY_ADJUSTMENTS.unshift(newAdjustment);
  return newAdjustment;
}
