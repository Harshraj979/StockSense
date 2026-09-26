import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB, prisma } from './config/db';
import bcrypt from 'bcryptjs';

const PORT = process.env.PORT || 5000;

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
