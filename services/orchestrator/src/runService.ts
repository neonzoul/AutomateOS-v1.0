/**
 * Run service: starts engine executions and polls for status
 * Enhanced with proper logging, status mapping, error handling, and telemetry
 */
import EngineClient from '@automateos/sdk-engine/client';
import { compileDag } from './compileDag';
import { Workflow } from '@automateos/workflow-schema';
import { maskValue } from './masking';
import { withSpan, startSpan, endSpan, recordError } from './telemetry';

// Enhanced logger function
function logEvent(
  level: string,
  msg: string,
  meta: Record<string, unknown> = {}
) {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level,
      msg,
      component: 'RunService',
      ...meta,
    })
  );
}

let engine: EngineClient = new EngineClient(
  process.env.ENGINE_BASE || 'http://localhost:8081',
  fetch,
  {
    maxRetries: 3,
    baseDelayMs: 300,
    executeTimeoutMs: 15000,
    getRunTimeoutMs: 10000,
    logger: logEvent,
  }
);

// Test-only hook to inject a mocked EngineClient
export function __setEngineClientForTests(mock: EngineClient) {
  engine = mock;
}

// In-memory run store (replace with Postgres later)
interface RunRecord {
  id: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  engineRunId?: string;
  steps: { id: string; status: string; durationMs?: number }[];
  logs: { ts: string; level: string; msg: string }[];
  createdAt: string;
  updatedAt: string;
  idempotencyKey?: string;
}
const runs = new Map<string, RunRecord>();

// Status mapping utility
function normalizeEngineStatus(
  engineStatus: string
): 'queued' | 'running' | 'succeeded' | 'failed' {
  switch (engineStatus.toLowerCase()) {
    case 'queued':
    case 'pending':
      return 'queued';
    case 'running':
    case 'executing':
      return 'running';
    case 'succeeded':
    case 'completed':
    case 'success':
      return 'succeeded';
    case 'failed':
    case 'error':
    case 'cancelled':
    case 'timeout':
      return 'failed';
    default:
      logEvent('warn', 'unknown_engine_status', { engineStatus });
      return 'failed';
  }
}

export function getRun(id: string): RunRecord | undefined {
  return runs.get(id);
}

function createRunRecord(runId: string, idempotencyKey?: string): RunRecord {
  const now = new Date().toISOString();
  return {
    id: runId,
    status: 'queued',
    steps: [],
    logs: [],
    createdAt: now,
    updatedAt: now,
    idempotencyKey,
  };
}

export async function startRunWithDag(
  runId: string,
  dag: { nodes: any[] },
  idempotencyKey?: string
) {
  return withSpan(
    'orchestrator.startRunWithDag',
    async (spanId) => {
      const record = createRunRecord(runId, idempotencyKey);
      runs.set(runId, record);

      logEvent('info', 'run.start', {
        runId,
        spanId,
        nodeCount: dag.nodes.length,
        hasIdempotencyKey: Boolean(idempotencyKey),
        idempotencyKeyMasked: idempotencyKey
          ? maskValue(idempotencyKey)
          : undefined,
      });

      try {
        const { engineRunId } = await engine.execute({
          runId,
          dag,
          env: {},
          idempotencyKey,
        });

        const rec = runs.get(runId)!;
        rec.status = 'running';
        rec.engineRunId = engineRunId;
        rec.updatedAt = new Date().toISOString();

        logEvent('info', 'run.engine_accepted', {
          runId,
          spanId,
          engineRunId,
          idempotencyKeyMasked: idempotencyKey
            ? maskValue(idempotencyKey)
            : undefined,
        });

        schedulePoll(runId, engineRunId);
      } catch (e: any) {
        const rec = runs.get(runId)!;
        rec.status = 'failed';
        rec.updatedAt = new Date().toISOString();
        rec.logs.push({
          ts: new Date().toISOString(),
          level: 'error',
          msg: `engine.execute failed: ${e.message}`,
        });

        recordError(spanId, e);
        logEvent('error', 'run.engine_failed', {
          runId,
          spanId,
          error: e.message,
          idempotencyKeyMasked: idempotencyKey
            ? maskValue(idempotencyKey)
            : undefined,
        });
        throw e;
      }
    },
    { runId, nodeCount: dag.nodes.length }
  );
}

