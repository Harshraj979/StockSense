import { Request, Response, NextFunction } from 'express';
import * as receiptsService from './receipts.service';

export async function getReceiptsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, status } = req.query;
    const receipts = await receiptsService.getAllReceipts(
      search as string | undefined,
      status as string | undefined
    );
    res.status(200).json({
      success: true,
      count: receipts.length,
      data: receipts
    });
  } catch (err) {
    next(err);
  }
}

export async function getReceiptByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const receipt = await receiptsService.getReceiptById(id);
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }
    res.status(200).json({
      success: true,
      data: receipt
    });
  } catch (err) {
    next(err);
  }
}

export async function createReceiptHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { partnerContact, sourceLocation, destLocation, scheduleDate, responsibleName, lines } = req.body;
    if (!partnerContact || !scheduleDate) {
      return res.status(400).json({
        success: false,
        message: 'partnerContact (Receive From) and scheduleDate are required'
      });
    }

    const receipt = await receiptsService.createReceipt({
      partnerContact,
      sourceLocation,
      destLocation,
      scheduleDate,
      responsibleName,
      lines: lines || []
    });

    res.status(201).json({
      success: true,
      message: 'Inbound receipt created successfully',
      data: receipt
    });
  } catch (err) {
    next(err);
  }
}

export async function updateStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    if (!['DRAFT', 'READY', 'DONE'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: DRAFT, READY, DONE'
      });
    }

    const updated = await receiptsService.updateReceiptStatus(id, status);
    res.status(200).json({
      success: true,
      message: `Receipt status updated to ${status}`,
      data: updated
    });
  } catch (err: any) {
    if (err.message === 'Receipt not found') {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
}

export async function dockAcceptanceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { targetLocation } = req.body;
    if (!targetLocation) {
      return res.status(400).json({
        success: false,
        message: 'targetLocation is required for dock acceptance (e.g. WH/Stock1, WH/Stock2)'
      });
    }

    const updated = await receiptsService.performDockAcceptance(id, targetLocation);
    res.status(200).json({
      success: true,
      message: `Receipt validated and stock accepted into ${targetLocation}`,
      data: updated
    });
  } catch (err: any) {
    if (err.message === 'Receipt not found') {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
}

export async function getGRNHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const grn = await receiptsService.getReceiptGRN(id);
    res.status(200).json({
      success: true,
      data: grn
    });
  } catch (err: any) {
    if (err.statusCode === 403) {
      return res.status(403).json({
        success: false,
        message: err.message
      });
    }
    if (err.message === 'Receipt not found') {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
}
