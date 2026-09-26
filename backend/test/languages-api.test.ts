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
  console.log('🧪 Starting Language CRUD Automated HTTP Verification Suite...\n');
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
    // Test 1: POST /languages (Create Japanese)
    const createRes = await request('/languages', {
      method: 'POST',
      body: { code: 'ja', name: 'Japanese', nativeName: '日本語', flagEmoji: '🇯🇵' },
    });
    assert(createRes.status === 201 && createRes.data.success === true, 'POST /languages creates new language with 201');
    const createdId = createRes.data?.data?.id;

    // Test 2: POST /languages Duplicate Code (409 Conflict)
    const dupRes = await request('/languages', {
      method: 'POST',
      body: { code: 'ja', name: 'Japanese Duplicate', nativeName: '日本語' },
    });
    assert(dupRes.status === 409, 'POST /languages with duplicate code returns 409 Conflict');

    // Test 3: GET /languages (List)
    const listRes = await request('/languages');
    assert(listRes.status === 200 && Array.isArray(listRes.data?.data), 'GET /languages returns array of languages with 200');

    // Test 4: GET /languages/:id
    const getOneRes = await request(`/languages/${createdId}`);
    assert(getOneRes.status === 200 && getOneRes.data?.data?.code === 'ja', 'GET /languages/:id returns correct language entity');

    // Test 5: PATCH /languages/:id
    const patchRes = await request(`/languages/${createdId}`, {
      method: 'PATCH',
      body: { nativeName: 'Nihongo' },
    });
    assert(patchRes.status === 200 && patchRes.data?.data?.nativeName === 'Nihongo', 'PATCH /languages/:id updates language properties');

    // Test 6: DELETE /languages/:id
    const delRes = await request(`/languages/${createdId}`, {
      method: 'DELETE',
    });
    assert(delRes.status === 200 && delRes.data?.success === true, 'DELETE /languages/:id removes language cleanly');

    console.log(`\n==============================================`);
    console.log(`📊 TEST RESULTS: ${passed} passed, ${failed} failed`);
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
