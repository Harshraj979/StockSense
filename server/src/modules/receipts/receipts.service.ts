import { prisma } from '../../config/db';

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
  reference: string; // WH/IN/0001
  partnerContact: string; // Receive From
  sourceLocation: string; // From
  destLocation: string; // To (e.g., WH/Stock1, WH/Stock2)
  scheduleDate: string;
  responsibleName?: string;
  status: 'DRAFT' | 'READY' | 'DONE';
  lines: ReceiptLine[];
  createdAt: string;
  updatedAt: string;
}

// Initial state populated with spec-compliant mock data
const IN_MEMORY_RECEIPTS: Receipt[] = [
  {
    id: 'rcpt-001',
    reference: 'WH/IN/0001',
    partnerContact: 'SteelCorp International',
    sourceLocation: 'Vendor/SteelCorp Dock',
    destLocation: 'WH/Stock1',
    scheduleDate: '2026-09-27T09:00:00.000Z',
    responsibleName: 'Harshraj Pandey',
    status: 'READY',
    lines: [
      {
        id: 'line-001',
        productId: 'prod-steel-rods',
        productName: 'Steel Rods 12mm',
        sku: 'SKU-RAW-1001',
        demandQty: 50,
        doneQty: 0,
        uom: 'Units'
      },
      {
        id: 'line-002',
        productId: 'prod-alum-sheet',
        productName: 'Aluminum Sheet 4x8',
        sku: 'SKU-RAW-1002',
        demandQty: 25,
        doneQty: 0,
        uom: 'Sheets'
      }
    ],
    createdAt: '2026-09-25T08:00:00.000Z',
    updatedAt: '2026-09-25T08:00:00.000Z'
  },
  {
    id: 'rcpt-002',
    reference: 'WH/IN/0002',
    partnerContact: 'Apple Logistics Inc.',
    sourceLocation: 'Vendor/Apple Depot',
    destLocation: 'WH/Stock1',
    scheduleDate: '2026-09-25T09:00:00.000Z',
    responsibleName: 'Alex Rivers',
    status: 'DRAFT',
    lines: [
      {
        id: 'line-003',
        productId: 'prod-m3-chip',
        productName: 'M3 Max Ultra SoC Modules',
        sku: 'SKU-ELEC-8901',
        demandQty: 100,
        doneQty: 0,
        uom: 'Units'
      }
    ],
    createdAt: '2026-09-24T10:00:00.000Z',
    updatedAt: '2026-09-24T10:00:00.000Z'
  },
  {
    id: 'rcpt-003',
    reference: 'WH/IN/0003',
    partnerContact: 'Samsung Parts Dist.',
    sourceLocation: 'Vendor/Samsung HQ',
    destLocation: 'WH/Stock2',
    scheduleDate: '2026-09-26T14:00:00.000Z',
    responsibleName: 'Sarah Jenkins',
    status: 'DONE',
    lines: [
      {
        id: 'line-004',
        productId: 'prod-oled-panel',
        productName: 'OLED Display Modules 6.7"',
        sku: 'SKU-ELEC-3310',
        demandQty: 200,
        doneQty: 200,
        uom: 'Units'
      }
    ],
    createdAt: '2026-09-23T11:00:00.000Z',
    updatedAt: '2026-09-26T14:00:00.000Z'
  }
];

let receiptCounter = 4;