export async function startRun(
  runId: string,
  graph: Workflow,
  idempotencyKey?: string
) {
  return withSpan(
    'orchestrator.startRun',
    async (spanId) => {
      const dag = compileDag(graph);
      const record = createRunRecord(runId, idempotencyKey);
      runs.set(runId, record);

      logEvent('info', 'run.start_with_graph', {
        runId,
        spanId,
        nodeCount: graph.nodes.length,
        edgeCount: graph.edges?.length || 0,
        hasIdempotencyKey: Boolean(idempotencyKey),
        idempotencyKeyMasked: idempotencyKey
          ? maskValue(idempotencyKey)
          : undefined,
      });

      try {
        const { engineRunId } = await engine.execute({
          runId,
          dag,
          env: {},
          idempotencyKey,
        });

        const rec = runs.get(runId)!;
        rec.status = 'running';
        rec.engineRunId = engineRunId;
        rec.updatedAt = new Date().toISOString();

        logEvent('info', 'run.engine_accepted', {
          runId,
          spanId,
          engineRunId,
          idempotencyKeyMasked: idempotencyKey
            ? maskValue(idempotencyKey)
            : undefined,
        });

        schedulePoll(runId, engineRunId);
      } catch (e: any) {
        const rec = runs.get(runId)!;
        rec.status = 'failed';
        rec.updatedAt = new Date().toISOString();
        rec.logs.push({
          ts: new Date().toISOString(),
          level: 'error',
          msg: `engine.execute failed: ${e.message}`,
        });

        recordError(spanId, e);
        logEvent('error', 'run.engine_failed', {
          runId,
          spanId,
          error: e.message,
          idempotencyKeyMasked: idempotencyKey
            ? maskValue(idempotencyKey)
            : undefined,
        });
        throw e;
      }
    },
    {
      runId,
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges?.length || 0,
    }
  );
}

function schedulePoll(runId: string, engineRunId: string) {
  const interval = Number(process.env.POLL_INTERVAL_MS || '1000');
  setTimeout(
    () =>
      pollOnce(runId, engineRunId).catch((e) => {
        logEvent('warn', 'poll.error', {
          runId,
          engineRunId,
          error: e.message,
        });
        schedulePoll(runId, engineRunId);
      }),
    interval
  );
}

async function pollOnce(runId: string, engineRunId: string) {
  const spanId = startSpan('orchestrator.pollOnce', { runId, engineRunId });

  try {
    const status = await engine.getRun(engineRunId, runId);
    const rec = runs.get(runId);
    if (!rec) {
      logEvent('warn', 'poll.run_not_found', { runId, engineRunId, spanId });
      endSpan(spanId, { success: false, error: 'run_not_found' });
      return;
    }

    const prevStatus = rec.status;
    rec.steps = status.steps;
    rec.logs = status.logs;
    rec.status = normalizeEngineStatus(status.status);
    rec.updatedAt = new Date().toISOString();

    // Log status changes
    if (prevStatus !== rec.status) {
      logEvent('info', 'run.status_change', {
        runId,
        engineRunId,
        spanId,
        prevStatus,
        newStatus: rec.status,
        stepCount: rec.steps.length,
        logCount: rec.logs.length,
      });
    }

    if (rec.status === 'running') {
      schedulePoll(runId, engineRunId);
    } else {
      logEvent('info', 'run.completed', {
        runId,
        engineRunId,
        spanId,
        finalStatus: rec.status,
        stepCount: rec.steps.length,
        logCount: rec.logs.length,
      });
    }

    endSpan(spanId, { success: true });
  } catch (e: any) {
    recordError(spanId, e);
    logEvent('error', 'poll.failed', {
      runId,
      engineRunId,
      spanId,
      error: e.message,
    });
    endSpan(spanId, { success: false, error: e.message });
    throw e;
  }
}
