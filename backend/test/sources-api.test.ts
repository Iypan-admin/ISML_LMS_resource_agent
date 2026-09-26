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
  console.log('🧪 Starting Source CRUD Automated HTTP Verification Suite...\n');
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
    // Test 1: POST /sources (Create Deutsche Welle)
    const createRes = await request('/sources', {
      method: 'POST',
      body: {
        name: 'Deutsche Welle',
        domain: 'dw.com',
        baseUrl: 'https://dw.com',
        sourceType: 'WEB_PORTAL',
        description: 'German international public broadcaster',
      },
    });
    assert(createRes.status === 201 && createRes.data.success === true, 'POST /sources creates new source');
    const createdId = createRes.data?.data?.id;

    // Test 2: GET /sources (List)
    const listRes = await request('/sources');
    assert(listRes.status === 200 && Array.isArray(listRes.data?.data), 'GET /sources returns list of sources');

    // Test 3: GET /sources/:id
    const getOneRes = await request(`/sources/${createdId}`);
    assert(getOneRes.status === 200 && getOneRes.data?.data?.domain === 'dw.com', 'GET /sources/:id returns source entity');

    // Test 4: PATCH /sources/:id
    const patchRes = await request(`/sources/${createdId}`, {
      method: 'PATCH',
      body: { description: 'DW Learn German Portal' },
    });
    assert(patchRes.status === 200 && patchRes.data?.data?.description === 'DW Learn German Portal', 'PATCH /sources/:id updates description');

    // Test 5: DELETE /sources/:id
    const delRes = await request(`/sources/${createdId}`, {
      method: 'DELETE',
    });
    assert(delRes.status === 200 && delRes.data?.success === true, 'DELETE /sources/:id removes source entity');

    console.log(`\n==============================================`);
    console.log(`📊 SOURCE TEST RESULTS: ${passed} passed, ${failed} failed`);
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
