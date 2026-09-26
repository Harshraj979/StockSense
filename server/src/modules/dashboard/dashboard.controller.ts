import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';

export class DashboardController {
  static async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const summary = await DashboardService.getSummaryMetrics();
      res.status(200).json({
        success: true,
        message: 'Dashboard metrics retrieved successfully.',
        data: summary
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch dashboard metrics.'
      });
    }
  }

  static async getOperations(req: Request, res: Response): Promise<void> {
    try {
      const { type, status, warehouse, category, search } = req.query;
      const operations = await DashboardService.getOperations({
        type: type as string,
        status: status as string,
        warehouse: warehouse as string,
        category: category as string,
        search: search as string
      });

      res.status(200).json({
        success: true,
        message: 'Operations fetched successfully.',
        data: operations
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch operations.'
      });
    }
  }

  static async getBottleneckTelemetry(req: Request, res: Response): Promise<void> {
    try {
      const telemetry = await DashboardService.getBottleneckTelemetry();
      res.status(200).json({
        success: true,
        message: 'Bottleneck telemetry fetched successfully.',
        data: telemetry
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch bottleneck telemetry.'
      });
    }
  }

  static async getFilterOptions(req: Request, res: Response): Promise<void> {
    try {
      const options = await DashboardService.getFilterOptions();
      res.status(200).json({
        success: true,
        message: 'Filter options fetched successfully.',
        data: options
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch filter options.'
      });
    }
  }
}
