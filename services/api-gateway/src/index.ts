import Fastify from 'fastify';
import { randomUUID } from 'crypto';
import { z } from 'zod';

// --- masking helpers (duplicated lightweight until moved to shared pkg) ---
const SENSITIVE_HEADER_REGEX =
  /^(authorization|x-api-key|api-key|x-auth-token)$/i;
function maskValue(v: string) {
  if (!v) return v;
  if (v.length <= 6) return '*'.repeat(v.length);
  return v.slice(0, 3) + '***' + v.slice(-2);
}
function maskHeaders(h: Record<string, any> | undefined) {
  if (!h) return {};
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(h)) {
    if (SENSITIVE_HEADER_REGEX.test(k)) {
      out[k] = typeof v === 'string' ? maskValue(v) : '***';
    } else {
      out[k] = v;
    }
  }
  return out;
}

async function startServer() {
  const app = Fastify({ logger: true });

  // attach requestId + basic structured logging
  app.addHook('onRequest', async (req, _rep) => {
    (req as any).requestId = req.headers['x-request-id'] || randomUUID();
  });

  app.addHook('preHandler', async (req, _rep) => {
    // log inbound request (masked headers)
    app.log.info({
      msg: 'request.in',
      requestId: (req as any).requestId,
      method: req.method,
      url: req.url,
      headers: maskHeaders(req.headers as any),
    });
  });

  app.addHook('onResponse', async (req, rep) => {
    app.log.info({
      msg: 'request.out',
      requestId: (req as any).requestId,
      method: req.method,
      url: req.url,
      statusCode: rep.statusCode,
      durationMs: Number(rep.getResponseTime?.() || 0),
    });
  });

  // Add CORS headers to all responses
  app.addHook('onSend', async (req, rep, payload) => {
    const origin = req.headers.origin as string;
    if (
      origin &&
      (origin === 'http://localhost:3000' || origin === 'http://127.0.0.1:3000')
    ) {
      rep.header('Access-Control-Allow-Origin', origin);
      rep.header('Access-Control-Allow-Credentials', 'true');
      rep.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      rep.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With, Idempotency-Key'
      );
    }
    return payload;
  });

  const CreateRunSchema = z.object({
    graph: z.object({
      nodes: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          config: z.record(z.unknown()).optional(),
        })
      ),
      edges: z
        .array(
          z.object({
            source: z.string(),
            target: z.string(),
          })
        )
        .optional(),
    }),
  });

  // naive in-memory store bridging orchestrator (later DB)
  interface RunView {
    id: string;
    status: string;
    steps: { id: string; status: string; durationMs?: number }[];
    logs: { ts: string; level: string; msg: string }[];
  }
  const runs = new Map<string, RunView>();

  async function callOrchestratorStart(
    graph: unknown,
    idempotencyKey?: string,
    requestId?: string
  ) {
    const res = await fetch(process.env.ORCHESTRATOR_BASE + '/internal/runs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idempotencyKey ? { 'x-idempotency-key': idempotencyKey } : {}),
        ...(requestId ? { 'x-request-id': requestId } : {}),
      },
      body: JSON.stringify({ graph }),
    });
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'unknown');
      throw new Error(`Orchestrator start failed ${res.status}: ${errorText}`);
    }
    return res.json() as Promise<{ runId: string }>;
  }

  async function fetchOrchestratorRun(runId: string, requestId?: string) {
    const res = await fetch(
      process.env.ORCHESTRATOR_BASE + '/internal/runs/' + runId,
      {
        headers: {
          ...(requestId ? { 'x-request-id': requestId } : {}),
        },
      }
    );
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'unknown');
      throw new Error(`Orchestrator get failed ${res.status}: ${errorText}`);
    }
    return res.json();
  }

  // Handle CORS preflight requests
  app.options('/v1/runs', async (req, rep) => {
    const origin = req.headers.origin as string;
    if (
      origin &&
      (origin === 'http://localhost:3000' || origin === 'http://127.0.0.1:3000')
    ) {
      rep.header('Access-Control-Allow-Origin', origin);
      rep.header('Access-Control-Allow-Credentials', 'true');
      rep.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      rep.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With, Idempotency-Key'
      );
      return rep.status(204).send();
    }
    return rep.status(404).send();
  });

  app.options('/v1/runs/:id', async (req, rep) => {
    const origin = req.headers.origin as string;
    if (
      origin &&
      (origin === 'http://localhost:3000' || origin === 'http://127.0.0.1:3000')
    ) {
      rep.header('Access-Control-Allow-Origin', origin);
      rep.header('Access-Control-Allow-Credentials', 'true');
      rep.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      rep.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With, Idempotency-Key'
      );
      return rep.status(204).send();
    }
    return rep.status(404).send();
  });

  app.post('/v1/runs', async (req: any, rep: any) => {
    const requestId = (req as any).requestId;
    try {
      const body = CreateRunSchema.parse(req.body);

      // Generate idempotency key if not provided
      let idem = req.headers['idempotency-key'] as string | undefined;
      if (!idem) {
        idem = `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        app.log.debug({
          msg: 'idempotency_key.generated',
          requestId,
          idempotencyKeyMasked: maskValue(idem),
        });
      }

      const { runId } = await callOrchestratorStart(
        body.graph,
        idem,
        requestId
      );

      app.log.info({
        msg: 'run.created',
        requestId: requestId,
        runId,
        hasIdempotencyKey: Boolean(idem),
        idempotencyKeyMasked: idem ? maskValue(idem) : undefined,
        nodeCount: body.graph.nodes.length,
      });

      return rep.code(201).send({ runId });
    } catch (error: any) {
      app.log.error({
        msg: 'run.create.failed',
        requestId,
        error: error.message,
        stack: error.stack?.substring(0, 500),
      });

      if (error.message?.includes('validation')) {
        return rep.code(400).send({
          error: 'validation_failed',
          message: error.message,
        });
      }

      return rep.code(500).send({
        error: 'internal_error',
        message: 'Failed to create run',
      });
    }
  });

  app.get('/v1/runs/:id', async (req: any, rep: any) => {
    const id = (req.params as any).id as string;
    const requestId = (req as any).requestId;

    try {
      const run = await fetchOrchestratorRun(id, requestId);

      app.log.info({
        msg: 'run.fetch',
        requestId: requestId,
        runId: id,
        status: run.status,
        stepCount: run.steps?.length || 0,
        logCount: run.logs?.length || 0,
      });

      return run;
    } catch (e: any) {
      app.log.warn({
        msg: 'run.fetch.failed',
        requestId: requestId,
        runId: id,
        error: e.message,
      });

      if (e.message?.includes('404') || e.message?.includes('not_found')) {
        return rep.code(404).send({
          error: 'not_found',
          message: 'Run not found',
        });
      }

      return rep.code(500).send({
        error: 'internal_error',
        message: 'Failed to fetch run',
      });
    }
  });

  app.get('/health', async () => ({ ok: true }));

  app
    .listen({ port: Number(process.env.PORT) || 3001, host: '0.0.0.0' })
    .catch((e: any) => {
      app.log.error(e);
      process.exit(1);
    });
}

// Start the server
startServer().catch((e) => {
  console.error('Failed to start server:', e);
  process.exit(1);
});
