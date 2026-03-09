const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
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
    name: 'Test 1: Find Nearest Pharmacies - Austin TX',
    method: 'POST',
    path: '/api/pharmacy/nearest',
    data: {
      zipcode: '78704',
    },
    expectedStatus: 200,
  },
  {
    name: 'Test 2: Find Nearest Pharmacies - Different ZIP',
    method: 'POST',
    path: '/api/pharmacy/nearest',
    data: {
      zipcode: '90001',
    },
    expectedStatus: 200,
  },
  {
    name: 'Test 3: Missing Zipcode (Error)',
    method: 'POST',
    path: '/api/pharmacy/nearest',
    data: {},
    expectedStatus: 400,
  },
  {
    name: 'Test 4: Invalid Zipcode Format (Error)',
    method: 'POST',
    path: '/api/pharmacy/nearest',
    data: {
      zipcode: 'ABC12',
    },
    expectedStatus: 400,
  },
];

// Run all tests
async function runTests() {
  console.log('🚀 Starting Nearest Pharmacy API Tests...\n');
  console.log('='.repeat(80));

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
      
      // Limit response display for readability
      const responseStr = JSON.stringify(result.data, null, 2);
      const lines = responseStr.split('\n');
      if (lines.length > 30) {
        console.log(`   Response: ${lines.slice(0, 30).join('\n             ')}`);
        console.log(`             ... (truncated, ${lines.length - 30} more lines)`);
      } else {
        console.log(`   Response: ${responseStr.split('\n').join('\n             ')}`);
      }

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
