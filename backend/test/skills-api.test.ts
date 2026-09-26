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
  console.log('🧪 Starting Skill CRUD Automated HTTP Verification Suite...\n');
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
    // Test 1: POST /skills (Create Speaking)
    const createRes = await request('/skills', {
      method: 'POST',
      body: {
        code: 'speaking-skill',
        name: 'Speaking',
        slug: 'speaking-skill',
        description: 'Verbal communication and pronunciation skills',
      },
    });
    assert(createRes.status === 201 && createRes.data.success === true, 'POST /skills creates new skill');
    const createdId = createRes.data?.data?.id;

    // Test 2: POST /skills Duplicate Code (409 Conflict)
    const dupRes = await request('/skills', {
      method: 'POST',
      body: {
        code: 'speaking-skill',
        name: 'Speaking Duplicate',
        slug: 'speaking-skill-dup',
      },
    });
    assert(dupRes.status === 409, 'POST /skills duplicate code returns 409 Conflict');

    // Test 3: GET /skills (List)
    const listRes = await request('/skills');
    assert(listRes.status === 200 && Array.isArray(listRes.data?.data), 'GET /skills returns list of skills');

    // Test 4: GET /skills/:id
    const getOneRes = await request(`/skills/${createdId}`);
    assert(getOneRes.status === 200 && getOneRes.data?.data?.code === 'speaking-skill', 'GET /skills/:id returns skill entity');

    // Test 5: PATCH /skills/:id
    const patchRes = await request(`/skills/${createdId}`, {
      method: 'PATCH',
      body: { name: 'Speaking & Fluency' },
    });
    assert(patchRes.status === 200 && patchRes.data?.data?.name === 'Speaking & Fluency', 'PATCH /skills/:id updates skill name');

    // Test 6: DELETE /skills/:id
    const delRes = await request(`/skills/${createdId}`, {
      method: 'DELETE',
    });
    assert(delRes.status === 200 && delRes.data?.success === true, 'DELETE /skills/:id removes skill entity');

    console.log(`\n==============================================`);
    console.log(`📊 SKILL TEST RESULTS: ${passed} passed, ${failed} failed`);
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
