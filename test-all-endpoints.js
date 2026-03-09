const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
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

// All test cases
const tests = [
  // 1. Health Check
  {
    name: '1. Health Check',
    method: 'GET',
    path: '/health',
    data: null,
    expectedStatus: 200,
    description: 'Basic server health check',
  },

  // 2. Pharmacy Check - Strong Match
  {
    name: '2. Pharmacy Check - Strong Match Test',
    method: 'POST',
    path: '/api/pharmacy/check',
    data: {
      name: 'AVITA PHARMACY 1034',
      phoneNumber: '(512) 213-4030',
      address: {
        streetAddress: '2800 S IH35 FRONTAGE ROAD SUITE 105',
        zipcode: '78704',
        state: 'TX'
      }
    },
    expectedStatus: 200,
    description: 'Test pharmacy matching with real data',
  },

  // 3. Pharmacy Check - No Match
  {
    name: '3. Pharmacy Check - No Match',
    method: 'POST',
    path: '/api/pharmacy/check',
    data: {
      name: 'Fake Pharmacy',
      phoneNumber: '(999) 999-9999',
      address: {
        streetAddress: '999 Fake Street',
        zipcode: '99999',
        state: 'XX'
      }
    },
    expectedStatus: 200,
    description: 'Test with non-existent pharmacy data',
  },

  // 4. Pharmacy Check - Validation Error
  {
    name: '4. Pharmacy Check - Validation Error',
    method: 'POST',
    path: '/api/pharmacy/check',
    data: {
      name: 'Test',
      phoneNumber: 'invalid-phone',
      address: {
        streetAddress: '123 Main St',
        zipcode: '78704',
        state: 'TX'
      }
    },
    expectedStatus: 400,
    description: 'Test validation with invalid phone format',
  },

  // 5. Nearest Pharmacy - Austin TX
  {
    name: '5. Nearest Pharmacy - Austin TX',
    method: 'POST',
    path: '/api/pharmacy/nearest',
    data: {
      zipcode: '78704'
    },
    expectedStatus: 200,
    description: 'Find nearest pharmacies in Austin, TX',
  },

  // 6. Nearest Pharmacy - Different ZIP
  {
    name: '6. Nearest Pharmacy - Different ZIP',
    method: 'POST',
    path: '/api/pharmacy/nearest',
    data: {
      zipcode: '90210'
    },
    expectedStatus: 200,
    description: 'Find nearest pharmacies in different area',
  },

  // 7. Nearest Pharmacy - Missing Zipcode
  {
    name: '7. Nearest Pharmacy - Missing Zipcode',
    method: 'POST',
    path: '/api/pharmacy/nearest',
    data: {},
    expectedStatus: 400,
    description: 'Test validation error for missing zipcode',
  },

  // 8. Nearest Pharmacy - Invalid Zipcode
  {
    name: '8. Nearest Pharmacy - Invalid Zipcode',
    method: 'POST',
    path: '/api/pharmacy/nearest',
    data: {
      zipcode: 'ABC12'
    },
    expectedStatus: 400,
    description: 'Test validation error for invalid zipcode format',
  },

  // 9. Smarty API Status Check
  {
    name: '9. Smarty API Status Check',
    method: 'GET',
    path: '/api/address/status',
    data: null,
    expectedStatus: 200,
    description: 'Check if Smarty API is configured',
  },

  // 10. Address Suggestions - Valid Search
  {
    name: '10. Address Suggestions - Valid Search',
    method: 'GET',
    path: '/api/address/suggestions?search=123 Main St',
    data: null,
    expectedStatus: [200, 500], // 500 if Smarty credits exhausted
    description: 'Get address suggestions from Smarty API',
  },

  // 11. Address Suggestions - Missing Search
  {
    name: '11. Address Suggestions - Missing Search',
    method: 'GET',
    path: '/api/address/suggestions',
    data: null,
    expectedStatus: 400,
    description: 'Test validation error for missing search parameter',
  },
];

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Complete API Test Suite...\n');
  console.log('='.repeat(100));
  console.log(`Testing ${tests.length} endpoints on ${BASE_URL}`);
  console.log('='.repeat(100));

  let passed = 0;
  let failed = 0;
  let results = [];

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    
    try {
      console.log(`\n📝 ${test.name}`);
      console.log(`   Description: ${test.description}`);
      console.log(`   Method: ${test.method} ${test.path}`);
      
      if (test.data) {
        console.log(`   Request: ${JSON.stringify(test.data, null, 2).split('\n').join('\n            ')}`);
      }

      const startTime = Date.now();
      const result = await makeRequest(test.method, test.path, test.data);
      const duration = Date.now() - startTime;

      console.log(`   Status: ${result.status} (${duration}ms)`);
      
      // Handle response display
      if (result.data && typeof result.data === 'object') {
        const responseStr = JSON.stringify(result.data, null, 2);
        const lines = responseStr.split('\n');
        
        if (lines.length > 20) {
          console.log(`   Response: ${lines.slice(0, 20).join('\n             ')}`);
          console.log(`             ... (truncated, showing first 20 lines)`);
        } else {
          console.log(`   Response: ${responseStr.split('\n').join('\n             ')}`);
        }
      } else {
        console.log(`   Response: ${result.data}`);
      }

      // Check if test passed
      const expectedStatuses = Array.isArray(test.expectedStatus) ? test.expectedStatus : [test.expectedStatus];
      const testPassed = expectedStatuses.includes(result.status);

      if (testPassed) {
        console.log('   ✅ PASSED');
        passed++;
        results.push({ test: test.name, status: 'PASSED', responseStatus: result.status });
      } else {
        console.log(`   ❌ FAILED - Expected status ${test.expectedStatus}, got ${result.status}`);
        failed++;
        results.push({ test: test.name, status: 'FAILED', responseStatus: result.status, expected: test.expectedStatus });
      }

    } catch (error) {
      console.log(`   ❌ FAILED - ${error.message}`);
      failed++;
      results.push({ test: test.name, status: 'ERROR', error: error.message });
    }

    console.log('-'.repeat(100));
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Final summary
  console.log('\n' + '='.repeat(100));
  console.log(`\n📊 FINAL TEST RESULTS:`);
  console.log(`   Total Tests: ${tests.length}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  
  console.log('\n📋 DETAILED RESULTS:');
  results.forEach((result, index) => {
    const icon = result.status === 'PASSED' ? '✅' : '❌';
    console.log(`   ${icon} ${index + 1}. ${result.test} - ${result.status}`);
  });

  console.log('\n' + '='.repeat(100));
  
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Your API is working perfectly!');
  } else {
    console.log(`⚠️  ${failed} test(s) failed. Check the details above.`);
  }
  
  console.log('\n' + '='.repeat(100));
}

// Run tests
runAllTests().catch(console.error);