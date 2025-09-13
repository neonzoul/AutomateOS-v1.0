#!/usr/bin/env node

/**
 * Mock API Gateway for E2E Testing
 *
 * A simple Express server that mocks the API gateway responses
 * for reliable E2E testing in CI environments where real services
 * might not be available or reliable.
 *
 * Usage:
 *   node mock-gateway.js [port]
 *
 * Default port: 3001
 */

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.MOCK_GATEWAY_PORT || process.argv[2] || 3001;

// Middleware
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(express.json());

// Store for mock runs
const mockRuns = new Map();

// Mock run creation
app.post('/v1/runs', (req, res) => {
  const runId = `mock-run-${Date.now()}`;

  console.log(`[MOCK] Creating run ${runId}`, {
    body: req.body,
    timestamp: new Date().toISOString(),
  });

  // Simulate successful run creation
  mockRuns.set(runId, {
    id: runId,
    status: 'queued',
    startedAt: new Date().toISOString(),
    finishedAt: null,
    steps: [],
    logs: [
      {
        ts: new Date().toISOString(),
        level: 'info',
        msg: `Mock: Run ${runId} created`,
      },
    ],
  });

  // Simulate async processing - update status after a delay
  setTimeout(() => {
    const run = mockRuns.get(runId);
    if (run) {
      run.status = 'running';
      run.logs.push({
        ts: new Date().toISOString(),
        level: 'info',
        msg: 'Mock: Workflow execution started',
      });
    }
  }, 500);

  setTimeout(() => {
    const run = mockRuns.get(runId);
    if (run) {
      run.status = 'succeeded';
      run.finishedAt = new Date().toISOString();
      run.steps = [
        { id: 'step-1', nodeId: 'start', status: 'succeeded', durationMs: 5 },
        { id: 'step-2', nodeId: 'http', status: 'succeeded', durationMs: 250 },
      ];
      run.logs.push(
        {
          ts: new Date().toISOString(),
          level: 'info',
          msg: 'Mock: HTTP request to https://httpbin.org/get succeeded (200)',
        },
        {
          ts: new Date().toISOString(),
          level: 'info',
          msg: 'Mock: Workflow completed successfully',
        }
      );
    }
  }, 2000);

  res.status(202).json({ runId });
});

// Mock run status retrieval
app.get('/v1/runs/:runId', (req, res) => {
  const { runId } = req.params;
  const run = mockRuns.get(runId);

  if (!run) {
    return res.status(404).json({
      error: {
        code: 'RUN_NOT_FOUND',
        message: `Run ${runId} not found`,
      },
    });
  }

  console.log(`[MOCK] Returning status for run ${runId}: ${run.status}`);
  res.json(run);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'mock-api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    activeRuns: mockRuns.size,
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('[MOCK] Error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Mock gateway internal error',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.path} not found in mock gateway`,
    },
  });
});

app.listen(port, () => {
  console.log(`🚀 Mock API Gateway running on http://localhost:${port}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   POST /v1/runs - Create workflow run`);
  console.log(`   GET  /v1/runs/:id - Get run status`);
  console.log(`   GET  /health - Health check`);
  console.log(`💡 Use Ctrl+C to stop`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Mock gateway shutting down...');
  process.exit(0);
});

module.exports = app;
