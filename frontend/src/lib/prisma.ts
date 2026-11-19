import { PrismaClient } from '@prisma/client';

const SUPABASE_DB_URL = "postgresql://postgres:ISML_RESOURCE_BOT@db.daylcznvgehfifsxzqvh.supabase.co:5432/postgres?sslmode=require";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = SUPABASE_DB_URL;
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || SUPABASE_DB_URL,
        },
      },
      log: ['error', 'warn'],
    });
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    return (client as any)[prop];
  },
});
