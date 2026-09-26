import { prisma } from '../../config/db';

export interface WarehouseRecord {
  id: string;
  name: string;
  shortCode: string;
  address: string;
  locationCount: number;
  createdAt: string;
}

export interface LocationRecord {
  id: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  name: string;
  shortCode: string;
  createdAt: string;
}

// In-memory fallback datasets
const IN_MEMORY_WAREHOUSES: WarehouseRecord[] = [
  {
    id: 'wh-001',
    name: 'Main Central Warehouse',
    shortCode: 'WH',
    address: 'Building 4, Logistics Park, Sector 62',
    locationCount: 4,
    createdAt: new Date('2026-01-01').toISOString()
  },
  {
    id: 'wh-002',
    name: 'Secondary Regional Depot',
    shortCode: 'WH2',
    address: 'Plot 22B, Industrial Zone, Phase 3',
    locationCount: 2,
    createdAt: new Date('2026-02-15').toISOString()
  }
];

const IN_MEMORY_LOCATIONS: LocationRecord[] = [
  {
    id: 'loc-001',
    warehouseId: 'wh-001',
    warehouseName: 'Main Central Warehouse',
    warehouseCode: 'WH',
    name: 'Warehouse Stock Zone 1',
    shortCode: 'WH/Stock1',
    createdAt: new Date('2026-01-01').toISOString()
  },
  {
    id: 'loc-002',
    warehouseId: 'wh-001',
    warehouseName: 'Main Central Warehouse',
    warehouseCode: 'WH',
    name: 'Warehouse Stock Zone 2',
    shortCode: 'WH/Stock2',
    createdAt: new Date('2026-01-01').toISOString()
  },
  {
    id: 'loc-003',
    warehouseId: 'wh-001',
    warehouseName: 'Main Central Warehouse',
    warehouseCode: 'WH',
    name: 'Inbound Receiving Dock',
    shortCode: 'WH/Input',
    createdAt: new Date('2026-01-01').toISOString()
  },
  {
    id: 'loc-004',
    warehouseId: 'wh-001',
    warehouseName: 'Main Central Warehouse',
    warehouseCode: 'WH',
    name: 'Outbound Dispatch Dock',
    shortCode: 'WH/Output',
    createdAt: new Date('2026-01-01').toISOString()
  },
  {
    id: 'loc-005',
    warehouseId: 'wh-002',
    warehouseName: 'Secondary Regional Depot',
    warehouseCode: 'WH2',
    name: 'Regional Stock Floor',
    shortCode: 'WH2/Stock1',
    createdAt: new Date('2026-02-15').toISOString()
  },
  {
    id: 'loc-006',
    warehouseId: 'wh-002',
    warehouseName: 'Secondary Regional Depot',
    warehouseCode: 'WH2',
    name: 'Regional Receiving Bay',
    shortCode: 'WH2/Input',
    createdAt: new Date('2026-02-15').toISOString()
  }
];

// ─── Warehouses ────────────────────────────────────────────────────────────────

export async function getAllWarehouses(): Promise<WarehouseRecord[]> {
  try {
    const whs = await prisma.warehouse.findMany({
      include: { locations: true },
      orderBy: { createdAt: 'asc' }
    });

    if (whs && whs.length > 0) {
      return whs.map(w => ({
        id: w.id,
        name: w.name,
        shortCode: w.shortCode,
        address: w.address || '',
        locationCount: w.locations.length,
        createdAt: w.createdAt.toISOString()
      }));
    }
  } catch {
    // Fallback
  }

  return IN_MEMORY_WAREHOUSES;
}

export async function createWarehouse(data: { name: string; shortCode: string; address?: string }) {
  // Check uniqueness in in-memory
  if (IN_MEMORY_WAREHOUSES.some(w => w.shortCode.toUpperCase() === data.shortCode.toUpperCase())) {
    throw new Error(`Warehouse short code "${data.shortCode.toUpperCase()}" already exists`);
  }

  try {
    const created = await prisma.warehouse.create({
      data: {
        name: data.name,
        shortCode: data.shortCode.toUpperCase(),
        address: data.address || ''
      }
    });
    return {
      id: created.id,
      name: created.name,
      shortCode: created.shortCode,
      address: created.address || '',
      locationCount: 0,
      createdAt: created.createdAt.toISOString()
    };
  } catch {
    // Fallback in-memory create
    const newWh: WarehouseRecord = {
      id: `wh-${Date.now()}`,
      name: data.name,
      shortCode: data.shortCode.toUpperCase(),
      address: data.address || '',
      locationCount: 0,
      createdAt: new Date().toISOString()
    };
    IN_MEMORY_WAREHOUSES.push(newWh);
    return newWh;
  }
}

