const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTPS requests
function makeRequest(method, path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = httpModule.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body,
          });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Test cases
const tests = [
  {
    name: 'Test 1: Check Smarty API Status',
    method: 'GET',
    path: '/api/address/status',
    expectedStatus: 200,
  },
  {
    name: 'Test 2: Get Address Suggestions - Full Address',
    method: 'GET',
    path: '/api/address/suggestions?search=123 Main St',
    expectedStatus: 200,
  },
  {
    name: 'Test 3: Get Address Suggestions - Partial Address',
    method: 'GET',
    path: '/api/address/suggestions?search=2800 S IH35',
    expectedStatus: 200,
  },
  {
    name: 'Test 4: Missing Search Parameter (Error)',
    method: 'GET',
    path: '/api/address/suggestions',
    expectedStatus: 400,
  },
];

// Run all tests
async function runTests() {
  console.log('🚀 Starting Smarty API Tests...\n');
  console.log('='.repeat(80));

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n📝 ${test.name}`);
      console.log(`   Method: ${test.method} ${test.path}`);

      const result = await makeRequest(test.method, test.path);

      console.log(`   Status: ${result.status}`);
      console.log(`   Response: ${JSON.stringify(result.data, null, 2).split('\n').slice(0, 20).join('\n             ')}`);

      if (result.status === test.expectedStatus) {
        console.log('   ✅ PASSED');
        passed++;
      } else {
        console.log(`   ❌ FAILED - Expected status ${test.expectedStatus}, got ${result.status}`);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ FAILED - ${error.message}`);
      failed++;
    }

    console.log('-'.repeat(80));
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 Test Results:`);
  console.log(`   Total: ${tests.length}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log('\n' + '='.repeat(80));
}

// Run tests
runTests().catch(console.error);
