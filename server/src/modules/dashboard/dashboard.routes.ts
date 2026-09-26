import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

// Protect all dashboard routes with authentication middleware
router.use(authenticateToken);

router.get('/summary', DashboardController.getSummary);
router.get('/operations', DashboardController.getOperations);
router.get('/bottlenecks', DashboardController.getBottleneckTelemetry);
router.get('/filters', DashboardController.getFilterOptions);

export default router;
