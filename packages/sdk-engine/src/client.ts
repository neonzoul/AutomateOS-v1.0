/**
 * Engine REST client (v0.2)
 * Purpose: decouple Orchestrator from concrete transport (REST now, gRPC later)
 * Features: idempotency, timeout, retry with jitter, structured logging
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
  executeTimeoutMs?: number;
  getRunTimeoutMs?: number;
  logger?: (level: string, msg: string, meta?: Record<string, unknown>) => void;
}

export class EngineClient {
  private maxRetries: number;
  private baseDelay: number;
  private executeTimeout: number;
  private getRunTimeout: number;
  private logger: (
    level: string,
    msg: string,
    meta?: Record<string, unknown>
  ) => void;

  constructor(
    private baseURL: string,
    private fetchImpl: typeof fetch = fetch,
    opts: EngineClientOptions = {}
  ) {
    this.maxRetries = opts.maxRetries ?? 2;
    this.baseDelay = opts.baseDelayMs ?? 250;
    this.executeTimeout = opts.executeTimeoutMs ?? 12000;
    this.getRunTimeout = opts.getRunTimeoutMs ?? 8000;
    this.logger = opts.logger ?? this.defaultLogger;
  }

  private defaultLogger(
    level: string,
    msg: string,
    meta: Record<string, unknown> = {}
  ) {
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level,
        msg,
        component: 'EngineClient',
        ...meta,
      })
    );
  }

  private generateIdempotencyKey(): string {
    return `idem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private maskSensitive(value: string): string {
    if (!value || value.length <= 6) return '*'.repeat(value.length);
    return value.slice(0, 3) + '***' + value.slice(-2);
  }

  async execute(req: ExecuteRequest): Promise<{ engineRunId: string }> {
    const idempotencyKey = req.idempotencyKey || this.generateIdempotencyKey();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    this.logger('info', 'engine.execute.start', {
      runId: req.runId,
      idempotencyKey: this.maskSensitive(idempotencyKey),
      requestId,
      nodeCount: req.dag.nodes.length,
    });

    return this.withRetry(
      async (attempt: number) => {
        const controller = new AbortController();
        const timeout = setTimeout(
          () => controller.abort(),
          this.executeTimeout
        );

        try {
          const startTime = Date.now();
          const res = await this.fetchImpl(`${this.baseURL}/v1/execute`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-idempotency-key': idempotencyKey,
              'x-request-id': requestId,
              'x-run-id': req.runId,
            },
            body: JSON.stringify({
              runId: req.runId,
              dag: req.dag,
              env: req.env ?? {},
            }),
            signal: controller.signal,
          });

          const duration = Date.now() - startTime;

          if (!res.ok) {
            const errorText = await res.text().catch(() => 'unknown');
            this.logger('error', 'engine.execute.http_error', {
              runId: req.runId,
              requestId,
              attempt,
              status: res.status,
              statusText: res.statusText,
              duration,
              error: errorText.substring(0, 200),
            });
            throw new Error(
              `Engine execute failed ${res.status}: ${errorText}`
            );
          }

          const data = (await res.json()) as { engineRunId: string };
          if (!data.engineRunId) {
            throw new Error('Missing engineRunId in response');
          }

          this.logger('info', 'engine.execute.success', {
            runId: req.runId,
            engineRunId: data.engineRunId,
            requestId,
            attempt,
            duration,
          });

          return data;
        } finally {
          clearTimeout(timeout);
        }
      },
      { runId: req.runId }
    );
  }

  async getRun(engineRunId: string, runId?: string): Promise<EngineRunStatus> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    this.logger('debug', 'engine.getRun.start', {
      engineRunId,
      runId,
      requestId,
    });

    return this.withRetry(
      async (attempt: number) => {
        const controller = new AbortController();
        const timeout = setTimeout(
          () => controller.abort(),
          this.getRunTimeout
        );

        try {
          const startTime = Date.now();
          const res = await this.fetchImpl(
            `${this.baseURL}/v1/runs/${engineRunId}`,
            {
              headers: {
                'x-request-id': requestId,
                ...(runId ? { 'x-run-id': runId } : {}),
              },
              signal: controller.signal,
            }
          );

          const duration = Date.now() - startTime;

          if (!res.ok) {
            const errorText = await res.text().catch(() => 'unknown');
            this.logger('error', 'engine.getRun.http_error', {
              engineRunId,
              runId,
              requestId,
              attempt,
              status: res.status,
              duration,
              error: errorText.substring(0, 200),
            });
            throw new Error(`Engine getRun failed ${res.status}: ${errorText}`);
          }

          const data = (await res.json()) as EngineRunStatus;

          this.logger('debug', 'engine.getRun.success', {
            engineRunId,
            runId,
            requestId,
            attempt,
            duration,
            status: data.status,
            stepCount: data.steps?.length || 0,
            logCount: data.logs?.length || 0,
          });

          return data;
        } finally {
          clearTimeout(timeout);
        }
      },
      { runId, engineRunId }
    );
  }

  private async withRetry<T>(
    fn: (attempt: number) => Promise<T>,
    context?: { runId?: string; engineRunId?: string }
  ): Promise<T> {
    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        return await fn(attempt);
      } catch (e: any) {
        const retriable =
          attempt < this.maxRetries &&
          /((Network|fetch|abort)|5\d\d)/i.test(e?.message || '');

        if (!retriable) {
          this.logger('error', 'engine.retry.failed', {
            ...context,
            attempt,
            maxRetries: this.maxRetries,
            error: e?.message?.substring(0, 200),
          });
          throw e;
        }

        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 0.3; // 0-30% jitter
        const delay = this.baseDelay * Math.pow(2, attempt) * (1 + jitter);

        this.logger('warn', 'engine.retry.attempt', {
          ...context,
          attempt,
          maxRetries: this.maxRetries,
          delayMs: Math.round(delay),
          error: e?.message?.substring(0, 100),
        });

        await new Promise((r) => setTimeout(r, delay));
        attempt++;
      }
    }
  }
}

export default EngineClient;
