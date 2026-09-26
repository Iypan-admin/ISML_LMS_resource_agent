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
  console.log('🧪 Starting Course CRUD Automated HTTP Verification Suite...\n');
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
    // Setup prerequisite: Create language 'de' if not exists or list existing
    let langRes = await request('/languages?active=true');
    let langId = langRes.data?.data?.[0]?.id;

    if (!langId) {
      const createLang = await request('/languages', {
        method: 'POST',
        body: { code: 'de', name: 'German', nativeName: 'Deutsch', flagEmoji: '🇩🇪' },
      });
      langId = createLang.data?.data?.id;
    }

    // Test 1: POST /courses (Create course)
    const createRes = await request('/courses', {
      method: 'POST',
      body: {
        languageId: langId,
        code: 'de-gen-101',
        title: 'General German 101',
        description: 'Introductory German course',
      },
    });
    assert(createRes.status === 201 && createRes.data.success === true, 'POST /courses creates new course with 201');
    const createdId = createRes.data?.data?.id;

    // Test 2: POST /courses Duplicate Code for Same Language (409 Conflict)
    const dupRes = await request('/courses', {
      method: 'POST',
      body: {
        languageId: langId,
        code: 'de-gen-101',
        title: 'General German Duplicate',
      },
    });
    assert(dupRes.status === 409, 'POST /courses duplicate code returns 409 Conflict');

    // Test 3: GET /courses (List)
    const listRes = await request('/courses');
    assert(listRes.status === 200 && Array.isArray(listRes.data?.data), 'GET /courses returns list of courses with 200');

    // Test 4: GET /courses/:id
    const getOneRes = await request(`/courses/${createdId}`);
    assert(getOneRes.status === 200 && getOneRes.data?.data?.code === 'de-gen-101', 'GET /courses/:id returns course entity');

    // Test 5: PATCH /courses/:id
    const patchRes = await request(`/courses/${createdId}`, {
      method: 'PATCH',
      body: { title: 'General German 101 (Updated)' },
    });
    assert(patchRes.status === 200 && patchRes.data?.data?.title === 'General German 101 (Updated)', 'PATCH /courses/:id updates title');

    // Test 6: DELETE /courses/:id
    const delRes = await request(`/courses/${createdId}`, {
      method: 'DELETE',
    });
    assert(delRes.status === 200 && delRes.data?.success === true, 'DELETE /courses/:id removes course');

    console.log(`\n==============================================`);
    console.log(`📊 COURSE TEST RESULTS: ${passed} passed, ${failed} failed`);
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
