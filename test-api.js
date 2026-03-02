const http = require('http');
const https = require('https');

const BASE_URL = 'https://mcm-pharmacy-production.up.railway.app';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
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

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test cases
const tests = [
  {
    name: 'Test: Pharmacy Check',
    method: 'POST',
    path: '/api/pharmacy/check',
    data: {
      name: 'WESTMORELAND PHARMACY #1',
      phoneNumber: '+12146998072',
      address: {
        streetAddress: '115 WEST GRAND ST',
        zipcode: '75491',
        state: 'TX',
      },
    },
    expectedStatus: 200,
  },
];

// Run all tests
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n📝 ${test.name}`);
      console.log(`   Method: ${test.method} ${test.path}`);
      
      if (test.data) {
        console.log(`   Request: ${JSON.stringify(test.data, null, 2).split('\n').join('\n            ')}`);
      }

      const result = await makeRequest(test.method, test.path, test.data);

      console.log(`   Status: ${result.status}`);
      console.log(`   Response: ${JSON.stringify(result.data, null, 2).split('\n').join('\n             ')}`);

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

    console.log('-'.repeat(60));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Test Results:`);
  console.log(`   Total: ${tests.length}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log('\n' + '='.repeat(60));
}

// Run tests
runTests().catch(console.error);