export async function updateWarehouse(id: string, data: { name?: string; address?: string }) {
  try {
    const updated = await prisma.warehouse.update({
      where: { id },
      data: { name: data.name, address: data.address },
      include: { locations: true }
    });
    return {
      id: updated.id,
      name: updated.name,
      shortCode: updated.shortCode,
      address: updated.address || '',
      locationCount: updated.locations.length,
      createdAt: updated.createdAt.toISOString()
    };
  } catch {
    const wh = IN_MEMORY_WAREHOUSES.find(w => w.id === id);
    if (!wh) throw new Error('Warehouse not found');
    if (data.name) wh.name = data.name;
    if (data.address !== undefined) wh.address = data.address;
    return wh;
  }
}

export async function deleteWarehouse(id: string) {
  try {
    await prisma.warehouse.delete({ where: { id } });
  } catch {
    const idx = IN_MEMORY_WAREHOUSES.findIndex(w => w.id === id);
    if (idx === -1) throw new Error('Warehouse not found');
    IN_MEMORY_WAREHOUSES.splice(idx, 1);
    // Also remove its locations
    const toRemove = IN_MEMORY_LOCATIONS.filter(l => l.warehouseId === id).map(l => l.id);
    toRemove.forEach(lid => {
      const li = IN_MEMORY_LOCATIONS.findIndex(l => l.id === lid);
      if (li !== -1) IN_MEMORY_LOCATIONS.splice(li, 1);
    });
  }
}

// ─── Locations ─────────────────────────────────────────────────────────────────

export async function getAllLocations(warehouseId?: string): Promise<LocationRecord[]> {
  try {
    const locs = await prisma.location.findMany({
      where: warehouseId ? { warehouseId } : {},
      include: { warehouse: true },
      orderBy: { createdAt: 'asc' }
    });

    if (locs && locs.length > 0) {
      return locs.map(l => ({
        id: l.id,
        warehouseId: l.warehouseId,
        warehouseName: l.warehouse.name,
        warehouseCode: l.warehouse.shortCode,
        name: l.name,
        shortCode: l.shortCode,
        createdAt: l.createdAt.toISOString()
      }));
    }
  } catch {
    // Fallback
  }

  let result = [...IN_MEMORY_LOCATIONS];
  if (warehouseId) result = result.filter(l => l.warehouseId === warehouseId);
  return result;
}

export async function createLocation(data: {
  warehouseId: string;
  name: string;
  shortCode: string;
}) {
  // Check uniqueness
  if (IN_MEMORY_LOCATIONS.some(l => l.shortCode.toUpperCase() === data.shortCode.toUpperCase())) {
    throw new Error(`Location shortcode "${data.shortCode}" already exists`);
  }

  try {
    const warehouse = await prisma.warehouse.findUnique({ where: { id: data.warehouseId } });
    if (!warehouse) throw new Error('Warehouse not found');

    const created = await prisma.location.create({
      data: {
        name: data.name,
        shortCode: data.shortCode,
        warehouseId: data.warehouseId
      },
      include: { warehouse: true }
    });
    return {
      id: created.id,
      warehouseId: created.warehouseId,
      warehouseName: created.warehouse.name,
      warehouseCode: created.warehouse.shortCode,
      name: created.name,
      shortCode: created.shortCode,
      createdAt: created.createdAt.toISOString()
    };
  } catch (err: any) {
    if (err.message.includes('already exists')) throw err;
    // Fallback
    const parent = IN_MEMORY_WAREHOUSES.find(w => w.id === data.warehouseId);
    if (!parent) throw new Error('Warehouse not found');

    const newLoc: LocationRecord = {
      id: `loc-${Date.now()}`,
      warehouseId: data.warehouseId,
      warehouseName: parent.name,
      warehouseCode: parent.shortCode,
      name: data.name,
      shortCode: data.shortCode,
      createdAt: new Date().toISOString()
    };
    IN_MEMORY_LOCATIONS.push(newLoc);
    parent.locationCount++;
    return newLoc;
  }
}

export async function updateLocation(id: string, data: { name?: string }) {
  try {
    const updated = await prisma.location.update({
      where: { id },
      data: { name: data.name },
      include: { warehouse: true }
    });
    return {
      id: updated.id,
      warehouseId: updated.warehouseId,
      warehouseName: updated.warehouse.name,
      warehouseCode: updated.warehouse.shortCode,
      name: updated.name,
      shortCode: updated.shortCode,
      createdAt: updated.createdAt.toISOString()
    };
  } catch {
    const loc = IN_MEMORY_LOCATIONS.find(l => l.id === id);
    if (!loc) throw new Error('Location not found');
    if (data.name) loc.name = data.name;
    return loc;
  }
}

export async function deleteLocation(id: string) {
  try {
    await prisma.location.delete({ where: { id } });
  } catch {
    const idx = IN_MEMORY_LOCATIONS.findIndex(l => l.id === id);
    if (idx === -1) throw new Error('Location not found');
    const warehouseId = IN_MEMORY_LOCATIONS[idx].warehouseId;
    IN_MEMORY_LOCATIONS.splice(idx, 1);
    const parent = IN_MEMORY_WAREHOUSES.find(w => w.id === warehouseId);
    if (parent && parent.locationCount > 0) parent.locationCount--;
  }
}
