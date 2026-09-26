import * as http from 'http';

const API_BASE = 'http://localhost:4000/api/v1';

async function request(path: string, options: { method?: string; body?: any } = {}): Promise<{ status: number; data: any }> {
  const url = `${API_BASE}${path}`;
  const method = options.method || 'GET';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const bodyData = options.body ? JSON.stringify(options.body) : null;

  return new Promise((resolve, reject) => {
    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode || 500, data: parsed });
        } catch {
          resolve({ status: res.statusCode || 500, data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (bodyData) {
      req.write(bodyData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Core Resource CRUD Automated HTTP Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail}`);
      failed++;
    }
  }

  try {
    // 1. Setup prerequisites: Language
    let langRes = await request('/languages?active=true');
    let langId = langRes.data?.data?.[0]?.id;
    if (!langId) {
      const createLang = await request('/languages', {
        method: 'POST',
        body: { code: 'de', name: 'German', nativeName: 'Deutsch', flagEmoji: '🇩🇪' },
      });
      langId = createLang.data?.data?.id;
    }

    // 2. Setup prerequisites: Category
    let catRes = await request('/categories');
    let catId = catRes.data?.data?.[0]?.id;
    if (!catId) {
      const createCat = await request('/categories', {
        method: 'POST',
        body: { code: 'dialogue-cat', name: 'Dialogues', slug: 'dialogue-cat' },
      });
      catId = createCat.data?.data?.id;
    }

    // Test 1: POST /resources (Create Nicos Weg Dialogue Resource)
    const createRes = await request('/resources', {
      method: 'POST',
      body: {
        slug: 'dw-nicos-weg-a1-1',
        title: 'Nicos Weg Episode 1: Hallo!',
        description: 'First episode of DW Nicos Weg interactive video series for A1 learners',
        languageId: langId,
        resourceType: 'YOUTUBE_VIDEO',
        status: 'PUBLISHED',
        originalUrl: 'https://dw.com/nicos-weg-1',
        normalizedUrl: 'https://dw.com/nicos-weg-1',
        categoryIds: [catId],
      },
    });
    assert(createRes.status === 201 && createRes.data.success === true, 'POST /resources creates new resource with junction relations');
    const createdId = createRes.data?.data?.id;

    // Test 2: POST /resources Duplicate Slug (409 Conflict)
    const dupSlugRes = await request('/resources', {
      method: 'POST',
      body: {
        slug: 'dw-nicos-weg-a1-1',
        title: 'Duplicate Slug Resource',
        description: 'Test duplicate slug',
        languageId: langId,
        resourceType: 'WEBSITE',
      },
    });
    assert(dupSlugRes.status === 409, 'POST /resources duplicate slug returns 409 Conflict');

    // Test 3: GET /resources (List with Search & Filtering)
    const listRes = await request(`/resources?languageId=${langId}&search=Nicos`);
    assert(listRes.status === 200 && Array.isArray(listRes.data?.data) && listRes.data?.meta?.total >= 1, 'GET /resources returns paginated list with search filter');

    // Test 4: GET /resources/:id
    const getOneRes = await request(`/resources/${createdId}`);
    assert(getOneRes.status === 200 && getOneRes.data?.data?.slug === 'dw-nicos-weg-a1-1', 'GET /resources/:id returns full resource entity with junction includes');

    // Test 5: PATCH /resources/:id (Status transition to APPROVED)
    const patchRes = await request(`/resources/${createdId}`, {
      method: 'PATCH',
      body: { status: 'APPROVED', title: 'Nicos Weg Episode 1: Hallo! (Approved)' },
    });
    assert(patchRes.status === 200 && patchRes.data?.data?.status === 'APPROVED', 'PATCH /resources/:id updates status and fields');

    // Test 6: DELETE /resources/:id
    const delRes = await request(`/resources/${createdId}`, {
      method: 'DELETE',
    });
    assert(delRes.status === 200 && delRes.data?.success === true, 'DELETE /resources/:id removes or archives resource');

    console.log(`\n==============================================`);
    console.log(`📊 CORE RESOURCE TEST RESULTS: ${passed} passed, ${failed} failed`);
    console.log(`==============================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test execution error:', err);
    process.exit(1);
  }
}

runTests();
