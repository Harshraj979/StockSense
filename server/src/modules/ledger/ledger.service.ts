import { prisma } from '../../config/db';

export interface LedgerEntry {
  id: string;
  reference: string;
  date: string;
  contact: string;
  fromLocation: string;
  toLocation: string;
  productName: string;
  productId: string;
  quantity: number;
  status: string;
  moveType: 'IN' | 'OUT' | 'INT'; // IN=Green, OUT=Red, INT=Cyan
  createdAt: string;
}

// Rich in-memory ledger dataset
const IN_MEMORY_LEDGER: LedgerEntry[] = [
  {
    id: 'led-001',
    reference: 'WH/IN/0003',
    date: '2026-09-26T14:00:00.000Z',
    contact: 'Samsung Parts Dist.',
    fromLocation: 'Vendor/Samsung HQ',
    toLocation: 'WH/Stock2',
    productName: 'OLED Display Modules 6.7"',
    productId: 'prod-oled-001',
    quantity: 200,
    status: 'DONE',
    moveType: 'IN',
    createdAt: '2026-09-26T14:05:00.000Z'
  },
  {
    id: 'led-002',
    reference: 'WH/OUT/0001',
    date: '2026-09-25T10:00:00.000Z',
    contact: 'Tesla Gigafactory',
    fromLocation: 'WH/Stock1',
    toLocation: 'Customer/Tesla Dock',
    productName: 'Ergonomic Executive Chair',
    productId: 'prod-chair-01',
    quantity: 10,
    status: 'DONE',
    moveType: 'OUT',
    createdAt: '2026-09-25T10:10:00.000Z'
  },
  {
    id: 'led-003',
    reference: 'WH/OUT/0001',
    date: '2026-09-25T10:00:00.000Z',
    contact: 'Tesla Gigafactory',
    fromLocation: 'WH/Stock2',
    toLocation: 'Customer/Tesla Dock',
    productName: 'Industrial Optical Sensor',
    productId: 'prod-sensor-01',
    quantity: 5,
    status: 'DONE',
    moveType: 'OUT',
    createdAt: '2026-09-25T10:10:00.000Z'
  },
  {
    id: 'led-004',
    reference: 'WH/INT/0001',
    date: '2026-09-24T08:30:00.000Z',
    contact: 'Internal Transfer',
    fromLocation: 'WH/Stock1',
    toLocation: 'WH/Stock2',
    productName: 'Heavy-Duty Wooden Pallets',
    productId: 'prod-pallet-01',
    quantity: 20,
    status: 'DONE',
    moveType: 'INT',
    createdAt: '2026-09-24T08:35:00.000Z'
  },
  {
    id: 'led-005',
    reference: 'WH/IN/0001',
    date: '2026-09-23T09:00:00.000Z',
    contact: 'SteelCorp International',
    fromLocation: 'Vendor/SteelCorp Dock',
    toLocation: 'WH/Stock1',
    productName: 'Steel Rods (12mm TMT)',
    productId: 'prod-steel-001',
    quantity: 50,
    status: 'READY',
    moveType: 'IN',
    createdAt: '2026-09-23T09:05:00.000Z'
  },
  {
    id: 'led-006',
    reference: 'WH/IN/0001',
    date: '2026-09-23T09:00:00.000Z',
    contact: 'SteelCorp International',
    fromLocation: 'Vendor/SteelCorp Dock',
    toLocation: 'WH/Stock1',
    productName: 'Aluminum Sheet 2mm (4x8ft)',
    productId: 'prod-alum-001',
    quantity: 25,
    status: 'READY',
    moveType: 'IN',
    createdAt: '2026-09-23T09:05:00.000Z'
  },
  {
    id: 'led-007',
    reference: 'WH/OUT/0002',
    date: '2026-09-22T15:30:00.000Z',
    contact: 'Google Cloud HQ',
    fromLocation: 'WH/Stock2',
    toLocation: 'Customer/Google Depot',
    productName: 'High-Torque Electric Motor 1HP',
    productId: 'prod-motor-001',
    quantity: 3,
    status: 'DONE',
    moveType: 'OUT',
    createdAt: '2026-09-22T15:35:00.000Z'
  },
  {
    id: 'led-008',
    reference: 'WH/ADJ/0001',
    date: '2026-09-21T11:00:00.000Z',
    contact: 'Cycle Count Audit',
    fromLocation: 'WH/Stock1',
    toLocation: 'WH/Scrap',
    productName: 'Ergonomic Mesh Chair',
    productId: 'prod-chair-02',
    quantity: 2,
    status: 'DONE',
    moveType: 'OUT',
    createdAt: '2026-09-21T11:05:00.000Z'
  },
  {
    id: 'led-009',
    reference: 'WH/IN/0002',
    date: '2026-09-20T10:00:00.000Z',
    contact: 'Apple Logistics Inc.',
    fromLocation: 'Vendor/Apple Depot',
    toLocation: 'WH/Stock1',
    productName: 'M3 Max Ultra SoC Modules',
    productId: 'prod-m3-001',
    quantity: 100,
    status: 'DRAFT',
    moveType: 'IN',
    createdAt: '2026-09-20T10:05:00.000Z'
  },
  {
    id: 'led-010',
    reference: 'WH/INT/0002',
    date: '2026-09-19T13:00:00.000Z',
    contact: 'Internal Transfer',
    fromLocation: 'WH/Stock2',
    toLocation: 'Production Floor',
    productName: 'Steel Rods (12mm TMT)',
    productId: 'prod-steel-001',
    quantity: 15,
    status: 'DONE',
    moveType: 'INT',
    createdAt: '2026-09-19T13:05:00.000Z'
  }
];

