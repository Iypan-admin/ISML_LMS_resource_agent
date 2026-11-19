import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const buckets = await prisma.$queryRawUnsafe(`SELECT id, name, public FROM storage.buckets;`);
    console.log('Existing Supabase storage buckets:', buckets);

    // Ensure 'isml-knowledge-vault' bucket exists
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES ('isml-knowledge-vault', 'isml-knowledge-vault', false, 104857600, null)
      ON CONFLICT (id) DO NOTHING;
    `);

    const updatedBuckets = await prisma.$queryRawUnsafe(`SELECT id, name, public FROM storage.buckets;`);
    console.log('Updated Supabase storage buckets:', updatedBuckets);
  } catch (err: any) {
    console.error('Error with storage buckets:', err.message);
  }
}

main().finally(() => prisma.$disconnect());

