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
  console.log('🧪 Starting ResourceType Read-Only Automated HTTP Verification Suite...\n');
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
    // Test 1: GET /resource-types (List all enum metadata)
    const listRes = await request('/resource-types');
    assert(listRes.status === 200 && Array.isArray(listRes.data?.data) && listRes.data?.count === 15, 'GET /resource-types returns 15 valid enum metadata items');

    // Test 2: GET /resource-types/DIALOGUE (Get single metadata)
    const getDialogue = await request('/resource-types/DIALOGUE');
    assert(getDialogue.status === 200 && getDialogue.data?.data?.type === 'DIALOGUE', 'GET /resource-types/DIALOGUE returns correct metadata');

    // Test 3: GET /resource-types/invalid (404 NotFound)
    const getInvalid = await request('/resource-types/INVALID_TYPE');
    assert(getInvalid.status === 404, 'GET /resource-types/INVALID_TYPE returns 404 NotFound');

    // Test 4: POST /resource-types should fail (404/405 - Not Implemented route)
    const postRes = await request('/resource-types', { method: 'POST', body: { name: 'Custom' } });
    assert(postRes.status === 404, 'POST /resource-types is NOT implemented (returns 404 Route Not Found)');

    console.log(`\n==============================================`);
    console.log(`📊 RESOURCE-TYPE TEST RESULTS: ${passed} passed, ${failed} failed`);
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
