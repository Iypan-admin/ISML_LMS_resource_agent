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
  console.log('🧪 Starting Topic CRUD Automated HTTP Verification Suite...\n');
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
    // Setup prerequisite: Get language ID
    let langRes = await request('/languages?active=true');
    let langId = langRes.data?.data?.[0]?.id;

    if (!langId) {
      const createLang = await request('/languages', {
        method: 'POST',
        body: { code: 'de', name: 'German', nativeName: 'Deutsch', flagEmoji: '🇩🇪' },
      });
      langId = createLang.data?.data?.id;
    }

    // Test 1: POST /topics (Create Parent Topic)
    const createParentRes = await request('/topics', {
      method: 'POST',
      body: {
        languageId: langId,
        code: 'greetings-topic',
        title: 'Greetings & Farewells',
        slug: 'greetings-topic',
        description: 'Basic social greetings',
      },
    });
    assert(createParentRes.status === 201 && createParentRes.data.success === true, 'POST /topics creates parent topic');
    const parentId = createParentRes.data?.data?.id;

    // Test 2: POST /topics (Create Sub Topic)
    const createSubRes = await request('/topics', {
      method: 'POST',
      body: {
        languageId: langId,
        code: 'formal-greetings-topic',
        title: 'Formal Greetings',
        slug: 'formal-greetings-topic',
        parentTopicId: parentId,
      },
    });
    assert(createSubRes.status === 201 && createSubRes.data?.data?.parentTopicId === parentId, 'POST /topics creates sub-topic with hierarchy');
    const subId = createSubRes.data?.data?.id;

    // Test 3: Self-parenting prevention
    const selfParentRes = await request(`/topics/${parentId}`, {
      method: 'PATCH',
      body: { parentTopicId: parentId },
    });
    assert(selfParentRes.status === 400, 'PATCH /topics self-parenting returns 400 BadRequest');

    // Test 4: GET /topics (List)
    const listRes = await request('/topics');
    assert(listRes.status === 200 && Array.isArray(listRes.data?.data), 'GET /topics returns list of topics');

    // Test 5: Delete parent with children returns 409 Conflict
    const delParentRes = await request(`/topics/${parentId}`, {
      method: 'DELETE',
    });
    assert(delParentRes.status === 409, 'DELETE parent topic with children returns 409 Conflict');

    // Test 6: Clean deletion of sub topic then parent topic
    const delSubRes = await request(`/topics/${subId}`, { method: 'DELETE' });
    const delCleanParent = await request(`/topics/${parentId}`, { method: 'DELETE' });
    assert(delSubRes.status === 200 && delCleanParent.status === 200, 'DELETE sub-topic then parent succeeds cleanly');

    console.log(`\n==============================================`);
    console.log(`📊 TOPIC TEST RESULTS: ${passed} passed, ${failed} failed`);
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
