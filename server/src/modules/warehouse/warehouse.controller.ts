import { Request, Response } from 'express';
import {
  getAllWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation
} from './warehouse.service';

// ─── Warehouses ────────────────────────────────────────────────────────────────

export async function listWarehouses(req: Request, res: Response) {
  try {
    const data = await getAllWarehouses();
    res.json({ success: true, message: 'Warehouses retrieved', data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function addWarehouse(req: Request, res: Response) {
  try {
    const { name, shortCode, address } = req.body;
    if (!name || !shortCode) {
      return res.status(400).json({ success: false, message: 'Name and Short Code are required' });
    }
    const data = await createWarehouse({ name, shortCode, address });
    res.status(201).json({ success: true, message: `Warehouse "${name}" created successfully`, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function editWarehouse(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { name, address } = req.body;
    const data = await updateWarehouse(id, { name, address });
    res.json({ success: true, message: 'Warehouse updated', data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function removeWarehouse(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await deleteWarehouse(id);
    res.json({ success: true, message: 'Warehouse deleted', data: { id } });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// ─── Locations ─────────────────────────────────────────────────────────────────

export async function listLocations(req: Request, res: Response) {
  try {
    const { warehouseId } = req.query as Record<string, string>;
    const data = await getAllLocations(warehouseId);
    res.json({ success: true, message: 'Locations retrieved', data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function addLocation(req: Request, res: Response) {
  try {
    const { warehouseId, name, shortCode } = req.body;
    if (!warehouseId || !name || !shortCode) {
      return res.status(400).json({ success: false, message: 'warehouseId, name, and shortCode are required' });
    }
    const data = await createLocation({ warehouseId, name, shortCode });
    res.status(201).json({ success: true, message: `Location "${shortCode}" created`, data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function editLocation(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { name } = req.body;
    const data = await updateLocation(id, { name });
    res.json({ success: true, message: 'Location updated', data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function removeLocation(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await deleteLocation(id);
    res.json({ success: true, message: 'Location deleted', data: { id } });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}
