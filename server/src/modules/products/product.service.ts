import { prisma } from '../../config/db';
import { CreateProductInput, UpdateProductInput, UpdateStockInput } from './product.validation';

export class ProductService {
  /**
   * Ensure default warehouse and locations exist
   */
  private static async getOrCreateDefaultLocation(shortCode = 'WH/Stock1') {
    let warehouse = await prisma.warehouse.findUnique({
      where: { shortCode: 'WH' }
    });

    if (!warehouse) {
      warehouse = await prisma.warehouse.create({
        data: {
          name: 'Main Central Warehouse',
          shortCode: 'WH',
          address: 'Building 4, Logistics Park, Sector 62'
        }
      });
    }

    let location = await prisma.location.findFirst({
      where: { warehouseId: warehouse.id, shortCode }
    });

    if (!location) {
      location = await prisma.location.create({
        data: {
          name: shortCode === 'WH/Stock1' ? 'Warehouse Stock Zone 1' : 'Warehouse Stock Zone 2',
          shortCode,
          warehouseId: warehouse.id
        }
      });
    }

    return location;
  }

  /**
   * Get all products with aggregated stock counts and allocation shield metrics
   */
  static async getAllProducts(query: { search?: string; category?: string; lowStock?: boolean }) {
    const whereClause: any = {};

    if (query.search) {
      whereClause.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    if (query.category && query.category !== 'All') {
      whereClause.category = query.category;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        stockLevels: {
          include: {
            location: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const enrichedProducts = products.map((prod) => {
      const onHand = prod.stockLevels.reduce((sum, sl) => sum + sl.onHand, 0);
      const reserved = prod.stockLevels.reduce((sum, sl) => sum + sl.reserved, 0);
      const freeToUse = Math.max(0, onHand - reserved);
      const totalValuation = onHand * prod.unitCost;
      const isLowStock = onHand <= prod.reorderMin;
      const isCritical = onHand === 0;

      return {
        ...prod,
        onHand,
        reserved,
        freeToUse,
        totalValuation,
        isLowStock,
        isCritical
      };
    });

    if (query.lowStock) {
      return enrichedProducts.filter((p) => p.isLowStock);
    }

    return enrichedProducts;
  }

  /**
   * Get single product by ID with full location breakdown
   */
  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockLevels: {
          include: { location: true }
        }
      }
    });

    if (!product) {
      throw new Error(`Product with ID "${id}" not found.`);
    }

    const onHand = product.stockLevels.reduce((sum, sl) => sum + sl.onHand, 0);
    const reserved = product.stockLevels.reduce((sum, sl) => sum + sl.reserved, 0);
    const freeToUse = Math.max(0, onHand - reserved);

    return {
      ...product,
      onHand,
      reserved,
      freeToUse,
      totalValuation: onHand * product.unitCost
    };
  }

  /**
   * Create new product in catalog (Product Master Setup)
   */
  static async createProduct(input: CreateProductInput) {
    const existing = await prisma.product.findUnique({
      where: { sku: input.sku.toUpperCase() }
    });

    if (existing) {
      throw new Error(`A product with SKU "${input.sku.toUpperCase()}" already exists.`);
    }

    const defaultLoc = await this.getOrCreateDefaultLocation(input.locationShortCode || 'WH/Stock1');

    const product = await prisma.product.create({
      data: {
        name: input.name,
        sku: input.sku.toUpperCase(),
        category: input.category,
        uom: input.uom,
        unitCost: input.unitCost,
        reorderMin: input.reorderMin,
        reorderMax: input.reorderMax,
        stockLevels: {
          create: {
            locationId: defaultLoc.id,
            onHand: input.initialStock,
            reserved: 0
          }
        }
      },
      include: {
        stockLevels: {
          include: { location: true }
        }
      }
    });

    // If initial stock > 0, log opening balance in ledger
    if (input.initialStock > 0) {
      await prisma.stockLedger.create({
        data: {
          reference: `INIT/${product.sku}`,
          contact: 'Initial Opening Balance',
          fromLocation: 'VENDORS/Opening',
          toLocation: defaultLoc.shortCode,
          productId: product.id,
          productName: product.name,
          quantity: input.initialStock,
          status: 'DONE',
          moveType: 'IN'
        }
      });
    }

    const onHand = input.initialStock;
    const reserved = 0;
    const freeToUse = onHand - reserved;

    return {
      ...product,
      onHand,
      reserved,
      freeToUse,
      totalValuation: onHand * product.unitCost
    };
  }

