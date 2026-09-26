import { Request, Response, NextFunction } from 'express';
import * as fulfillmentService from './fulfillment.service';

// Deliveries
export async function getDeliveriesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, status } = req.query;
    const deliveries = await fulfillmentService.getAllDeliveries(
      search as string | undefined,
      status as string | undefined
    );
    res.status(200).json({
      success: true,
      count: deliveries.length,
      data: deliveries
    });
  } catch (err) {
    next(err);
  }
}

export async function getDeliveryByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const delivery = await fulfillmentService.getDeliveryById(id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery order not found' });
    }
    res.status(200).json({ success: true, data: delivery });
  } catch (err) {
    next(err);
  }
}

export async function createDeliveryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { partnerContact, deliveryAddress, scheduleDate, responsibleName, lines } = req.body;
    if (!partnerContact || !deliveryAddress || !scheduleDate) {
      return res.status(400).json({
        success: false,
        message: 'partnerContact, deliveryAddress, and scheduleDate are required'
      });
    }

    const delivery = await fulfillmentService.createDelivery({
      partnerContact,
      deliveryAddress,
      scheduleDate,
      responsibleName,
      lines: lines || []
    });

    res.status(201).json({
      success: true,
      message: 'Delivery order created successfully',
      data: delivery
    });
  } catch (err) {
    next(err);
  }
}

export async function updateDeliveryStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    if (!['DRAFT', 'WAITING', 'READY', 'DONE'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: DRAFT, WAITING, READY, DONE'
      });
    }

    const result = await fulfillmentService.updateDeliveryStatus(id, status);
    res.status(200).json({
      success: true,
      message: result.warning || `Delivery order status updated to ${status}`,
      data: result.delivery
    });
  } catch (err: any) {
    if (err.message === 'Delivery order not found') {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
}

export async function getSmartPickingRouteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const routeData = await fulfillmentService.getSmartPickingRoute(id);
    res.status(200).json({
      success: true,
      data: routeData
    });
  } catch (err: any) {
    if (err.message === 'Delivery order not found') {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
}

// Internal Transfers
export async function getInternalTransfersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const transfers = await fulfillmentService.getAllInternalTransfers();
    res.status(200).json({ success: true, data: transfers });
  } catch (err) {
    next(err);
  }
}

export async function createInternalTransferHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { sourceLocation, destLocation, scheduleDate, responsibleName, lines } = req.body;
    if (!sourceLocation || !destLocation || !scheduleDate) {
      return res.status(400).json({
        success: false,
        message: 'sourceLocation, destLocation, and scheduleDate are required'
      });
    }

    const transfer = await fulfillmentService.createInternalTransfer({
      sourceLocation,
      destLocation,
      scheduleDate,
      responsibleName,
      lines: lines || []
    });

    res.status(201).json({
      success: true,
      message: 'Internal stock transfer created successfully',
      data: transfer
    });
  } catch (err) {
    next(err);
  }
}

export async function updateTransferStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const updated = await fulfillmentService.updateTransferStatus(id, status);
    res.status(200).json({ success: true, message: `Transfer status updated to ${status}`, data: updated });
  } catch (err: any) {
    if (err.message === 'Internal transfer not found') {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
}

// Stock Adjustments
export async function getAdjustmentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const adjustments = await fulfillmentService.getAllAdjustments();
    res.status(200).json({ success: true, data: adjustments });
  } catch (err) {
    next(err);
  }
}

export async function createAdjustmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { location, productName, sku, recordedQty, countedQty, reasonTag, responsibleName } = req.body;
    if (!location || !productName || recordedQty === undefined || countedQty === undefined || !reasonTag) {
      return res.status(400).json({
        success: false,
        message: 'location, productName, recordedQty, countedQty, and reasonTag are required'
      });
    }

    const adjustment = await fulfillmentService.createStockAdjustment({
      location,
      productName,
      sku,
      recordedQty: Number(recordedQty),
      countedQty: Number(countedQty),
      reasonTag,
      responsibleName
    });

    res.status(201).json({
      success: true,
      message: 'Stock adjustment logged and ledger re-aligned',
      data: adjustment
    });
  } catch (err) {
    next(err);
  }
}
