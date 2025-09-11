/**
 * Run service: starts engine executions and polls for status
 */
import EngineClient from '@automateos/sdk-engine/client';
import { compileDag } from './compileDag';
import { Workflow } from '@automateos/workflow-schema';
import { maskValue } from './masking';

let engine: EngineClient = new EngineClient(
  process.env.ENGINE_BASE || 'http://localhost:8081'
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
}
const runs = new Map<string, RunRecord>();

export function getRun(id: string): RunRecord | undefined {
  return runs.get(id);
}

export async function startRunWithDag(
  runId: string,
  dag: { nodes: any[] },
  idempotencyKey?: string
) {
  runs.set(runId, { id: runId, status: 'queued', steps: [], logs: [] });
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
    schedulePoll(runId, engineRunId);
  } catch (e: any) {
    const rec = runs.get(runId)!;
    rec.status = 'failed';
    rec.logs.push({
      ts: new Date().toISOString(),
      level: 'error',
      msg: `engine.execute failed: ${e.message}`,
    });
    if (idempotencyKey) {
      rec.logs.push({
        ts: new Date().toISOString(),
        level: 'debug',
        msg: `idempotencyKey=${maskValue(idempotencyKey)}`,
      });
    }
  }
}

export async function startRun(
  runId: string,
  graph: Workflow,
  idempotencyKey?: string
) {
  const dag = compileDag(graph);
  runs.set(runId, { id: runId, status: 'queued', steps: [], logs: [] });
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
    schedulePoll(runId, engineRunId);
  } catch (e: any) {
    const rec = runs.get(runId)!;
    rec.status = 'failed';
    rec.logs.push({
      ts: new Date().toISOString(),
      level: 'error',
      msg: `engine.execute failed: ${e.message}`,
    });
    if (idempotencyKey) {
      rec.logs.push({
        ts: new Date().toISOString(),
        level: 'debug',
        msg: `idempotencyKey=${maskValue(idempotencyKey)}`,
      });
    }
  }
}

function schedulePoll(runId: string, engineRunId: string) {
  const interval = Number(process.env.POLL_INTERVAL_MS || '1000');
  setTimeout(
    () =>
      pollOnce(runId, engineRunId).catch(() =>
        schedulePoll(runId, engineRunId)
      ),
    interval
  );
}

async function pollOnce(runId: string, engineRunId: string) {
  const status = await engine.getRun(engineRunId);
  const rec = runs.get(runId);
  if (!rec) return;
  rec.steps = status.steps;
  // Merge logs (naive append, dedupe by ts+msg later)
  rec.logs = status.logs;
  rec.status = status.status;
  if (status.status === 'running') schedulePoll(runId, engineRunId);
}
