import { Router } from 'express';
import {
  getReceiptsHandler,
  getReceiptByIdHandler,
  createReceiptHandler,
  updateStatusHandler,
  dockAcceptanceHandler,
  getGRNHandler
} from './receipts.controller';

const router = Router();

router.get('/', getReceiptsHandler);
router.get('/:id', getReceiptByIdHandler);
router.post('/', createReceiptHandler);
router.put('/:id/status', updateStatusHandler);
router.post('/:id/dock-accept', dockAcceptanceHandler);
router.get('/:id/grn', getGRNHandler);

export default router;
