// Run action utilities for Sprint 2
// Integrates with API gateway (/runs endpoints) for workflow execution

import { useBuilderStore } from '../../core/state';
import { useCredentialStore } from '../../core/credentials';

// Resolve API base at runtime (client or server) to support CI overrides and mocks
function getApiBase(): string {
  // Prefer value injected into window during tests (set via addInitScript)
  if (typeof window !== 'undefined') {
    const injected = (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_API_BASE;
    if (injected) return injected as string;
    try {
      // Test helper: enable mock gateway if flag present
      const mockMode = window.localStorage.getItem('mockApiMode');
      if (mockMode === 'true') return 'http://localhost:3001';
    } catch {}
  }
  // Fallbacks: build-time env or local dev gateway
  return process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
}

export type RunPollStatus = 'queued' | 'running' | 'succeeded' | 'failed';

export type RunResponse = {
  id?: string;
  status: RunPollStatus;
  startedAt?: string;
  finishedAt?: string | null;
  logs?: Array<
    | string
    | {
        ts: string;
        level: 'info' | 'warn' | 'error';
        msg: string;
        nodeId?: string;
      }
  >;
  steps?: {
    id: string;
    nodeId?: string;
    status: string;
    durationMs?: number;
  }[];
};

/**
 * Start a workflow run by posting to API gateway
 * Sets run status and begins polling
 */
export async function startRun(
  workflowJson: unknown
): Promise<{ runId: string }> {
  const { setRunStatus, appendLog, resetRun, setNodeRunStatuses } =
    useBuilderStore.getState();

  try {
    // Reset previous run state
    resetRun();
    appendLog('Starting workflow run...');

    // Pre-process workflow to inject credentials
    const processedWorkflowJson = await injectCredentials(workflowJson);
    appendLog('Credentials injected for secure run');

    // Generate idempotency key for this run
    const idempotencyKey = `ui_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Call API gateway to start run with transient retry/backoff
    const maxAttempts = 5;
    let attempt = 0;
    let lastError: any = null;
    let response: Response | null = null;

    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        appendLog(`Starting run (attempt ${attempt}/${maxAttempts})`);
        response = await fetch(`${getApiBase()}/v1/runs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey,
          },
          body: JSON.stringify({ graph: processedWorkflowJson }),
        });

        // If HTTP response received but it's an error status, treat as API error (do not retry)
        if (response && !response.ok) {
          let errMsg = response.statusText || '';
          try {
            if (response && typeof (response as any).json === 'function') {
              const json = await (response as any).json();
              if (json && json.error && json.error.message)
                errMsg = json.error.message;
            }
          } catch {}

          const msg =
            `Failed to start run: ${response.status} ${errMsg}`.trim();
          appendLog(msg);
          setRunStatus('failed');
          throw new Error(msg);
        }

        if (response && response.ok) break;
      } catch (err) {
        lastError = err;
        appendLog(
          `Start run network error on attempt ${attempt}: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }

      // If not last attempt, wait with backoff
      if (attempt < maxAttempts) {
        const delay = 300 * attempt; // linear backoff
        appendLog(`Retrying start in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    if (!response || !response.ok) {
      // Exhausted retries on network errors
      const msg =
        lastError instanceof Error ? lastError.message : String(lastError);
      appendLog(`Failed to start run after ${maxAttempts} attempts: ${msg}`);
      setRunStatus('failed');
      throw new Error(
        `Failed to start run after ${maxAttempts} attempts: ${msg}`
      );
    }

    const result = await response.json();
    const runId = result.runId || result.id;

    // Initialize per-node statuses (queued)
    const graph = workflowJson as any;
    if (graph?.nodes) {
      const map: Record<string, 'idle' | 'running' | 'succeeded' | 'failed'> =
        {};
      graph.nodes.forEach((n: any) => (map[n.id] = 'idle'));
      setNodeRunStatuses(map);
    }

    // Update state with run ID and initial status
    setRunStatus('queued', runId);
    appendLog(`Run ${runId} created and queued`);
    appendLog(`Idempotency key: ${idempotencyKey.substring(0, 8)}...`);

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
  const { setRunStatus, appendLog, updateNodeRunStatus, setStepDuration } =
    useBuilderStore.getState();

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

      const response = await fetch(`${getApiBase()}/v1/runs/${runId}`);

      // Guard against undefined or malformed response
      if (!response || typeof (response as any).ok !== 'boolean') {
        throw new Error('Fetch failed or returned invalid response');
      }

      if (!response.ok) {
        appendLog(`Polling HTTP error: ${response.status}`);
        setRunStatus('failed');
        return;
      }

      const run: RunResponse & {
        steps?: { id: string; nodeId?: string; status: string }[];
      } = await response.json();

      // Update status
      setRunStatus(run.status);

      // Update per-node statuses and durations if steps present
      if (Array.isArray((run as any).steps)) {
        const { nodes, nodeRunStatuses } = useBuilderStore.getState();
        (run as any).steps.forEach((s: any) => {
          const status = s.status as
            | 'running'
            | 'succeeded'
            | 'failed'
            | string;
          if (
            status === 'running' ||
            status === 'succeeded' ||
            status === 'failed'
          ) {
            // Determine which node to update:
            // 1) exact id match
            // 2) match by type when nodeId is a type label like 'start'/'http'
            let targetId: string | undefined = undefined;
            const stepNodeId = (s.nodeId || s.id) as string | undefined;
            if (stepNodeId) {
              if (nodeRunStatuses[stepNodeId] !== undefined) {
                targetId = stepNodeId;
              } else {
                const matchByType = nodes.find((n) => n.type === stepNodeId);
                if (matchByType) targetId = matchByType.id;
              }
            }

            if (targetId) {
              updateNodeRunStatus(targetId, status);

              // Store step duration if available
              if (typeof s.durationMs === 'number') {
                setStepDuration(targetId, s.durationMs);
              }
            }
          }
        });
      }

      // Add only new logs (after lastLogCount)
      if (run.logs && run.logs.length > lastLogCount) {
        const newLogs = run.logs.slice(lastLogCount);
        newLogs.forEach((logObj) => {
          // Convert log object to string format
          const logMessage =
            typeof logObj === 'string'
              ? logObj
              : `[${logObj.level?.toUpperCase() || 'INFO'}] ${logObj.msg || 'Unknown log'}`;
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
      // Don't mark failed immediately on transient errors. Retry until maxPolls is reached.
      if (pollCount >= maxPolls) {
        appendLog('Polling timeout reached after repeated errors');
        setRunStatus('failed');
        return;
      }
      // Retry after a small backoff
      const retryDelay = Math.min(
        baseInterval * Math.pow(1.1, pollCount),
        5000
      );
      appendLog(`Retrying poll in ${retryDelay}ms`);
      setTimeout(poll, retryDelay);
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

/**
 * Inject credentials into workflow nodes before execution
 * Looks up credential values and injects them as Authorization headers
 */
async function injectCredentials(workflowJson: unknown): Promise<unknown> {
  const { getCredential } = useCredentialStore.getState();
  const graph = workflowJson as any;

  if (!graph?.nodes) {
    return workflowJson;
  }

  // Process each node and inject credentials if needed
  const processedNodes = await Promise.all(
    graph.nodes.map(async (node: any) => {
      if (node.type === 'http' && node.config?.auth?.credentialName) {
        const credentialName = node.config.auth.credentialName;

        try {
          const credentialValue = await getCredential(credentialName);

          if (credentialValue) {
            // Clone node config to avoid mutating original
            const newConfig = { ...node.config };
            const newHeaders = { ...newConfig.headers };

            // Inject credential as Authorization header
            newHeaders['Authorization'] = credentialValue;

            // Remove auth config from the node (don't send credential names to backend)
            delete newConfig.auth;
            newConfig.headers = newHeaders;

            return { ...node, config: newConfig };
          }
        } catch (error) {
          console.warn(`Failed to retrieve credential "${credentialName}":`, error);
        }
      }

      return node;
    })
  );

  return { ...graph, nodes: processedNodes };
}
