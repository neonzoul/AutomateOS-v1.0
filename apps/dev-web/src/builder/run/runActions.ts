// Run action utilities for Sprint 2
// Integrates with API gateway (/runs endpoints) for workflow execution

import { useBuilderStore } from '../../core/state';

export type RunPollStatus = 'queued' | 'running' | 'succeeded' | 'failed';

export type RunResponse = {
  id: string;
  status: RunPollStatus;
  createdAt: string;
  finishedAt?: string;
  logs?: Array<
    | string
    | {
        timestamp: string;
        level: 'info' | 'warn' | 'error';
        message: string;
        nodeId?: string;
      }
  >;
};

/**
 * Start a workflow run by posting to API gateway
 * Sets run status and begins polling
 */
export async function startRun(
  workflowJson: unknown
): Promise<{ runId: string }> {
  const { setRunStatus, appendLog, resetRun } = useBuilderStore.getState();

  try {
    // Reset previous run state
    resetRun();
    appendLog('Starting workflow run...');

    // Call API gateway to start run
    const response = await fetch('/api/v1/runs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workflowJson),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to start run: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    const runId = result.id;

    // Update state with run ID and initial status
    setRunStatus('queued', runId);
    appendLog(`Run ${runId} created and queued`);

    // Start polling for status updates
    pollRun(runId);

    return { runId };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    appendLog(`Error starting run: ${message}`);
    setRunStatus('failed');
    throw error;
  }
}

/**
 * Poll a workflow run status with exponential backoff
 * Updates store state as run progresses
 */
export async function pollRun(runId: string): Promise<void> {
  const { setRunStatus, appendLog } = useBuilderStore.getState();

  let pollCount = 0;
  let lastLogCount = 0; // Track how many logs we've seen
  const maxPolls = 30; // Prevent infinite polling
  const baseInterval = 1500; // 1.5 seconds

  const poll = async (): Promise<void> => {
    try {
      pollCount++;

      if (pollCount > maxPolls) {
        appendLog('Polling timeout reached');
        setRunStatus('failed');
        return;
      }

      const response = await fetch(`/api/v1/runs/${runId}`);

      if (!response.ok) {
        throw new Error(`Failed to poll run: ${response.status}`);
      }

      const run: RunResponse = await response.json();

      // Update status
      setRunStatus(run.status);

      // Add only new logs (after lastLogCount)
      if (run.logs && run.logs.length > lastLogCount) {
        const newLogs = run.logs.slice(lastLogCount);
        newLogs.forEach((logObj) => {
          // Convert log object to string format
          const logMessage =
            typeof logObj === 'string'
              ? logObj
              : `[${logObj.level?.toUpperCase() || 'INFO'}] ${logObj.message}`;
          appendLog(logMessage);
        });
        lastLogCount = run.logs.length;
      }

      // Continue polling if still running
      if (run.status === 'queued' || run.status === 'running') {
        // Exponential backoff: increase interval slightly each time
        const nextInterval = Math.min(
          baseInterval * Math.pow(1.2, pollCount - 1),
          5000
        );
        setTimeout(poll, nextInterval);
      } else {
        // Final status reached
        if (run.status === 'succeeded') {
          appendLog('Run completed successfully');
        } else if (run.status === 'failed') {
          appendLog('Run failed');
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      appendLog(`Polling error: ${message}`);
      setRunStatus('failed');
    }
  };

  // Start the polling loop
  poll();
}

/** Cancel a workflow run (stub for now). */
export async function cancelRun(runId: string): Promise<void> {
  const { appendLog, setRunStatus } = useBuilderStore.getState();

  try {
    // TODO: implement actual cancellation endpoint when available
    appendLog(`Cancelling run ${runId}...`);
    setRunStatus('failed');
    appendLog('Run cancelled');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    appendLog(`Error cancelling run: ${message}`);
  }
}
