// Stub run action utilities for Sprint 2
// These will later call the API gateway (/runs endpoints) and orchestrator.
// Keep signatures stable for early integration.

export type RunPollStatus = 'queued' | 'running' | 'succeeded' | 'failed';

/** Start a workflow run (stub).
 *  Returns a mock run id for now.
 */
export async function startRun(): Promise<{ runId: string }> {
  // TODO: integrate with API gateway POST /runs
  return { runId: `stub-run-${Date.now()}` };
}

/** Poll a workflow run status (stub). */
export async function pollRun(_runId: string): Promise<RunPollStatus> {
  // TODO: integrate with API gateway GET /runs/:id
  return 'succeeded';
}

/** Cancel a workflow run (stub). */
export async function cancelRun(_runId: string): Promise<void> {
  // TODO: integrate with API gateway DELETE /runs/:id or cancellation endpoint
  return;
}