export async function getAllReceipts(search?: string, status?: string) {
  try {
    const dbReceipts = await prisma.operation.findMany({
      where: {
        type: 'RECEIPT',
        ...(status ? { status: status as any } : {}),
        ...(search ? {
          OR: [
            { reference: { contains: search, mode: 'insensitive' } },
            { partnerContact: { contains: search, mode: 'insensitive' } },
            { sourceLocation: { contains: search, mode: 'insensitive' } },
            { destLocation: { contains: search, mode: 'insensitive' } }
          ]
        } : {})
      },
      include: {
        lines: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (dbReceipts && dbReceipts.length > 0) {
      return dbReceipts.map(r => ({
        id: r.id,
        reference: r.reference,
        partnerContact: r.partnerContact || 'N/A',
        sourceLocation: r.sourceLocation || 'Vendor Dock',
        destLocation: r.destLocation || 'WH/Stock1',
        scheduleDate: r.scheduleDate.toISOString(),
        responsibleName: r.responsibleName || 'System',
        status: r.status as 'DRAFT' | 'READY' | 'DONE',
        lines: r.lines.map(l => ({
          id: l.id,
          productId: l.productId,
          productName: l.product?.name || 'Item',
          sku: l.product?.sku || 'SKU-UNKNOWN',
          demandQty: l.demandQty,
          doneQty: l.doneQty,
          uom: l.product?.uom || 'Units'
        })),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString()
      }));
    }
  } catch (err) {
    // Fall back to in-memory store
  }

  let result = [...IN_MEMORY_RECEIPTS];
  if (status) {
    result = result.filter(r => r.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(r =>
      r.reference.toLowerCase().includes(q) ||
      r.partnerContact.toLowerCase().includes(q) ||
      r.sourceLocation.toLowerCase().includes(q) ||
      r.destLocation.toLowerCase().includes(q)
    );
  }
  return result;
}

export async function getReceiptById(id: string): Promise<Receipt | null> {
  try {
    const dbReceipt = await prisma.operation.findFirst({
      where: { id, type: 'RECEIPT' },
      include: { lines: { include: { product: true } } }
    });

    if (dbReceipt) {
      return {
        id: dbReceipt.id,
        reference: dbReceipt.reference,
        partnerContact: dbReceipt.partnerContact || 'N/A',
        sourceLocation: dbReceipt.sourceLocation || 'Vendor Dock',
        destLocation: dbReceipt.destLocation || 'WH/Stock1',
        scheduleDate: dbReceipt.scheduleDate.toISOString(),
        responsibleName: dbReceipt.responsibleName || 'System',
        status: dbReceipt.status as 'DRAFT' | 'READY' | 'DONE',
        lines: dbReceipt.lines.map(l => ({
          id: l.id,
          productId: l.productId,
          productName: l.product?.name || 'Item',
          sku: l.product?.sku || 'SKU-UNKNOWN',
          demandQty: l.demandQty,
          doneQty: l.doneQty,
          uom: l.product?.uom || 'Units'
        })),
        createdAt: dbReceipt.createdAt.toISOString(),
        updatedAt: dbReceipt.updatedAt.toISOString()
      };
    }
  } catch (err) {
    // fallback
  }

  return IN_MEMORY_RECEIPTS.find(r => r.id === id) || null;
}

export async function createReceipt(data: {
  partnerContact: string;
  sourceLocation?: string;
  destLocation?: string;
  scheduleDate: string;
  responsibleName?: string;
  lines: Array<{ productName: string; sku?: string; demandQty: number; uom?: string }>;
}) {
  const nextIdNum = receiptCounter++;
  const formattedId = String(nextIdNum).padStart(4, '0');
  const reference = `WH/IN/${formattedId}`;

  const newReceipt: Receipt = {
    id: `rcpt-${Date.now()}`,
    reference,
    partnerContact: data.partnerContact,
    sourceLocation: data.sourceLocation || 'Vendor/Supplier Dock',
    destLocation: data.destLocation || 'WH/Stock1',
    scheduleDate: new Date(data.scheduleDate).toISOString(),
    responsibleName: data.responsibleName || 'Warehouse Staff',
    status: 'DRAFT',
    lines: (data.lines || []).map((l, index) => ({
      id: `line-${Date.now()}-${index}`,
      productId: `prod-${Date.now()}-${index}`,
      productName: l.productName,
      sku: l.sku || `SKU-IN-${Math.floor(1000 + Math.random() * 9000)}`,
      demandQty: l.demandQty,
      doneQty: 0,
      uom: l.uom || 'Units'
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  IN_MEMORY_RECEIPTS.unshift(newReceipt);
  return newReceipt;
}

export async function updateReceiptStatus(id: string, status: 'DRAFT' | 'READY' | 'DONE') {
  const receipt = IN_MEMORY_RECEIPTS.find(r => r.id === id);
  if (!receipt) {
    throw new Error('Receipt not found');
  }

  receipt.status = status;
  receipt.updatedAt = new Date().toISOString();

  if (status === 'DONE') {
    // Auto increment stock lines when status reaches DONE
    receipt.lines = receipt.lines.map(line => ({
      ...line,
      doneQty: line.demandQty
    }));
  }

  return receipt;
}

export async function performDockAcceptance(id: string, targetLocation: string) {
  const receipt = IN_MEMORY_RECEIPTS.find(r => r.id === id);
  if (!receipt) {
    throw new Error('Receipt not found');
  }

  receipt.destLocation = targetLocation;
  receipt.status = 'DONE';
  receipt.updatedAt = new Date().toISOString();

  // Increment line quantities to full demand
  receipt.lines = receipt.lines.map(line => ({
    ...line,
    doneQty: line.demandQty
  }));

  return receipt;
}

export async function getReceiptGRN(id: string) {
  const receipt = await getReceiptById(id);
  if (!receipt) {
    throw new Error('Receipt not found');
  }

  // Business Rule: Goods Received Note (GRN) is strictly locked until status is DONE
  if (receipt.status !== 'DONE') {
    const error: any = new Error('Receipt Goods Received Note (GRN) is strictly locked until status is DONE');
    error.statusCode = 403;
    throw error;
  }

  return {
    grnNumber: `GRN-${receipt.reference.replace(/\//g, '-')}`,
    reference: receipt.reference,
    vendorName: receipt.partnerContact,
    sourceLocation: receipt.sourceLocation,
    receivedLocation: receipt.destLocation,
    receivedDate: receipt.updatedAt,
    scheduledDate: receipt.scheduleDate,
    verifiedBy: receipt.responsibleName || 'Warehouse Supervisor',
    items: receipt.lines.map(l => ({
      productName: l.productName,
      sku: l.sku,
      expectedQty: l.demandQty,
      receivedQty: l.doneQty,
      uom: l.uom,
      variance: l.doneQty - l.demandQty,
      status: l.doneQty >= l.demandQty ? 'VERIFIED_COMPLETE' : 'PARTIAL'
    })),
    signatureRequired: true
  };
}
