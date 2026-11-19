import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectStorage() {
  const buckets = await prisma.$queryRawUnsafe(`
    SELECT id, name, public, avif_autodetection, file_size_limit, allowed_mime_types 
    FROM storage.buckets;
  `);
  console.table(buckets);

  const storagePolicies = await prisma.$queryRawUnsafe(`
    SELECT policyname, permissive, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects';
  `);
  console.log('STORAGE OBJECT POLICIES:');
  console.table(storagePolicies);

  await prisma.$disconnect();
}

inspectStorage();

