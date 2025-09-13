'use client';

import { useState } from 'react';

export default function ApiTestPage() {
  const [runId, setRunId] = useState<string>('');
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const createRun = async () => {
    try {
      addResult('🚀 Creating new run...');
      const response = await fetch('/api/v1/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowVersionId: 'test-workflow' }),
      });

      const data = await response.json();

      if (response.ok) {
        setRunId(data.id);
        addResult(`✅ Created run: ${data.id} (status: ${data.status})`);
      } else {
        addResult(`❌ Error: ${data.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      addResult(`❌ Network error: ${error}`);
    }
  };

  const checkRun = async () => {
    if (!runId) {
      addResult('❌ No run ID available. Create a run first.');
      return;
    }

    try {
      addResult(`🔍 Checking run ${runId}...`);
      const response = await fetch(`/api/v1/runs/${runId}`);
      const data = await response.json();

      if (response.ok) {
        addResult(
          `📊 Status: ${data.status}, Steps: ${data.steps?.length || 0}, Logs: ${data.logs?.length || 0}`
        );
        if (data.status === 'succeeded') {
          addResult('🎉 Run completed successfully!');
        }
      } else {
        addResult(`❌ Error: ${data.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      addResult(`❌ Network error: ${error}`);
    }
  };

  const pollRun = async () => {
    if (!runId) {
      addResult('❌ No run ID available. Create a run first.');
      return;
    }

    addResult('🔄 Starting polling...');
    for (let i = 1; i <= 5; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      await checkRun();
    }
  };

  const clearResults = () => {
    setResults([]);
    setRunId('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">API Test Page</h1>

      <div className="space-y-4 mb-6">
        <button
          onClick={createRun}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
        >
          Create Run (POST /api/v1/runs)
        </button>

        <button
          onClick={checkRun}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-2"
          disabled={!runId}
        >
          Check Run (GET /api/v1/runs/:id)
        </button>

        <button
          onClick={pollRun}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded mr-2"
          disabled={!runId}
        >
          Poll Run (5 times)
        </button>

        <button
          onClick={clearResults}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Clear Results
        </button>
      </div>

      {runId && (
        <div className="mb-6 p-4 bg-blue-50 rounded">
          <strong>Current Run ID:</strong> {runId}
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold mb-4">Results:</h2>
        <div className="space-y-1 font-mono text-sm max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-gray-500">
              No results yet. Click "Create Run" to start testing.
            </p>
          ) : (
            results.map((result, index) => (
              <div key={index} className="border-b border-gray-200 pb-1">
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>
          <strong>Expected behavior:</strong>
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Create Run: Returns run ID with "queued" status</li>
          <li>First poll: Status changes to "running"</li>
          <li>Third poll: Status changes to "succeeded"</li>
          <li>Steps and logs are populated throughout the process</li>
        </ul>
      </div>
    </div>
  );
}
