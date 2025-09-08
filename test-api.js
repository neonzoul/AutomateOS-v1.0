const https = require('http');

async function testAPI() {
  console.log('🧪 Testing Mock API Endpoints\n');

  try {
    // Test POST /api/v1/runs
    console.log('📤 Testing POST /api/v1/runs...');
    const createRunResponse = await fetch('http://localhost:3000/api/v1/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowVersionId: 'test-workflow' }),
    });

    if (!createRunResponse.ok) {
      throw new Error(`POST failed: ${createRunResponse.status}`);
    }

    const runData = await createRunResponse.json();
    console.log(`✅ Created run: ${runData.id}`);
    console.log(`   Status: ${runData.status}`);
    console.log(`   Created: ${runData.createdAt}\n`);

    const runId = runData.id;

    // Test GET /api/v1/runs/:id with polling
    console.log('📥 Testing GET /api/v1/runs/:id with polling...');

    for (let i = 1; i <= 4; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

      console.log(`   Poll ${i}:`);
      const getRunResponse = await fetch(
        `http://localhost:3000/api/v1/runs/${runId}`
      );

      if (!getRunResponse.ok) {
        throw new Error(`GET failed: ${getRunResponse.status}`);
      }

      const pollData = await getRunResponse.json();
      console.log(`     Status: ${pollData.status}`);
      console.log(`     Steps: ${pollData.steps?.length || 0}`);
      console.log(`     Logs: ${pollData.logs?.length || 0}`);

      if (pollData.status === 'succeeded') {
        console.log('     🎉 Run completed successfully!');
        break;
      }
    }

    console.log('\n✅ All tests passed! API endpoints are working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAPI();
