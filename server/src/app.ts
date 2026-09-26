import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import productRoutes from './modules/products/product.routes';
import receiptsRoutes from './modules/receipts/receipts.routes';
import fulfillmentRoutes from './modules/fulfillment/fulfillment.routes';
import ledgerRoutes from './modules/ledger/ledger.routes';
import warehouseRoutes from './modules/warehouse/warehouse.routes';

const app: Application = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    system: 'StockSense IMS',
    timestamp: new Date().toISOString()
  });
});

// Auth & Access Control
app.use('/api/auth', authRoutes);

// Command Center Dashboard & Operational Intelligence
app.use('/api/dashboard', dashboardRoutes);

// Master Catalog & Live Multi-Location Stock Engine
app.use('/api/products', productRoutes);

// Inbound Operations (Vendor Receipts)
app.use('/api/receipts', receiptsRoutes);

// Fulfillment Engine (Deliveries, Internal Transfers, Stock Adjustments)
app.use('/api/fulfillment', fulfillmentRoutes);

// Module 6: Unified Stock Ledger (Move History / Audit Trail)
app.use('/api/ledger', ledgerRoutes);

// Module 6: Warehouse & Location Spatial Hierarchy
app.use('/api/settings', warehouseRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

export default app;