export async function getLedgerEntries(params?: {
  search?: string;
  moveType?: string;
  status?: string;
  reference?: string;
}) {
  // Try DB first
  try {
    const dbEntries = await prisma.stockLedger.findMany({
      where: {
        ...(params?.moveType ? { moveType: params.moveType } : {}),
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.search ? {
          OR: [
            { reference: { contains: params.search, mode: 'insensitive' } },
            { contact: { contains: params.search, mode: 'insensitive' } },
            { productName: { contains: params.search, mode: 'insensitive' } },
            { fromLocation: { contains: params.search, mode: 'insensitive' } },
            { toLocation: { contains: params.search, mode: 'insensitive' } }
          ]
        } : {})
      },
      orderBy: { date: 'desc' }
    });

    if (dbEntries && dbEntries.length > 0) {
      return dbEntries.map(e => ({
        id: e.id,
        reference: e.reference,
        date: e.date.toISOString(),
        contact: e.contact || 'N/A',
        fromLocation: e.fromLocation,
        toLocation: e.toLocation,
        productName: e.productName,
        productId: e.productId,
        quantity: e.quantity,
        status: e.status,
        moveType: e.moveType as 'IN' | 'OUT' | 'INT',
        createdAt: e.createdAt.toISOString()
      }));
    }
  } catch {
    // Fallback to in-memory
  }

  let result = [...IN_MEMORY_LEDGER];

  if (params?.moveType) {
    result = result.filter(e => e.moveType === params.moveType);
  }
  if (params?.status) {
    result = result.filter(e => e.status === params.status);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(e =>
      e.reference.toLowerCase().includes(q) ||
      e.contact.toLowerCase().includes(q) ||
      e.productName.toLowerCase().includes(q) ||
      e.fromLocation.toLowerCase().includes(q) ||
      e.toLocation.toLowerCase().includes(q)
    );
  }

  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getLedgerStats() {
  const entries = await getLedgerEntries();
  const total = entries.length;
  const inbound = entries.filter(e => e.moveType === 'IN').length;
  const outbound = entries.filter(e => e.moveType === 'OUT').length;
  const internal = entries.filter(e => e.moveType === 'INT').length;
  const totalQtyMoved = entries.reduce((sum, e) => sum + e.quantity, 0);

  return { total, inbound, outbound, internal, totalQtyMoved };
}
