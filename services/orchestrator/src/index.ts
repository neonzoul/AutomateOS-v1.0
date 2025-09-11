import Fastify from 'fastify';
import { startRun, getRun, startRunWithDag } from './runService';
import { z } from 'zod';

const app = Fastify({ logger: true });

// Simple header masking utility
function maskHeaders(h: Record<string, any> | undefined) {
  if (!h) return {};
  const out: Record<string, any> = {};
  const sensitiveKeys = /^(authorization|x-api-key|api-key|x-auth-token)$/i;
  for (const [k, v] of Object.entries(h)) {
    if (sensitiveKeys.test(k)) {
      out[k] = typeof v === 'string' ? '***' : '***';
    } else {
      out[k] = v;
    }
  }
  return out;
}

const StartRunSchema = z.object({
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

// Convert simplified graph format to Engine DAG format
function convertToEngineDag(graph: any) {
  return {
    nodes: graph.nodes.map((node: any) => ({
      id: node.id,
      type: node.type,
      config: node.config || {},
    })),
  };
}

app.post('/internal/runs', async (req, rep) => {
  const body = StartRunSchema.parse(req.body);
  const runId = `run_${Date.now().toString(36)}`;
  const idem =
    (req.headers['x-idempotency-key'] as string | undefined) || undefined;
  req.log.info({ idem, headers: maskHeaders(req.headers) }, 'startRun request');

  // Convert to Engine DAG format and start directly
  const dag = convertToEngineDag(body.graph);
  await startRunWithDag(runId, dag, idem);
  return rep.code(202).send({ runId });
});

app.get('/internal/runs/:id', async (req, rep) => {
  const run = getRun((req.params as any).id);
  if (!run) return rep.code(404).send({ error: 'not_found' });
  return run;
});

app.get('/health', async () => ({ ok: true }));

app
  .listen({ port: Number(process.env.PORT) || 3002, host: '0.0.0.0' })
  .catch((e) => {
    app.log.error(e);
    process.exit(1);
  });
