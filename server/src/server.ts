import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB, prisma } from './config/db';
import bcrypt from 'bcryptjs';

const PORT = process.env.PORT || 5001;

async function seedInitialData() {
  try {
    // Check if demo manager exists
    const managerCount = await prisma.user.count({ where: { loginId: 'manager01' } });
    if (managerCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Manager@123', salt);
      await prisma.user.create({
        data: {
          loginId: 'manager01',
          email: 'manager@stocksense.io',
          name: 'Chief Inventory Manager',
          role: 'MANAGER',
          passwordHash: hashedPassword
        }
      });
      console.log('🌱 Seeded default Manager: manager01 / Manager@123');
    }

    // Check if demo staff exists
    const staffCount = await prisma.user.count({ where: { loginId: 'warehouse01' } });
    if (staffCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Staff@123', salt);
      await prisma.user.create({
        data: {
          loginId: 'warehouse01',
          email: 'staff@stocksense.io',
          name: 'Warehouse Operations Staff',
          role: 'STAFF',
          passwordHash: hashedPassword
        }
      });
      console.log('🌱 Seeded default Staff: warehouse01 / Staff@123');
    }

    // Check and seed default Warehouse and Locations
    let warehouse = await prisma.warehouse.findUnique({ where: { shortCode: 'WH' } });
    if (!warehouse) {
      warehouse = await prisma.warehouse.create({
        data: {
          name: 'Main Central Warehouse',
          shortCode: 'WH',
          address: 'Building 4, Logistics Park, Sector 62'
        }
      });
      console.log('🌱 Seeded default Warehouse: WH');
    }

    let loc1 = await prisma.location.findFirst({
      where: { warehouseId: warehouse.id, shortCode: 'WH/Stock1' }
    });
    if (!loc1) {
      loc1 = await prisma.location.create({
        data: {
          name: 'Warehouse Stock Zone 1',
          shortCode: 'WH/Stock1',
          warehouseId: warehouse.id
        }
      });
      console.log('🌱 Seeded Location: WH/Stock1');
    }

    let loc2 = await prisma.location.findFirst({
      where: { warehouseId: warehouse.id, shortCode: 'WH/Stock2' }
    });
    if (!loc2) {
      loc2 = await prisma.location.create({
        data: {
          name: 'Warehouse Stock Zone 2',
          shortCode: 'WH/Stock2',
          warehouseId: warehouse.id
        }
      });
      console.log('🌱 Seeded Location: WH/Stock2');
    }

    // Seed Demo Products for Module 3
    const productCount = await prisma.product.count();
    if (productCount === 0) {
      const demoProducts = [
        {
          name: 'Steel Rods (12mm TMT)',
          sku: 'PRD-STL-001',
          category: 'Raw Materials',
          uom: 'kg',
          unitCost: 450,
          onHand: 50,
          reserved: 10,
          reorderMin: 15,
          reorderMax: 100,
          locationId: loc1.id
        },
        {
          name: 'Ergonomic Mesh Chair',
          sku: 'PRD-CHR-002',
          category: 'Furniture',
          uom: 'Units',
          unitCost: 3200,
          onHand: 24,
          reserved: 4,
          reorderMin: 8,
          reorderMax: 50,
          locationId: loc1.id
        },
        {
          name: 'Industrial Optical Sensor',
          sku: 'PRD-SNS-003',
          category: 'Electronics',
          uom: 'Units',
          unitCost: 1850,
          onHand: 12,
          reserved: 6,
          reorderMin: 10,
          reorderMax: 60,
          locationId: loc2.id
        },
        {
          name: 'Aluminum Sheet 2mm (4x8ft)',
          sku: 'PRD-ALU-004',
          category: 'Raw Materials',
          uom: 'Sheets',
          unitCost: 2100,
          onHand: 6,
          reserved: 5,
          reorderMin: 12,
          reorderMax: 40,
          locationId: loc1.id
        },
        {
          name: 'Heavy-Duty Wooden Pallets',
          sku: 'PRD-PLT-005',
          category: 'Packaging',
          uom: 'Units',
          unitCost: 650,
          onHand: 80,
          reserved: 0,
          reorderMin: 20,
          reorderMax: 150,
          locationId: loc2.id
        },
        {
          name: 'High-Torque Electric Motor 1HP',
          sku: 'PRD-MTR-006',
          category: 'Components',
          uom: 'Units',
          unitCost: 5400,
          onHand: 3,
          reserved: 3,
          reorderMin: 5,
          reorderMax: 25,
          locationId: loc1.id
        }
      ];

      for (const item of demoProducts) {
        await prisma.product.create({
          data: {
            name: item.name,
            sku: item.sku,
            category: item.category,
            uom: item.uom,
            unitCost: item.unitCost,
            reorderMin: item.reorderMin,
            reorderMax: item.reorderMax,
            stockLevels: {
              create: {
                locationId: item.locationId,
                onHand: item.onHand,
                reserved: item.reserved
              }
            }
          }
        });
      }
      console.log(`🌱 Seeded ${demoProducts.length} demo products for Module 3.`);
    }
  } catch (error) {
    console.error('Warning during initial seed:', error);
  }
}

async function startServer() {
  await connectDB();
  await seedInitialData();

  app.listen(PORT, () => {
    console.log(`🚀 StockSense Backend Server running on http://localhost:${PORT}`);
  });
}

startServer();
