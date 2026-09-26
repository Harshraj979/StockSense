import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database successfully.');
  } catch (error) {
    console.warn('⚠️ Database connection warning: PostgreSQL is not active or DATABASE_URL is unset. Operating in fallback mock mode.', (error as any).message);
  }
}
