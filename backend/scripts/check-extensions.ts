import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const ext: any = await prisma.$queryRaw`
    SELECT extname, extversion FROM pg_extension WHERE extname IN ('vector', 'pg_trgm');
  `;
  console.log('Installed extensions:', ext);
}

check().catch(console.error).finally(() => prisma.$disconnect());

