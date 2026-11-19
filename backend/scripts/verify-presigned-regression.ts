import { PrismaClient } from '@prisma/client';
import { ResourcesService } from '../src/modules/resources/resources.service';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function runPresignedUrlRegression() {
  console.log('================================================================');
  console.log('REGRESSION AUDIT: getPresignedUrl() AUTHORIZATION SEQUENCE');
  console.log('================================================================\n');

  const tenantAlpha = 'inst_regress_alpha_' + Date.now();
  const tenantBeta = 'inst_regress_beta_' + Date.now();
  const createdResourceIds: string[] = [];

  try {
    const resourcesService = new ResourcesService(prisma as any, {} as any);
    const lang = await prisma.language.findFirst();
    if (!lang) throw new Error('No language found');

    // 1. Resource A1: In Tenant Alpha, WITHOUT file storage attached
    const resA1Id = crypto.randomUUID();
    createdResourceIds.push(resA1Id);
    await prisma.resource.create({
      data: {
        id: resA1Id,
        slug: `alpha-nostorage-${Date.now()}`,
        title: 'Alpha Resource No Storage',
        description: 'Test description',
        resourceType: 'PDF',
        language: { connect: { id: lang.id } },
        tenantId: tenantAlpha,
        isGlobal: false,
        approvalStatus: 'DRAFT',
      }
    });

    // 2. Resource A2: In Tenant Alpha, WITH file storage attached
    const resA2Id = crypto.randomUUID();
    createdResourceIds.push(resA2Id);
    await prisma.resource.create({
      data: {
        id: resA2Id,
        slug: `alpha-withstorage-${Date.now()}`,
        title: 'Alpha Resource With Storage',
        description: 'Test description',
        resourceType: 'PDF',
        language: { connect: { id: lang.id } },
        tenantId: tenantAlpha,
        isGlobal: false,
        approvalStatus: 'APPROVED',
        fileStorage: {
          create: {
            storageKey: `${tenantAlpha}/German/CEFR_A1/${resA2Id}/test.pdf`,
            fileName: 'test.pdf',
            mimeType: 'application/pdf',
            fileSize: 1024n,
            checksum: 'dummy-sha256',
            storageProvider: 'SUPABASE',
          }
        }
      }
    });

    // TEST 1: Cross-tenant access on resource WITHOUT storage metadata
    console.log('--- TEST 1: Cross-tenant query on resource without storage metadata ---');
    let test1Passed = false;
    try {
      await resourcesService.getPresignedUrl(resA1Id, tenantBeta);
    } catch (err: any) {
      console.log(`  Intercepted Error: "${err.message}"`);
      if (err.message.includes('Access denied to resource in isolated tenant')) {
        test1Passed = true;
      }
    }
    console.log(`  [${test1Passed ? 'PASSED' : 'FAILED'}] Tenant boundary enforced BEFORE checking storage presence? ${test1Passed ? 'YES (SECURE)' : 'NO (VULNERABLE)'}`);
    if (!test1Passed) throw new Error('Regression failed: Storage check leaked before tenant boundary check');

    // TEST 2: Cross-tenant access on resource WITH storage metadata
    console.log('\n--- TEST 2: Cross-tenant query on resource with storage metadata ---');
    let test2Passed = false;
    try {
      await resourcesService.getPresignedUrl(resA2Id, tenantBeta);
    } catch (err: any) {
      console.log(`  Intercepted Error: "${err.message}"`);
      if (err.message.includes('Access denied to resource in isolated tenant')) {
        test2Passed = true;
      }
    }
    console.log(`  [${test2Passed ? 'PASSED' : 'FAILED'}] Cross-tenant signed URL generation blocked? ${test2Passed ? 'YES (SECURE)' : 'NO (VULNERABLE)'}`);
    if (!test2Passed) throw new Error('Cross-tenant signed URL access was not blocked');

    // TEST 3: Legitimate Tenant Alpha access to its own resource
    console.log('\n--- TEST 3: Legitimate owner access by Tenant Alpha ---');
    const validUrl = await resourcesService.getPresignedUrl(resA2Id, tenantAlpha);
    console.log(`  [PASSED] Authorized URL successfully generated: ${validUrl.downloadUrl}`);
    console.log(`  [PASSED] Expires in: ${validUrl.expiresInSeconds}s`);

    console.log('\n================================================================');
    console.log('PRESIGNED URL REGRESSION SUITE: 100% VERIFIED');
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ Presigned URL Regression Failed:', err);
    throw err;
  } finally {
    console.log('Tearing down regression test artifacts...');
    if (createdResourceIds.length > 0) {
      await prisma.fileStorage.deleteMany({ where: { resourceId: { in: createdResourceIds } } });
      await prisma.resource.deleteMany({ where: { id: { in: createdResourceIds } } });
    }
    await prisma.$disconnect();
    console.log('Cleanup complete.');
  }
}

runPresignedUrlRegression()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
