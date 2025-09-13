import Fastify from 'fastify';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { WorkflowSchema } from '@automateos/workflow-schema';

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

  // Add CORS headers manually
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
        'Content-Type, Authorization, X-Requested-With'
      );
    }
    return payload;
  });

  // Handle preflight OPTIONS requests
  app.addHook('preHandler', async (req, rep) => {
    if (req.method === 'OPTIONS') {
      const origin = req.headers.origin as string;
      if (
        origin &&
        (origin === 'http://localhost:3000' ||
          origin === 'http://127.0.0.1:3000')
      ) {
        rep.header('Access-Control-Allow-Origin', origin);
        rep.header('Access-Control-Allow-Credentials', 'true');
        rep.header(
          'Access-Control-Allow-Methods',
          'GET, POST, PUT, DELETE, OPTIONS'
        );
        rep.header(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization, X-Requested-With'
        );
        rep.status(204);
        return rep.send();
      }
    }
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
    idempotencyKey?: string
  ) {
    const res = await fetch(process.env.ORCHESTRATOR_BASE + '/internal/runs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idempotencyKey ? { 'x-idempotency-key': idempotencyKey } : {}),
      },
      body: JSON.stringify({ graph }),
    });
    if (!res.ok) throw new Error('Orchestrator start failed');
    return res.json() as Promise<{ runId: string }>;
  }

  async function fetchOrchestratorRun(runId: string) {
    const res = await fetch(
      process.env.ORCHESTRATOR_BASE + '/internal/runs/' + runId
    );
    if (!res.ok) throw new Error('Orchestrator get failed');
    return res.json();
  }

  app.post('/v1/runs', async (req: any, rep: any) => {
    const body = CreateRunSchema.parse(req.body);
    const idem =
      (req.headers['idempotency-key'] as string | undefined) || undefined;
    const { runId } = await callOrchestratorStart(body.graph, idem);
    app.log.info({
      msg: 'run.created',
      requestId: (req as any).requestId,
      runId,
      hasIdempotencyKey: Boolean(idem),
      idempotencyKeyMasked: idem ? maskValue(idem) : undefined,
    });
    return rep.code(201).send({ runId });
  });

  app.get('/v1/runs/:id', async (req: any, rep: any) => {
    const id = (req.params as any).id as string;
    try {
      const run = await fetchOrchestratorRun(id);
      app.log.info({
        msg: 'run.fetch',
        requestId: (req as any).requestId,
        runId: id,
        status: run.status,
      });
      return run;
    } catch (e: any) {
      app.log.warn({
        msg: 'run.fetch.not_found',
        requestId: (req as any).requestId,
        runId: id,
      });
      return rep.code(404).send({ error: 'not_found' });
    }
  });

  app.get('/health', async () => ({ ok: true }));

  // Handle CORS preflight for all routes
  app.options('*', async (req, rep) => {
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
        'Content-Type, Authorization, X-Requested-With'
      );
      return rep.status(204).send();
    }
    return rep.status(404).send();
  });

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
