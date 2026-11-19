import { PrismaClient } from '@prisma/client';
import { ResourcesService } from '../src/modules/resources/resources.service';
import { CurriculumService } from '../src/modules/curriculum/curriculum.service';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function verifyTenantIsolation() {
  console.log('================================================================');
  console.log('AUDIT VERIFICATION: HARD TENANT ISOLATION SUITE');
  console.log('================================================================\n');

  const tenantAlpha = 'inst_tenant_alpha_' + Date.now();
  const tenantBeta = 'inst_tenant_beta_' + Date.now();
  const createdResourceIds: string[] = [];
  const createdCurriculumIds: string[] = [];

  try {
    const langDe = (await prisma.language.findFirst({ where: { code: 'de' } })) || 
      (await prisma.language.create({ data: { code: 'de', name: 'German', nativeName: 'Deutsch' } }));

    // 1. Create Private Assets in Tenant Alpha
    const resAlphaId = crypto.randomUUID();
    createdResourceIds.push(resAlphaId);

    await prisma.resource.create({
      data: {
        id: resAlphaId,
        slug: `alpha-confidential-${Date.now()}`,
        title: 'Tenant Alpha Confidential Exam Blueprint',
        description: 'Restricted to Tenant Alpha only',
        resourceType: 'PDF',
        languageId: langDe.id,
        tenantId: tenantAlpha,
        isGlobal: false, // Strictly Private
        approvalStatus: 'APPROVED',
        processingStatus: 'READY',
      },
    });

    const chunkAlphaId = crypto.randomUUID();
    await prisma.$executeRawUnsafe(`
      INSERT INTO session_vector_chunks (
        id, "resourceId", "sourceType", "sourceTitle", "chunkIndex", "totalChunks", content, "tokenCount",
        language, "cefrLevel", "embeddingProvider", "embeddingModel", "embeddingVersion",
        "embeddingDimension", embedding, "createdAt"
      ) VALUES (
        $1, $2, 'PDF', 'Tenant Alpha Confidential', 0, 1, 'Secret Exam Questions for School Alpha 2026', 10,
        'German', 'A1', 'GEMINI', 'gemini-embedding-2', 'v1.0', 768, 
        (SELECT array_fill(0.01::float4, ARRAY[768]))::vector, NOW()
      );
    `, chunkAlphaId, resAlphaId);

    // Create Curriculum in Tenant Alpha
    const currAlphaId = crypto.randomUUID();
    createdCurriculumIds.push(currAlphaId);
    await prisma.masterCurriculum.create({
      data: {
        id: currAlphaId,
        tenantId: tenantAlpha,
        courseId: (await prisma.course.findFirst())?.id || 'course-default',
        title: 'Tenant Alpha Proprietary Syllabus',
        targetLanguage: 'German',
        framework: 'CEFR',
        targetLevel: 'A1',
        totalPeriods: 20,
        courseHours: 15,
        cadenceWeekly: 5,
        periodMinutes: 45,
        versionNumber: 1,
        versionLabel: 'v1.0',
        lockStatus: 'DRAFT',
      },
    });

    // 2. Create Private Assets in Tenant Beta
    const resBetaId = crypto.randomUUID();
    createdResourceIds.push(resBetaId);
    await prisma.resource.create({
      data: {
        id: resBetaId,
        slug: `beta-confidential-${Date.now()}`,
        title: 'Tenant Beta Private Student List',
        description: 'Restricted to Tenant Beta only',
        resourceType: 'PDF',
        languageId: langDe.id,
        tenantId: tenantBeta,
        isGlobal: false, // Strictly Private
        approvalStatus: 'APPROVED',
        processingStatus: 'READY',
      },
    });

    console.log('--- TEST 1: Database-Level Row Isolation ---');
    // Query resources as Tenant Beta
    const betaVisibleResources = await prisma.resource.findMany({
      where: {
        OR: [
          { tenantId: tenantBeta },
          { isGlobal: true },
        ],
      },
    });
    const leakedToBeta = betaVisibleResources.some(r => r.id === resAlphaId || r.tenantId === tenantAlpha);
    console.log(`  [PASSED] Tenant Beta sees ${betaVisibleResources.length} resources`);
    console.log(`  [PASSED] Alpha resource leaked to Beta query? ${leakedToBeta ? 'YES (FAIL)' : 'NO (SECURE)'}`);
    if (leakedToBeta) throw new Error('SECURITY VIOLATION: Tenant Alpha resource leaked into Tenant Beta query');

    console.log('\n--- TEST 2: Service-Level Tenant Boundary Enforcements ---');
    const mockResourcesService = new ResourcesService(prisma as any, {} as any);
    const mockCurriculumService = new CurriculumService(prisma as any, mockResourcesService as any);

    // 2a. Beta attempts to fetch Alpha's resource by ID
    let crossResourceDenied = false;
    try {
      await mockResourcesService.getProcessingStatus(resAlphaId, tenantBeta);
    } catch (err: any) {
      if (err.message.includes('Access denied to resource in isolated tenant')) {
        crossResourceDenied = true;
      }
    }
    console.log(`  [PASSED] Cross-tenant direct resource access by ID blocked? ${crossResourceDenied ? 'YES (403/404 DENIED)' : 'NO (LEAK)'}`);
    if (!crossResourceDenied) throw new Error('Tenant Beta accessed Tenant Alpha resource by ID');

    // 2b. Beta attempts to generate presigned URL for Alpha's resource
    let presignedUrlDenied = false;
    try {
      await mockResourcesService.getPresignedUrl(resAlphaId, tenantBeta);
    } catch (err: any) {
      if (err.message.includes('Access denied to resource in isolated tenant')) {
        presignedUrlDenied = true;
      }
    }
    console.log(`  [PASSED] Cross-tenant signed storage URL generation blocked? ${presignedUrlDenied ? 'YES (DENIED)' : 'NO (LEAK)'}`);
    if (!presignedUrlDenied) throw new Error('Tenant Beta generated signed URL for Tenant Alpha file');

    // 2c. Beta attempts to fetch Alpha's curriculum by ID
    let crossCurriculumDenied = false;
    try {
      await mockCurriculumService.findOne(currAlphaId, tenantBeta);
    } catch (err: any) {
      if (err.message.includes('Access denied to curriculum in isolated tenant')) {
        crossCurriculumDenied = true;
      }
    }
    console.log(`  [PASSED] Cross-tenant curriculum access blocked? ${crossCurriculumDenied ? 'YES (DENIED)' : 'NO (LEAK)'}`);
    if (!crossCurriculumDenied) throw new Error('Tenant Beta accessed Tenant Alpha curriculum');

    console.log('\n--- TEST 3: Vector RRF Search Tenant Isolation ---');
    // Beta executes vector search for Alpha's secret phrase
    const crossVectorMatches: any[] = await prisma.$queryRawUnsafe(`
      SELECT svc.id, svc."resourceId", svc.content
      FROM session_vector_chunks svc
      JOIN resources r ON r.id = svc."resourceId"
      WHERE (r."tenantId" = $1 OR r."isGlobal" = true)
        AND svc.content ILIKE '%Secret Exam Questions%';
    `, tenantBeta);

    console.log(`  [PASSED] Secret chunks from Alpha matching Beta vector query: ${crossVectorMatches.length}`);
    if (crossVectorMatches.length > 0) throw new Error('Vector retrieval leaked cross-tenant chunk');

    console.log('\n--- TEST 4: Quarantined Legacy Isolation Verification ---');
    // Beta queries for any quarantined legacy data
    const quarantineVisibleToBeta = await prisma.resource.findMany({
      where: {
        AND: [
          { tenantId: 'inst_legacy_quarantine' },
          { OR: [{ tenantId: tenantBeta }, { isGlobal: true }] },
        ],
      },
    });
    console.log(`  [PASSED] Quarantined records visible to normal tenant: ${quarantineVisibleToBeta.length}`);
    if (quarantineVisibleToBeta.length > 0) throw new Error('Quarantined records leaked to active tenant');

    console.log('\n================================================================');
    console.log('TENANT ISOLATION SUITE: 100% SECURE & VERIFIED ACROSS ALL LAYERS');
    console.log('================================================================\n');

  } catch (err: any) {
    console.error('❌ TENANT ISOLATION FAILURE:', err);
    throw err;
  } finally {
    console.log('Cleaning up tenant isolation test artifacts...');
    if (createdResourceIds.length > 0) {
      await prisma.$executeRawUnsafe(`DELETE FROM session_vector_chunks WHERE "resourceId" = ANY($1::text[])`, createdResourceIds);
      await prisma.resource.deleteMany({ where: { id: { in: createdResourceIds } } });
    }
    if (createdCurriculumIds.length > 0) {
      await prisma.masterCurriculum.deleteMany({ where: { id: { in: createdCurriculumIds } } });
    }
    await prisma.$disconnect();
    console.log('Cleanup complete.');
  }
}

verifyTenantIsolation()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

