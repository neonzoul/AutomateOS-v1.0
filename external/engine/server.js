// Minimal Engine v0.1 (REST) - sequential execution prototype
import Fastify from 'fastify';

const app = Fastify({ logger: true });

/** In-memory runtime state */
const runs = new Map();
// Simple idempotency cache: key -> engineRunId (expires after process lifetime for prototype)
const idemCache = new Map();

app.post('/v1/execute', async (req, reply) => {
  const body = req.body || {};
  const idem = req.headers['x-idempotency-key'];
  if (idem && idemCache.has(idem)) {
    const existing = idemCache.get(idem);
    return reply.code(202).send({ engineRunId: existing, reused: true });
  }
  const engineRunId =
    'eng_' + Date.now().toString(36) + Math.random().toString(16).slice(2, 6);
  runs.set(engineRunId, {
    id: engineRunId,
    status: 'running',
    steps: [],
    logs: [],
  });
  if (idem) idemCache.set(idem, engineRunId);
  // Fire async execution
  executeDag(engineRunId, body.dag).catch((e) => app.log.error(e));
  return reply.code(202).send({ engineRunId });
});

app.get('/v1/runs/:id', async (req, reply) => {
  const r = runs.get(req.params.id);
  if (!r) return reply.code(404).send({ error: 'not_found' });
  return r;
});

async function executeDag(engineRunId, dag) {
  const run = runs.get(engineRunId);
  if (!run) return;
  const nodes = dag?.nodes || [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  // naive: execute in array order when deps satisfied
  const completed = new Set();
  while (completed.size < nodes.length) {
    let progressed = false;
    for (const node of nodes) {
      if (completed.has(node.id)) continue;
      const deps = node.deps || [];
      if (deps.every((d) => completed.has(d))) {
        await executeNode(run, node);
        completed.add(node.id);
        progressed = true;
      }
    }
    if (!progressed) {
      run.status = 'failed';
      run.logs.push(logLine('error', 'Deadlock in DAG (cycle?)'));
      return;
    }
  }
  run.status = run.status === 'failed' ? 'failed' : 'succeeded';
}

async function executeNode(run, node) {
  const start = Date.now();
  run.steps.push({ id: node.id, status: 'running' });
  try {
    switch (node.type) {
      case 'start':
        await sleep(50);
        break;
      case 'http_request_node':
        // Placeholder: no outbound network (later add fetch) to keep deterministic
        await sleep(120);
        run.logs.push(
          logLine(
            'info',
            `HTTP 200 (mock) ${node.config?.method || 'GET'} ${node.config?.url}`
          )
        );
        break;
      default:
        throw new Error('Unsupported node type ' + node.type);
    }
    const duration = Date.now() - start;
    updateStep(run, node.id, 'succeeded', duration);
  } catch (e) {
    const duration = Date.now() - start;
    run.logs.push(logLine('error', `Node ${node.id} failed: ${e.message}`));
    updateStep(run, node.id, 'failed', duration);
    run.status = 'failed';
  }
}

function updateStep(run, id, status, duration) {
  const s = run.steps.find((s) => s.id === id);
  if (s) {
    s.status = status;
    s.durationMs = duration;
  }
}

function logLine(level, msg) {
  return { ts: new Date().toISOString(), level, msg };
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

app.get('/health', async () => ({ ok: true }));

app.listen({ port: 8082, host: '0.0.0.0' }).catch((e) => {
  app.log.error(e);
  process.exit(1);
});
