import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';

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

// Module 1: Auth & Access Control
app.use('/api/auth', authRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

export default app;
