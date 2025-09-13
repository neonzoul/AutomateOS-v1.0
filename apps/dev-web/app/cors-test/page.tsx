'use client';

import { useState } from 'react';

export default function CorsTestPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    setResult('');

    try {
      // Test basic health endpoint first
      const healthResponse = await fetch('http://localhost:8080/health');
      const healthData = await healthResponse.text();

      setResult(
        (prev) =>
          prev + `Health check: ${healthResponse.status} - ${healthData}\n`
      );

      // Test the actual workflow endpoint with proper headers
      const workflowPayload = {
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

      const runResponse = await fetch('http://localhost:8080/v1/runs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': `cors-test-${Date.now()}`,
        },
        body: JSON.stringify(workflowPayload),
      });

      const runData = await runResponse.json();
      setResult(
        (prev) =>
          prev +
          `\nWorkflow run: ${runResponse.status} - ${JSON.stringify(runData, null, 2)}`
      );
    } catch (error) {
      setResult(
        (prev) =>
          prev +
          `\nError: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">CORS Test Page</h1>
      <button
        onClick={testApiConnection}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>

      <pre className="mt-4 p-4 bg-gray-100 rounded text-sm whitespace-pre-wrap">
        {result || 'Click the button to test API connectivity'}
      </pre>
    </div>
  );
}
