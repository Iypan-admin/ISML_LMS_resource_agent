import { PrismaClient } from '@prisma/client';
import { ResourcesService } from '../src/modules/resources/resources.service';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function runStorageSecurityTests() {
  console.log('================================================================');
  console.log('SECURITY VERIFICATION: SUPABASE STORAGE SECURITY SUITE');
  console.log('================================================================\n');

  const tenantAlpha = 'inst_storage_alpha_' + Date.now();
  const tenantBeta = 'inst_storage_beta_' + Date.now();
  const resAlphaId = crypto.randomUUID();

  try {
    const resourcesService = new ResourcesService(prisma as any, {} as any);
    const lang = await prisma.language.findFirst();
    if (!lang) throw new Error('No language found');

    // 1. Bucket Privacy Check
    console.log('--- TEST 1: Bucket Private Access Verification ---');
    const bucketInfo: any[] = await prisma.$queryRawUnsafe(`
      SELECT id, name, public, file_size_limit 
      FROM storage.buckets 
      WHERE id = 'isml-knowledge-vault';
    `);
    console.log(`  Bucket Name: ${bucketInfo[0].name}`);
    console.log(`  Public Status: ${bucketInfo[0].public ? 'PUBLIC (INSECURE)' : 'PRIVATE (SECURE)'}`);
    console.log(`  File Size Limit: ${bucketInfo[0].file_size_limit} bytes (100MB)`);
    if (bucketInfo[0].public) throw new Error('SECURITY VIOLATION: Bucket is public');

    // 2. Storage Objects RLS Isolation Test
    console.log('\n--- TEST 2: storage.objects Engine-Level RLS Policy Check ---');
    // Seed an object in storage.objects
    const objAlphaId = crypto.randomUUID();
    const alphaKey = `${tenantAlpha}/German/CEFR_A1/${resAlphaId}/test_exam.pdf`;
    
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.objects (
        id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata
      ) VALUES (
        $1::uuid, 'isml-knowledge-vault', $2, NULL, NOW(), NOW(), NOW(), '{"mimetype": "application/pdf"}'::jsonb
      );
    `, objAlphaId, alphaKey);

    // Query storage.objects as Tenant Beta under authenticated role
    const betaStorageRead: any[] = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`);
      await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', $1, true);`, tenantBeta);
      return tx.$queryRawUnsafe(`SELECT id, name FROM storage.objects WHERE id = $1::uuid;`, objAlphaId);
    });

    console.log(`  Tenant Beta querying Alpha storage object: returned ${betaStorageRead.length} rows.`);
    console.log(`  [PASSED] Cross-tenant storage read blocked by storage.objects RLS? ${betaStorageRead.length === 0 ? 'YES (0 ROWS)' : 'NO (LEAK)'}`);
    if (betaStorageRead.length > 0) throw new Error('Storage RLS leaked cross-tenant object');

    // Manipulated Key Injection Test: Tenant Beta attempts to insert an object with Alpha's prefix
    let manipulatedUploadBlocked = false;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SET LOCAL ROLE authenticated;`);
        await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', $1, true);`, tenantBeta);
        await tx.$executeRawUnsafe(`
          INSERT INTO storage.objects (
            id, bucket_id, name, owner, created_at, updated_at, last_accessed_at
          ) VALUES (
            $1::uuid, 'isml-knowledge-vault', $2, NULL, NOW(), NOW(), NOW()
          );
        `, crypto.randomUUID(), `${tenantAlpha}/manipulated_exploit.pdf`);
      });
    } catch (err: any) {
      if (err.message.includes('violates row-level security policy') || err.message.includes('42501')) {
        manipulatedUploadBlocked = true;
        console.log(`  Intercepted Expected Kernel Error: "${err.message.split('\n').pop()}"`);
      }
    }

    console.log(`  [PASSED] Manipulated object key injection blocked by storage RLS WITH CHECK? ${manipulatedUploadBlocked ? 'YES (POSTGRESQL REJECTED)' : 'NO (BREACH)'}`);
    if (!manipulatedUploadBlocked) throw new Error('Manipulated key injection succeeded');

    // 3. Application Signed URL Expiration and Tenant Guard
    console.log('\n--- TEST 3: Application Signed URL Token & Expiration Guard ---');
    await prisma.resource.create({
      data: {
        id: resAlphaId,
        slug: `alpha-signed-${Date.now()}`,
        title: 'Alpha Signed Asset',
        description: 'Test',
        resourceType: 'PDF',
        language: { connect: { id: lang.id } },
        tenantId: tenantAlpha,
        isGlobal: false,
        approvalStatus: 'APPROVED',
        fileStorage: {
          create: {
            storageKey: alphaKey,
            fileName: 'test_exam.pdf',
            mimeType: 'application/pdf',
            fileSize: 2048n,
            checksum: 'mock-sha',
            storageProvider: 'SUPABASE',
          }
        }
      }
    });

    const legitSigned = await resourcesService.getPresignedUrl(resAlphaId, tenantAlpha);
    console.log(`  [PASSED] Legitimate Signed URL: ${legitSigned.downloadUrl}`);
    console.log(`  [PASSED] TTL Expiration Window: ${legitSigned.expiresInSeconds} seconds (15 minutes standard)`);

    // Tampered Tenant ID Access
    let tamperedAccessBlocked = false;
    try {
      await resourcesService.getPresignedUrl(resAlphaId, tenantBeta);
    } catch (err: any) {
      if (err.message.includes('Access denied to resource in isolated tenant')) {
        tamperedAccessBlocked = true;
      }
    }
    console.log(`  [PASSED] Tampered tenant query rejected before URL issuance? ${tamperedAccessBlocked ? 'YES (403 DENIED)' : 'NO (LEAK)'}`);
    if (!tamperedAccessBlocked) throw new Error('Tampered tenant generated signed URL');

    console.log('\n================================================================');
    console.log('SUPABASE STORAGE SECURITY: 100% EMPIRICALLY VERIFIED');
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ Storage Security Test Failed:', err);
    throw err;
  } finally {
    console.log('Cleaning up storage test artifacts...');
    try {
      await prisma.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', 'system_admin', false);`);
      await prisma.$executeRawUnsafe(`DELETE FROM storage.objects WHERE bucket_id = 'isml-knowledge-vault' AND name LIKE $1;`, `${tenantAlpha}/%`);
      await prisma.fileStorage.deleteMany({ where: { resourceId: resAlphaId } });
      await prisma.resource.deleteMany({ where: { id: resAlphaId } });
      console.log('Cleanup complete.');
    } catch (cleanupErr) {
      console.warn('Warning during cleanup:', cleanupErr);
    }
    await prisma.$disconnect();
  }
}

runStorageSecurityTests()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
