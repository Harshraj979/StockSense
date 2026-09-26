import { Request, Response } from 'express';
import { ProductService } from './product.service';
import { createProductSchema, updateProductSchema, updateStockSchema } from './product.validation';

export class ProductController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const category = req.query.category as string | undefined;
      const lowStock = req.query.lowStock === 'true';

      const products = await ProductService.getAllProducts({ search, category, lowStock });
      res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        data: products
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error fetching products'
      });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const product = await ProductService.getProductById(id);
      res.status(200).json({
        success: true,
        message: 'Product retrieved successfully',
        data: product
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Product not found'
      });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const parsed = createProductSchema.safeParse(req.body);
      if (!parsed.success) {
        const errorMsg = parsed.error.issues.map((i) => i.message).join('. ');
        res.status(400).json({ success: false, message: errorMsg });
        return;
      }

      const product = await ProductService.createProduct(parsed.data);
      res.status(201).json({
        success: true,
        message: `Product "${product.name}" created successfully in catalog`,
        data: product
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error creating product'
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const parsed = updateProductSchema.safeParse(req.body);
      if (!parsed.success) {
        const errorMsg = parsed.error.issues.map((i) => i.message).join('. ');
        res.status(400).json({ success: false, message: errorMsg });
        return;
      }

      const product = await ProductService.updateProduct(id, parsed.data);
      res.status(200).json({
        success: true,
        message: 'Product master updated successfully',
        data: product
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error updating product'
      });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await ProductService.deleteProduct(id);
      res.status(200).json({
        success: true,
        message: `Product "${result.name}" deleted successfully`,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error deleting product'
      });
    }
  }

  /**
   * Direct Inline Update of Stock Quantities
   */
  static async updateStock(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const parsed = updateStockSchema.safeParse(req.body);
      if (!parsed.success) {
        const errorMsg = parsed.error.issues.map((i) => i.message).join('. ');
        res.status(400).json({ success: false, message: errorMsg });
        return;
      }

      const userLoginId = req.user?.loginId || 'Manager';
      const result = await ProductService.updateStock(id, parsed.data, userLoginId);

      res.status(200).json({
        success: true,
        message: `Stock updated: ${result.newOnHand} on hand (${result.newFreeToUse} free to use)`,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error updating stock'
      });
    }
  }
}
