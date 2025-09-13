// DoD Verification Script for API Endpoints
// Tests that endpoints return expected shapes via HTTP calls

const testEndpoints = async () => {
  console.log('🧪 DoD Verification: Testing API Endpoint Response Shapes\n');

  try {
    // Test 1: POST /api/v1/runs
    console.log('📤 Testing POST /api/v1/runs...');
    const postResponse = await fetch('http://localhost:3000/api/v1/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowVersionId: 'test-workflow' }),
    });

    if (!postResponse.ok) {
      throw new Error(
        `POST failed: ${postResponse.status} ${postResponse.statusText}`
      );
    }

    const postData = await postResponse.json();
    console.log('✅ POST Response Status:', postResponse.status);
    console.log('✅ POST Response Shape:', JSON.stringify(postData, null, 2));

    // Validate POST response shape
    const expectedPostFields = ['id', 'status', 'createdAt'];
    const hasAllPostFields = expectedPostFields.every(
      (field) => field in postData
    );

    if (!hasAllPostFields) {
      console.log('❌ POST Response missing expected fields');
      console.log('Expected:', expectedPostFields);
      console.log('Received:', Object.keys(postData));
      return false;
    }

    if (postData.status !== 'queued') {
      console.log(
        `❌ POST Response status should be 'queued', got '${postData.status}'`
      );
      return false;
    }

    const runId = postData.id;
    console.log(`✅ POST Test Passed - Created run: ${runId}\n`);

    // Test 2: GET /api/v1/runs/:id
    console.log(`📥 Testing GET /api/v1/runs/${runId}...`);
    const getResponse = await fetch(
      `http://localhost:3000/api/v1/runs/${runId}`
    );

    if (!getResponse.ok) {
      throw new Error(
        `GET failed: ${getResponse.status} ${getResponse.statusText}`
      );
    }

    const getData = await getResponse.json();
    console.log('✅ GET Response Status:', getResponse.status);
    console.log('✅ GET Response Shape:', JSON.stringify(getData, null, 2));

    // Validate GET response shape
    const expectedGetFields = ['id', 'status', 'createdAt', 'steps', 'logs'];
    const hasAllGetFields = expectedGetFields.every(
      (field) => field in getData
    );

    if (!hasAllGetFields) {
      console.log('❌ GET Response missing expected fields');
      console.log('Expected:', expectedGetFields);
      console.log('Received:', Object.keys(getData));
      return false;
    }

    if (!Array.isArray(getData.steps)) {
      console.log('❌ GET Response steps should be an array');
      return false;
    }

    if (!Array.isArray(getData.logs)) {
      console.log('❌ GET Response logs should be an array');
      return false;
    }

    console.log(
      `✅ GET Test Passed - Status: ${getData.status}, Steps: ${getData.steps.length}, Logs: ${getData.logs.length}\n`
    );

    // Test 3: GET non-existent run (404 test)
    console.log('📥 Testing GET /api/v1/runs/non-existent...');
    const notFoundResponse = await fetch(
      'http://localhost:3000/api/v1/runs/non-existent-run'
    );

    if (notFoundResponse.status !== 404) {
      console.log(
        `❌ Expected 404 for non-existent run, got ${notFoundResponse.status}`
      );
      return false;
    }

    const errorData = await notFoundResponse.json();
    console.log('✅ 404 Response Status:', notFoundResponse.status);
    console.log('✅ 404 Response Shape:', JSON.stringify(errorData, null, 2));

    if (!errorData.error || !errorData.error.code || !errorData.error.message) {
      console.log('❌ 404 Response missing expected error structure');
      return false;
    }

    console.log('✅ 404 Test Passed - Proper error response structure\n');

    // Test 4: State Machine Progression
    console.log('🔄 Testing State Machine Progression...');

    for (let poll = 1; poll <= 4; poll++) {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms

      const pollResponse = await fetch(
        `http://localhost:3000/api/v1/runs/${runId}`
      );
      const pollData = await pollResponse.json();

      console.log(`   Poll ${poll}: Status = ${pollData.status}`);

      if (poll === 1 && pollData.status === 'running') {
        console.log('   ✅ State transition queued → running detected');
      } else if (poll >= 3 && pollData.status === 'succeeded') {
        console.log('   ✅ State transition running → succeeded detected');
        break;
      }
    }

    console.log(
      '\n🎉 DoD Verification PASSED - All endpoints return expected shapes!'
    );
    return true;
  } catch (error) {
    console.error('❌ DoD Verification FAILED:', error.message);
    return false;
  }
};

// Run the test
testEndpoints().then((success) => {
  process.exit(success ? 0 : 1);
});
