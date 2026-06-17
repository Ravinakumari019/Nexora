import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient Singleton
 *
 * In development, Next.js HMR causes modules to reload frequently.
 * Without a singleton, each reload creates a new PrismaClient, exhausting
 * the database connection pool. We store the client on `globalThis` to
 * persist it across hot reloads.
 *
 * In production, a single module-level instance is sufficient.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Uncomment for query debugging:
    // log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

