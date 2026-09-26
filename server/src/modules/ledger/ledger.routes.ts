import { Router } from 'express';
import { getLedger, getLedgerKPIs } from './ledger.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/ledger  — full move history with optional filters
router.get('/', authenticateToken, getLedger);

// GET /api/ledger/kpis — summary stats (total moves, by type, total qty)
router.get('/kpis', authenticateToken, getLedgerKPIs);

export default router;
