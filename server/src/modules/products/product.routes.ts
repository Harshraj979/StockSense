import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// Retrieve all products (Stock View) - Accessible by all authenticated team members
router.get('/', authenticateToken, ProductController.getAll);

// Retrieve single product details
router.get('/:id', authenticateToken, ProductController.getById);

// Create new product (Product Master Setup) - Restricted to MANAGER
router.post('/', authenticateToken, requireRole(['MANAGER']), ProductController.create);

// Update product master data - Restricted to MANAGER
router.put('/:id', authenticateToken, requireRole(['MANAGER']), ProductController.update);

// Delete product from catalog - Restricted to MANAGER
router.delete('/:id', authenticateToken, requireRole(['MANAGER']), ProductController.delete);

// Direct Inline Stock Adjustment - Accessible by both MANAGER & STAFF (audit logged)
router.patch('/:id/stock', authenticateToken, ProductController.updateStock);

export default router;
