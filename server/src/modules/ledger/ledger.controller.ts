import { Request, Response } from 'express';
import { getLedgerEntries, getLedgerStats } from './ledger.service';

export async function getLedger(req: Request, res: Response) {
  try {
    const { search, moveType, status } = req.query as Record<string, string>;
    const entries = await getLedgerEntries({ search, moveType, status });
    res.json({ success: true, message: 'Stock ledger retrieved', data: entries });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch ledger' });
  }
}

export async function getLedgerKPIs(req: Request, res: Response) {
  try {
    const stats = await getLedgerStats();
    res.json({ success: true, message: 'Ledger KPIs retrieved', data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch ledger stats' });
  }
}
