import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const all = await prisma.resource.findMany({
    include: { language: true }
  });
  console.log('TOTAL RESOURCES IN DB:', all.length);
  const counts: Record<string, number> = {};
  all.forEach(r => {
    const name = r.language?.name || 'UNKNOWN';
    counts[name] = (counts[name] || 0) + 1;
  });
  console.log('COUNTS BY LANGUAGE:', counts);

  const allLangs = await prisma.language.findMany();
  console.log('ALL LANGUAGES IN DB:', allLangs);
}

main().finally(() => prisma.$disconnect());
