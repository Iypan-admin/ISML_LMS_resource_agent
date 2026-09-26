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
  console.log('🧪 Starting Level CRUD Automated HTTP Verification Suite...\n');
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
    // Test 1: POST /levels (Create A1 Level)
    const createRes = await request('/levels', {
      method: 'POST',
      body: {
        code: 'A1',
        name: 'Level A1 - Beginner',
        rank: 1,
      },
    });
    assert(createRes.status === 201 || createRes.status === 409, 'POST /levels creates or handles A1 level');
    let createdId = createRes.data?.data?.id;

    if (!createdId) {
      const getA1 = await request('/levels/A1');
      createdId = getA1.data?.data?.id;
    }

    // Test 2: POST /levels Duplicate Code (409 Conflict)
    const dupRes = await request('/levels', {
      method: 'POST',
      body: {
        code: 'A1',
        name: 'Level A1 Duplicate',
        rank: 1,
      },
    });
    assert(dupRes.status === 409, 'POST /levels duplicate code returns 409 Conflict');

    // Test 3: GET /levels (List)
    const listRes = await request('/levels');
    assert(listRes.status === 200 && Array.isArray(listRes.data?.data), 'GET /levels returns list of levels');

    // Test 4: GET /levels/:id (By code A1 or UUID)
    const getOneRes = await request('/levels/A1');
    assert(getOneRes.status === 200 && getOneRes.data?.data?.code === 'A1', 'GET /levels/:code returns level entity');

    // Test 5: PATCH /levels/:id
    const patchRes = await request(`/levels/${createdId}`, {
      method: 'PATCH',
      body: { name: 'Level A1 - Breakthrough' },
    });
    assert(patchRes.status === 200 && patchRes.data?.data?.name === 'Level A1 - Breakthrough', 'PATCH /levels/:id updates level name');

    // Test 6: DELETE /levels/:id
    const delRes = await request(`/levels/${createdId}`, {
      method: 'DELETE',
    });
    assert(delRes.status === 200 && delRes.data?.success === true, 'DELETE /levels/:id removes level entity');

    console.log(`\n==============================================`);
    console.log(`📊 LEVEL TEST RESULTS: ${passed} passed, ${failed} failed`);
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
