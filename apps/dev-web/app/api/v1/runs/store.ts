/**
 * In-memory store for mock run state management.
 * Simulates state transitions: queued → running → succeeded
 */

type RunStatus = 'queued' | 'running' | 'succeeded' | 'failed';

interface MockRun {
  id: string;
  status: RunStatus;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  pollCount: number;
  logs: Array<{
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    nodeId?: string;
  }>;
  steps: Array<{
    id: string;
    nodeId: string;
    status: 'pending' | 'running' | 'succeeded' | 'failed';
    startedAt?: string;
    finishedAt?: string;
    durationMs?: number;
  }>;
}

// Global in-memory storage with development mode protection
declare global {
  var __mockRunStore: Map<string, MockRun> | undefined;
}

// Use global store to persist across Next.js module reloads in development
const runs = globalThis.__mockRunStore ?? new Map<string, MockRun>();
if (!globalThis.__mockRunStore) {
  globalThis.__mockRunStore = runs;
}

/**
 * Create a new run with initial state
 */
export function createRun(workflow?: unknown): MockRun {
  const id = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  const run: MockRun = {
    id,
    status: 'queued',
    createdAt: now,
    pollCount: 0,
    logs: [
      {
        timestamp: now,
        level: 'info',
        message: 'Run queued for execution',
      },
    ],
    steps: [
      {
        id: 'step_1',
        nodeId: 'start',
        status: 'pending',
      },
      {
        id: 'step_2',
        nodeId: 'http_1',
        status: 'pending',
      },
    ],
  };

  runs.set(id, run);
  console.log(`[STORE] Created run ${id}, total runs: ${runs.size}`);
  return run;
} /**
 * Get a run by ID and advance its state based on poll count
 */
export function getRun(id: string): MockRun | null {
  console.log(`[STORE] Looking for run ${id}, total runs: ${runs.size}`);
  console.log(`[STORE] Available runs: ${Array.from(runs.keys()).join(', ')}`);

  const run = runs.get(id);
  if (!run) {
    console.log(`[STORE] Run ${id} not found`);
    return null;
  }

  // Increment poll count
  run.pollCount++;

  // State machine: queued → running → succeeded
  const now = new Date().toISOString();

  if (run.status === 'queued' && run.pollCount >= 1) {
    // Transition to running after first poll
    run.status = 'running';
    run.startedAt = now;
    run.steps[0].status = 'running';
    run.steps[0].startedAt = now;
    run.logs.push({
      timestamp: now,
      level: 'info',
      message: 'Execution started',
      nodeId: 'start',
    });
  } else if (run.status === 'running' && run.pollCount >= 3) {
    // Transition to succeeded after 3rd poll
    run.status = 'succeeded';
    run.finishedAt = now;

    // Complete all steps
    run.steps.forEach((step, idx) => {
      if (step.status !== 'succeeded') {
        step.status = 'succeeded';
        step.finishedAt = now;
        step.durationMs = 150 + idx * 50; // Mock duration
        run.logs.push({
          timestamp: now,
          level: 'info',
          message: `Node ${step.nodeId} completed successfully`,
          nodeId: step.nodeId,
        });
      }
    });

    run.logs.push({
      timestamp: now,
      level: 'info',
      message: 'Workflow execution completed successfully',
    });
  }

  return run;
}

/**
 * List all runs (for debugging)
 */
export function listRuns(): MockRun[] {
  return Array.from(runs.values());
}
