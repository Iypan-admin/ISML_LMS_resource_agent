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
  console.log('🧪 Starting Category CRUD Automated HTTP Verification Suite...\n');
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
    // Test 1: POST /categories (Create Grammar)
    const createRes = await request('/categories', {
      method: 'POST',
      body: {
        code: 'grammar-cat',
        name: 'Grammar',
        slug: 'grammar-cat',
        description: 'Grammar and syntax resources',
        displayOrder: 1,
      },
    });
    assert(createRes.status === 201 && createRes.data.success === true, 'POST /categories creates new category');
    const createdId = createRes.data?.data?.id;

    // Test 2: POST /categories Duplicate Code (409 Conflict)
    const dupRes = await request('/categories', {
      method: 'POST',
      body: {
        code: 'grammar-cat',
        name: 'Grammar Duplicate',
        slug: 'grammar-cat-dup',
      },
    });
    assert(dupRes.status === 409, 'POST /categories duplicate code returns 409 Conflict');

    // Test 3: GET /categories (List)
    const listRes = await request('/categories');
    assert(listRes.status === 200 && Array.isArray(listRes.data?.data), 'GET /categories returns list of categories');

    // Test 4: GET /categories/:id
    const getOneRes = await request(`/categories/${createdId}`);
    assert(getOneRes.status === 200 && getOneRes.data?.data?.code === 'grammar-cat', 'GET /categories/:id returns category entity');

    // Test 5: PATCH /categories/:id
    const patchRes = await request(`/categories/${createdId}`, {
      method: 'PATCH',
      body: { name: 'Grammar & Syntax' },
    });
    assert(patchRes.status === 200 && patchRes.data?.data?.name === 'Grammar & Syntax', 'PATCH /categories/:id updates category name');

    // Test 6: DELETE /categories/:id
    const delRes = await request(`/categories/${createdId}`, {
      method: 'DELETE',
    });
    assert(delRes.status === 200 && delRes.data?.success === true, 'DELETE /categories/:id removes category entity');

    console.log(`\n==============================================`);
    console.log(`📊 CATEGORY TEST RESULTS: ${passed} passed, ${failed} failed`);
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