  /**
   * Update product metadata (Product Master)
   */
  static async updateProduct(id: string, input: UpdateProductInput) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new Error(`Product not found.`);
    }

    if (input.sku && input.sku.toUpperCase() !== product.sku) {
      const existing = await prisma.product.findUnique({
        where: { sku: input.sku.toUpperCase() }
      });
      if (existing) {
        throw new Error(`SKU "${input.sku.toUpperCase()}" is already assigned to another product.`);
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.sku && { sku: input.sku.toUpperCase() }),
        ...(input.category && { category: input.category }),
        ...(input.uom && { uom: input.uom }),
        ...(input.unitCost !== undefined && { unitCost: input.unitCost }),
        ...(input.reorderMin !== undefined && { reorderMin: input.reorderMin }),
        ...(input.reorderMax !== undefined && { reorderMax: input.reorderMax })
      },
      include: {
        stockLevels: {
          include: { location: true }
        }
      }
    });

    const onHand = updated.stockLevels.reduce((sum, sl) => sum + sl.onHand, 0);
    const reserved = updated.stockLevels.reduce((sum, sl) => sum + sl.reserved, 0);
    const freeToUse = Math.max(0, onHand - reserved);

    return {
      ...updated,
      onHand,
      reserved,
      freeToUse,
      totalValuation: onHand * updated.unitCost
    };
  }

  /**
   * Delete product
   */
  static async deleteProduct(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new Error('Product not found.');
    }

    await prisma.product.delete({ where: { id } });
    return { id, name: product.name };
  }

  /**
   * Direct Inline Update of Stock Quantities
   * Instantly recalculates balances: Free to Use = On Hand - Reserved
   * Logs an entry in the double-entry StockLedger
   */
  static async updateStock(id: string, input: UpdateStockInput, userLoginId = 'System') {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockLevels: {
          include: { location: true }
        }
      }
    });

    if (!product) {
      throw new Error(`Product not found.`);
    }

    let targetLocation = product.stockLevels[0]?.location;
    if (!targetLocation) {
      targetLocation = await this.getOrCreateDefaultLocation(input.locationShortCode || 'WH/Stock1');
    }

    const stockLevel = product.stockLevels.find(
      (sl) => sl.locationId === targetLocation.id
    );

    const oldOnHand = stockLevel ? stockLevel.onHand : 0;
    const reserved = stockLevel ? stockLevel.reserved : 0;
    const diff = input.onHand - oldOnHand;

    if (stockLevel) {
      await prisma.stockLevel.update({
        where: { id: stockLevel.id },
        data: { onHand: input.onHand }
      });
    } else {
      await prisma.stockLevel.create({
        data: {
          productId: product.id,
          locationId: targetLocation.id,
          onHand: input.onHand,
          reserved: 0
        }
      });
    }

    // Double-entry ledger audit record
    if (diff !== 0) {
      const isPositive = diff > 0;
      await prisma.stockLedger.create({
        data: {
          reference: `ADJ/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
          contact: `${userLoginId} (${input.reason || 'Inline Adjustment'})`,
          fromLocation: isPositive ? 'INVENTORY/Adjustment' : targetLocation.shortCode,
          toLocation: isPositive ? targetLocation.shortCode : 'INVENTORY/Scrap',
          productId: product.id,
          productName: product.name,
          quantity: Math.abs(diff),
          status: 'DONE',
          moveType: isPositive ? 'IN' : 'OUT'
        }
      });
    }

    const newFreeToUse = Math.max(0, input.onHand - reserved);

    return {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      location: targetLocation.shortCode,
      oldOnHand,
      newOnHand: input.onHand,
      reserved,
      newFreeToUse,
      difference: diff,
      unitCost: product.unitCost,
      totalValuation: input.onHand * product.unitCost
    };
  }
}
