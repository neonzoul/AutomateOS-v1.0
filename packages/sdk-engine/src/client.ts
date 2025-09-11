/**
 * Engine REST client (v0.1)
 * Purpose: decouple Orchestrator from concrete transport (REST now, gRPC later)
 */

export type ExecuteRequest = {
  runId: string;
  dag: { nodes: EngineDagNode[] };
  env?: Record<string, unknown>;
  idempotencyKey?: string;
};

export type EngineDagNode = {
  id: string;
  type: string;
  config?: Record<string, unknown>;
  deps?: string[];
};

export type EngineRunStatus = {
  id: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  steps: { id: string; status: string; durationMs?: number }[];
  logs: { ts: string; level: string; msg: string }[];
};

export interface EngineClientOptions {
  maxRetries?: number;
  baseDelayMs?: number;
}

export class EngineClient {
  private maxRetries: number;
  private baseDelay: number;
  constructor(
    private baseURL: string,
    private fetchImpl: typeof fetch = fetch,
    opts: EngineClientOptions = {}
  ) {
    this.maxRetries = opts.maxRetries ?? 2;
    this.baseDelay = opts.baseDelayMs ?? 250;
  }

  async execute(req: ExecuteRequest): Promise<{ engineRunId: string }> {
    return this.withRetry(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const res = await this.fetchImpl(`${this.baseURL}/v1/execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(req.idempotencyKey
              ? { 'x-idempotency-key': req.idempotencyKey }
              : {}),
          },
          body: JSON.stringify({
            runId: req.runId,
            dag: req.dag,
            env: req.env ?? {},
          }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Engine execute failed ${res.status}`);
        const data = (await res.json()) as { engineRunId: string };
        if (!data.engineRunId) throw new Error('Missing engineRunId');
        return data;
      } finally {
        clearTimeout(timeout);
      }
    });
  }

  async getRun(engineRunId: string): Promise<EngineRunStatus> {
    return this.withRetry(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      try {
        const res = await this.fetchImpl(
          `${this.baseURL}/v1/runs/${engineRunId}`
        );
        if (!res.ok) throw new Error(`Engine getRun failed ${res.status}`);
        return (await res.json()) as EngineRunStatus;
      } finally {
        clearTimeout(timeout);
      }
    });
  }

  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        return await fn();
      } catch (e: any) {
        const retriable =
          attempt < this.maxRetries &&
          /((Network|fetch|abort)|5\d\d)/i.test(e?.message || '');
        if (!retriable) throw e;
        const delay = this.baseDelay * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
        attempt++;
      }
    }
  }
}

export default EngineClient;
