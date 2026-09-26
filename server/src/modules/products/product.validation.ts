import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  sku: z.string().min(2, 'SKU / Code must be at least 2 characters').toUpperCase(),
  category: z.string().min(2, 'Category is required'),
  uom: z.string().default('Units'),
  unitCost: z.number().min(0, 'Unit cost must be a positive number'),
  initialStock: z.number().min(0, 'Initial stock cannot be negative').default(0),
  locationShortCode: z.string().optional().default('WH/Stock1'),
  reorderMin: z.number().min(0).default(10),
  reorderMax: z.number().min(0).default(100)
}).refine(data => data.reorderMax >= data.reorderMin, {
  message: 'Reorder Max threshold must be greater than or equal to Reorder Min',
  path: ['reorderMax']
});

export const updateProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').optional(),
  sku: z.string().min(2, 'SKU / Code must be at least 2 characters').toUpperCase().optional(),
  category: z.string().min(2, 'Category is required').optional(),
  uom: z.string().optional(),
  unitCost: z.number().min(0, 'Unit cost must be positive').optional(),
  reorderMin: z.number().min(0).optional(),
  reorderMax: z.number().min(0).optional()
});

export const updateStockSchema = z.object({
  onHand: z.number().min(0, 'On-hand quantity cannot be negative'),
  locationShortCode: z.string().optional(),
  reason: z.string().optional().default('Direct Physical Adjustment')
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
