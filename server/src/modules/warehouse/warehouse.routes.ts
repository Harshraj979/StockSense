import { Router } from 'express';
import {
  listWarehouses,
  addWarehouse,
  editWarehouse,
  removeWarehouse,
  listLocations,
  addLocation,
  editLocation,
  removeLocation
} from './warehouse.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

// Warehouse endpoints
router.get('/warehouses', authenticateToken, listWarehouses);
router.post('/warehouses', authenticateToken, addWarehouse);
router.put('/warehouses/:id', authenticateToken, editWarehouse);
router.delete('/warehouses/:id', authenticateToken, removeWarehouse);

// Location endpoints
router.get('/locations', authenticateToken, listLocations);
router.post('/locations', authenticateToken, addLocation);
router.put('/locations/:id', authenticateToken, editLocation);
router.delete('/locations/:id', authenticateToken, removeLocation);

export default router;
