/**
 * compileDag: Convert validated workflow graph into Engine DAG (topological order)
 * Invariants:
 * - Only one start node allowed (type 'start')
 * - All edges reference existing nodes
 * - Produces deterministic ordering (stable within same dependency shape)
 */

// Simple types for DAG conversion
type SimpleNode = {
  id: string;
  type: string;
  config?: Record<string, unknown>;
};

type SimpleEdge = {
  source: string;
  target: string;
};

type SimpleWorkflow = {
  nodes: SimpleNode[];
  edges: SimpleEdge[];
};

type EngineDagNode = {
  id: string;
  type: string;
  config?: Record<string, unknown>;
  deps?: string[];
};

export function compileDag(graph: SimpleWorkflow): { nodes: EngineDagNode[] } {
  // Basic validation (defense in depth)
  const nodesById = new Map<string, SimpleNode>();
  graph.nodes.forEach((n) => nodesById.set(n.id, n));

  graph.edges.forEach((e) => {
    if (!nodesById.has(e.source) || !nodesById.has(e.target)) {
      throw new Error(`Edge ${e.source}->${e.target} references missing nodes`);
    }
  });

  const inDegree = new Map<string, number>();
  graph.nodes.forEach((n) => inDegree.set(n.id, 0));
  const depsMap = new Map<string, Set<string>>();
  graph.nodes.forEach((n) => depsMap.set(n.id, new Set()));

  graph.edges.forEach((e) => {
    // e.source -> e.target
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    depsMap.get(e.target)!.add(e.source);
  });

  const queue: string[] = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });
  queue.sort(); // stable deterministic

  const order: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    // remove outgoing edges
    graph.edges
      .filter((e) => e.source === id)
      .forEach((e) => {
        const tgt = e.target;
        inDegree.set(tgt, inDegree.get(tgt)! - 1);
        if (inDegree.get(tgt) === 0) {
          queue.push(tgt);
          queue.sort();
        }
      });
  }

  if (order.length !== graph.nodes.length) {
    throw new Error('Cycle detected in workflow graph');
  }

  const dagNodes: EngineDagNode[] = order.map((id) => {
    const n = nodesById.get(id)!;
    return {
      id: n.id,
      type: mapNodeType(n.type),
      config: buildConfig(n),
      deps: Array.from(depsMap.get(id) || []),
    };
  });

  return { nodes: dagNodes };
}

function mapNodeType(type: string): string {
  switch (type) {
    case 'start':
      return 'start';
    case 'http':
      return 'http_request_node';
    default:
      throw new Error(`Unsupported node type: ${type}`);
  }
}

function buildConfig(n: SimpleNode): Record<string, unknown> | undefined {
  if (n.type === 'http') {
    // Try both n.config (direct) and n.data.config (nested) for compatibility
    const cfg = n.config || (n as any).data?.config || {};

    // Debug logging
    console.log('🔍 buildConfig DEBUG:');
    console.log('  nodeId:', n.id);
    console.log('  n.config:', n.config);
    console.log('  n.data?.config:', (n as any).data?.config);
    console.log('  final cfg:', cfg);
    console.log('  cfg.url:', cfg.url);

    const result = {
      method: cfg.method || 'GET',
      url: cfg.url,
      headers: cfg.headers,
      json_body: safeParseJson(cfg.body),
    };

    console.log('  final result:', result);
    return result;
  }
  return undefined;
}

function safeParseJson(input?: string) {
  if (!input) return undefined;
  try {
    return JSON.parse(input);
  } catch {
    return input; // keep raw string if not JSON
  }
}
