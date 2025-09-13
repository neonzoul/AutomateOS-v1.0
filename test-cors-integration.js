// Simple CORS test from Node.js context (simulating browser)
// Using built-in fetch (Node.js 18+)

async function testCorsIntegration() {
  console.log('Testing CORS integration...');

  const payload = {
    graph: {
      nodes: [
        { id: 'start_1', type: 'start', config: {} },
        {
          id: 'http_1',
          type: 'http',
          config: { url: 'https://httpbin.org/get', method: 'GET' },
        },
      ],
      edges: [{ source: 'start_1', target: 'http_1' }],
    },
  };

  try {
    console.log('Sending request to:', 'http://localhost:8080/v1/runs');

    const response = await fetch('http://localhost:8080/v1/runs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': `node-test-${Date.now()}`,
        Origin: 'http://localhost:3000', // Simulate browser origin
      },
      body: JSON.stringify(payload),
    });

    console.log('Response status:', response.status);
    console.log(
      'Response headers:',
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const result = await response.json();
    console.log('Success! Run created:', result);

    // Poll the run status
    if (result.runId) {
      console.log('Polling run status...');
      await pollRunStatus(result.runId);
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

async function pollRunStatus(runId) {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`http://localhost:8080/v1/runs/${runId}`);
      const data = await response.json();

      console.log(
        `Poll ${attempts + 1}: Status = ${data.status}, Steps = ${data.steps?.length || 0}, Logs = ${data.logs?.length || 0}`
      );

      if (data.status === 'succeeded' || data.status === 'failed') {
        console.log('Final result:', JSON.stringify(data, null, 2));
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    } catch (error) {
      console.error('Poll error:', error.message);
      break;
    }
  }
}

testCorsIntegration();
