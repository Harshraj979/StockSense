import { Router } from 'express';
import {
  getDeliveriesHandler,
  getDeliveryByIdHandler,
  createDeliveryHandler,
  updateDeliveryStatusHandler,
  getSmartPickingRouteHandler,
  getInternalTransfersHandler,
  createInternalTransferHandler,
  updateTransferStatusHandler,
  getAdjustmentsHandler,
  createAdjustmentHandler
} from './fulfillment.controller';

const router = Router();

// Deliveries (Outgoing Goods)
router.get('/deliveries', getDeliveriesHandler);
router.get('/deliveries/:id', getDeliveryByIdHandler);
router.post('/deliveries', createDeliveryHandler);
router.put('/deliveries/:id/status', updateDeliveryStatusHandler);
router.get('/deliveries/:id/picking-route', getSmartPickingRouteHandler);

// Internal Transfers
router.get('/transfers', getInternalTransfersHandler);
router.post('/transfers', createInternalTransferHandler);
router.put('/transfers/:id/status', updateTransferStatusHandler);

// Stock Adjustments
router.get('/adjustments', getAdjustmentsHandler);
router.post('/adjustments', createAdjustmentHandler);

export default router;
