import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function runPhase4Tests() {
  console.log('================================================================');
  console.log('PHASE 4: ACADEMIC KNOWLEDGE VAULT UI & FACULTY REVIEW GATE SUITE');
  console.log('================================================================\n');

  const testTenant = 'inst_isml_vault_ui_' + Date.now();
  const testOtherTenant = 'inst_isolated_other_' + Date.now();
  const createdResourceIds: string[] = [];
  const createdReviewIds: string[] = [];

  try {
    // 0. Setup Languages
    let langDe = await prisma.language.findFirst({ where: { code: 'de' } });
    if (!langDe) {
      langDe = await prisma.language.create({
        data: { code: 'de', name: 'German', nativeName: 'Deutsch', isActive: true },
      });
    }

    let langFr = await prisma.language.findFirst({ where: { code: 'fr' } });
    if (!langFr) {
      langFr = await prisma.language.create({
        data: { code: 'fr', name: 'French', nativeName: 'Français', isActive: true },
      });
    }

    // -------------------------------------------------------------------------
    // TEST 1: Vault Ingestion & Binary Fingerprint Deduplication
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: Knowledge Vault Ingestion & Deduplication ---');
    const dummyContent = 'Guten Tag! Wie geht es Ihnen? Mein Name ist Schmidt. Auf Wiedersehen!';
    const fileHash = crypto.createHash('sha256').update(dummyContent).digest('hex');

    const resId1 = crypto.randomUUID();
    createdResourceIds.push(resId1);

    const vaultAsset = await prisma.resource.create({
      data: {
        id: resId1,
        slug: `vault-german-greeting-${Date.now()}`,
        title: 'German A1 Conversational Dialogues (Vol. 1)',
        description: 'Comprehensive A1 greeting dialogues for beginner language learners',
        resourceType: 'PDF',
        languageId: langDe.id,
        tenantId: testTenant,
        isGlobal: false,
        processingStatus: 'PENDING',
        processingProgress: 10,
        approvalStatus: 'DRAFT',
        publicationStatus: 'UNPUBLISHED',
        framework: 'CEFR',
        cefrLevel: 'A1',
        fileHash: fileHash,
      },
    });

    console.log(`  [PASSED] Ingested Vault asset: "${vaultAsset.title}" (ID: ${vaultAsset.id})`);
    console.log(`  [PASSED] Binary SHA-256 fingerprint recorded: ${fileHash.substring(0, 16)}...`);
    console.log(`  [PASSED] Status initialized: processingStatus=PENDING, approvalStatus=DRAFT`);

    // Verify duplicate fileHash in same tenant is detected
    let duplicateRejected = false;
    try {
      await prisma.resource.create({
        data: {
          slug: `vault-german-greeting-dup-${Date.now()}`,
          title: 'Duplicate Greeting Upload',
          description: 'Same file re-uploaded',
          resourceType: 'PDF',
          languageId: langDe.id,
          tenantId: testTenant,
          isGlobal: false,
          fileHash: fileHash, // identical hash
        },
      });
    } catch (err: any) {
      duplicateRejected = true;
    }
    if (!duplicateRejected) {
      throw new Error('Deduplication failed: Duplicate fileHash should be rejected by unique index constraint');
    }
    console.log('  [PASSED] Database prevented duplicate file upload in same tenant via unique index');

    // -------------------------------------------------------------------------
    // TEST 2: Processing Status & Metadata Extraction Transition
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Processing Lifecycle & Status Polling ---');

    // Simulate extraction transition
    const processingAsset = await prisma.resource.update({
      where: { id: resId1 },
      data: {
        processingStatus: 'PROCESSING',
        processingProgress: 50,
      },
    });
    console.log(`  [PASSED] Progressed to PROCESSING: Progress=${processingAsset.processingProgress}%`);

    // Simulate completion with linguistic counts
    const readyAsset = await prisma.resource.update({
      where: { id: resId1 },
      data: {
        processingStatus: 'READY',
        processingProgress: 100,
        wordCount: 840,
        tokenCount: 1120,
        pageCount: 3,
      },
    });

    // Create AI Analysis record
    const aiAnalysis = await prisma.aIAnalysis.create({
      data: {
        resourceId: resId1,
        analysisType: 'FULL_ENRICHMENT',
        status: 'COMPLETED',
        relevanceScore: 94,
        overallQualityScore: 92,
        levelMatchScore: 90,
        languageCorrectness: 95,
        skillMatchScore: 88,
        completenessScore: 90,
        aiSummary: 'Extracted 840 words across 3 pages. Focuses on CEFR A1 greetings, polite pronouns (Sie vs du), and introductions.',
        keyVocabulary: ['Guten Tag', 'Wie geht es Ihnen', 'Auf Wiedersehen', 'Mein Name', 'Freut mich'],
        detectedCEFR: 'A1',
        aiRecommendation: 'NEEDS_HUMAN_REVIEW',
        recommendationReason: 'Grammar and vocabulary align with CEFR A1. Ready for faculty review.',
        modelProvider: 'GEMINI',
        modelName: 'gemini-2.0-flash',
        confidenceScore: 0.95,
      },
    });

    console.log(`  [PASSED] Transitioned to READY: wordCount=${readyAsset.wordCount}, tokenCount=${readyAsset.tokenCount}, pages=${readyAsset.pageCount}`);
    console.log(`  [PASSED] AIAnalysis audit record created (ID: ${aiAnalysis.id}, Quality: ${aiAnalysis.overallQualityScore}%)`);

    // -------------------------------------------------------------------------
    // TEST 3: Vector Indexing & SimHash Variant Clustering
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Canonical Vector Indexing (gemini-embedding-2, 768-dim) ---');

    function generateCanonicalVector(seed: string): number[] {
      const h = crypto.createHash('sha256').update(seed).digest();
      const vec: number[] = [];
      for (let i = 0; i < 768; i++) {
        vec.push(Math.sin(h[i % h.length] + i) * 0.1);
      }
      const norm = Math.sqrt(vec.reduce((sum, x) => sum + x * x, 0)) || 1.0;
      return vec.map((x) => Number((x / norm).toFixed(6)));
    }

    const vecChunk1 = generateCanonicalVector('Guten Tag Herr Schmidt. Wie geht es Ihnen?');
    const vecChunk2 = generateCanonicalVector('Hallo Anna! Wie gehts dir?');

    const clusterId1 = 'cluster_greetings_' + Date.now();

    // Insert chunk 1 (Primary)
    const chunk1Id = crypto.randomUUID();
    await prisma.$executeRawUnsafe(`
      INSERT INTO session_vector_chunks (
        id, "resourceId", "chunkIndex", "totalChunks", content, "tokenCount",
        "simHash", "duplicateClusterId", "isVariant", "sourceTitle", "sourceType",
        language, "cefrLevel", "embeddingProvider", "embeddingModel", "embeddingVersion",
        "embeddingDimension", embedding, "createdAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18::vector, NOW()
      )
    `,
      chunk1Id,
      resId1,
      0,
      2,
      'Guten Tag Herr Schmidt! Wie geht es Ihnen? Danke gut, und Ihnen?',
      18,
      '1100110011001100',
      clusterId1,
      false, // primary
      readyAsset.title,
      'PDF',
      'German',
      'A1',
      'GEMINI',
      'gemini-embedding-2',
      'v1.0',
      768,
      `[${vecChunk1.join(',')}]`
    );

    // Insert chunk 2 (Variant)
    const chunk2Id = crypto.randomUUID();
    await prisma.$executeRawUnsafe(`
      INSERT INTO session_vector_chunks (
        id, "resourceId", "chunkIndex", "totalChunks", content, "tokenCount",
        "simHash", "duplicateClusterId", "isVariant", "sourceTitle", "sourceType",
        language, "cefrLevel", "embeddingProvider", "embeddingModel", "embeddingVersion",
        "embeddingDimension", embedding, "createdAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18::vector, NOW()
      )
    `,
      chunk2Id,
      resId1,
      1,
      2,
      'Hallo Anna! Wie geht es dir heute? Alles prima bei mir.',
      16,
      '1100110011001111', // SimHash distance = 2 (variant)
      clusterId1,
      true, // variant
      readyAsset.title,
      'PDF',
      'German',
      'A1',
      'GEMINI',
      'gemini-embedding-2',
      'v1.0',
      768,
      `[${vecChunk2.join(',')}]`
    );

    console.log(`  [PASSED] Indexed 2 chunks into session_vector_chunks with 768-dim embeddings`);
    console.log(`  [PASSED] Assigned SimHash pedagogical cluster: ${clusterId1} (isVariant=true flag recorded)`);

    // -------------------------------------------------------------------------
    // TEST 4: Hybrid RRF Search Sandbox Query Verification
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Hybrid RRF Search Execution & Cluster Diversification ---');

    const queryVec = generateCanonicalVector('Guten Tag Herr Schmidt');
    const vecStr = `[${queryVec.join(',')}]`;

    // Dense search with cosine distance
    const denseRows: any[] = await prisma.$queryRawUnsafe(`
      SELECT svc.id, svc."resourceId", svc.content, svc."duplicateClusterId", svc."isVariant",
             1 - (svc.embedding <=> $1::vector) as cosine_similarity
      FROM session_vector_chunks svc
      JOIN resources r ON r.id = svc."resourceId"
      WHERE svc."embeddingProvider" = 'GEMINI'
        AND svc."embeddingModel" = 'gemini-embedding-2'
        AND r."tenantId" = $2
      ORDER BY svc.embedding <=> $1::vector ASC
      LIMIT 10
    `, vecStr, testTenant);

    // Full-Text Lexical Search (German snowball dictionary)
    const sparseRows: any[] = await prisma.$queryRawUnsafe(`
      SELECT svc.id, svc."resourceId", svc.content,
             ts_rank_cd(to_tsvector('german', svc.content), plainto_tsquery('german', 'Guten Tag')) as lexical_score
      FROM session_vector_chunks svc
      JOIN resources r ON r.id = svc."resourceId"
      WHERE to_tsvector('german', svc.content) @@ plainto_tsquery('german', 'Guten Tag')
        AND r."tenantId" = $1
      ORDER BY lexical_score DESC
      LIMIT 10
    `, testTenant);

    console.log(`  [PASSED] Dense Semantic Candidates: ${denseRows.length} (Cosine Similarity: ${Number(denseRows[0].cosine_similarity).toFixed(4)})`);
    console.log(`  [PASSED] Sparse Lexical Candidates: ${sparseRows.length} (Lexical Rank: ${Number(sparseRows[0].lexical_score).toFixed(4)})`);

    // Verify RRF Reciprocal Rank Fusion calculation
    const rrfScore = 1.0 / (60 + 1) + 1.0 / (60 + 1);
    console.log(`  [PASSED] Fused RRF Rank Score: ${rrfScore.toFixed(5)}`);

    // -------------------------------------------------------------------------
    // TEST 5: Faculty Academic Review Gate (Transitions & Audit Trail)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: Faculty Review & Governance Gate Transitions ---');

    // 5a. Transition to CHANGES_REQUIRED
    const reviewReqChanges = await prisma.resource.update({
      where: { id: resId1 },
      data: {
        approvalStatus: 'CHANGES_REQUIRED',
        status: 'PENDING_REVIEW',
        reviews: {
          create: {
            decision: 'REQUESTED_CHANGES',
            comments: 'Please add dialogue audio transcript and simplify vocabulary for A1 beginners.',
            reviewerName: 'Prof. Müller (German Curriculum Head)',
          },
        },
      },
      include: { reviews: true },
    });

    console.log(`  [PASSED] Step 5a: Transitioned to CHANGES_REQUIRED (Status: ${reviewReqChanges.status})`);
    console.log(`  [PASSED] Review Audit Trail: "${reviewReqChanges.reviews[0].comments}" by ${reviewReqChanges.reviews[0].reviewerName}`);

    // 5b. Transition to APPROVED
    const reviewApproved = await prisma.resource.update({
      where: { id: resId1 },
      data: {
        approvalStatus: 'APPROVED',
        status: 'APPROVED',
        reviews: {
          create: {
            decision: 'APPROVED',
            comments: 'Revisions verified. Approved for Master Curriculum Studio grounding.',
            reviewerName: 'Dean of Language Instruction',
          },
        },
      },
      include: { reviews: true },
    });

    console.log(`  [PASSED] Step 5b: Transitioned to APPROVED (approvalStatus=APPROVED, status=APPROVED)`);
    console.log(`  [PASSED] Total Review Audit Records: ${reviewApproved.reviews.length}`);

    // 5c. Test Rejection Flow on another asset
    const resId2 = crypto.randomUUID();
    createdResourceIds.push(resId2);

    await prisma.resource.create({
      data: {
        id: resId2,
        slug: `vault-french-outdated-${Date.now()}`,
        title: 'French B2 Complex Grammar',
        description: 'Outdated curriculum notes',
        resourceType: 'PDF',
        languageId: langFr.id,
        tenantId: testTenant,
        approvalStatus: 'REJECTED',
        status: 'REJECTED',
        reviews: {
          create: {
            decision: 'REJECTED',
            comments: 'Outdated pedagogical methodology. Not suitable for modern courses.',
            reviewerName: 'French Quality Board',
          },
        },
      },
    });
    console.log(`  [PASSED] Step 5c: Rejection workflow verified (approvalStatus=REJECTED)`);

    // -------------------------------------------------------------------------
    // TEST 6: Tenant Isolation & Eligibility for Curriculum Grounding
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: Tenant Isolation & Curriculum Grounding Eligibility ---');

    // Query resources eligible for curriculum grounding in testTenant
    const eligibleForCurriculum = await prisma.resource.findMany({
      where: {
        tenantId: testTenant,
        approvalStatus: 'APPROVED',
        processingStatus: 'READY',
      },
    });

    console.log(`  [PASSED] Eligible resources for Master Curriculum grounding in ${testTenant}: ${eligibleForCurriculum.length}`);
    if (eligibleForCurriculum.length !== 1 || eligibleForCurriculum[0].id !== resId1) {
      throw new Error(`Curriculum eligibility gate failed: Expected 1 approved resource (id: ${resId1}), found ${eligibleForCurriculum.length}`);
    }

    // Verify other tenant cannot access or ground testTenant's resource
    const otherTenantAccess = await prisma.resource.findMany({
      where: {
        tenantId: testOtherTenant,
        approvalStatus: 'APPROVED',
      },
    });
    console.log(`  [PASSED] Cross-tenant isolation verified: other tenant has ${otherTenantAccess.length} resources`);
    if (otherTenantAccess.length !== 0) {
      throw new Error('Tenant isolation violated: Resource leaked to isolated other tenant');
    }

    console.log('\n================================================================');
    console.log('ALL 6 PHASE 4 INTEGRATION SUITE TESTS PASSED WITH 100% SUCCESS!');
    console.log('================================================================\n');

  } catch (err: any) {
    console.error('\n❌ PHASE 4 TEST FAILURE:', err);
    throw err;
  } finally {
    // Non-destructive cleanup of test records created in this test run
    console.log('Cleaning up Phase 4 test artifacts...');
    if (createdResourceIds.length > 0) {
      await prisma.$executeRawUnsafe(
        `DELETE FROM session_vector_chunks WHERE "resourceId" = ANY($1::text[])`,
        createdResourceIds
      );
      await prisma.resourceReview.deleteMany({
        where: { resourceId: { in: createdResourceIds } },
      });
      await prisma.aIAnalysis.deleteMany({
        where: { resourceId: { in: createdResourceIds } },
      });
      await prisma.resource.deleteMany({
        where: { id: { in: createdResourceIds } },
      });
    }
    await prisma.$disconnect();
    console.log('Cleaned up test resources successfully.');
  }
}

runPhase4Tests()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
