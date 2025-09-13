// Import/Export helpers for workflow graph round-trip safety.
// Validates against shared WorkflowSchema (schema-driven dev principle).
import {
  WorkflowSchema,
  type Workflow,
  type WorkflowMeta,
} from '@automateos/workflow-schema';

// Export ---------------------------------------------------------------
export async function exportWorkflow(opts: {
  nodes: unknown[];
  edges: unknown[];
  name?: string;
}) {
  // Sanitize nodes/edges: strip React Flow view/runtime-only props that are not part of schema
  const sanitizeNode = (n: any) => {
    if (!n || typeof n !== 'object') return n;
    const { id, type, position, data } = n;
    return { id, type, position, data };
  };
  const sanitizeEdge = (e: any) => {
    if (!e || typeof e !== 'object') return e;
    const { id, source, target, sourceHandle, targetHandle, type, data } = e;
    return { id, source, target, sourceHandle, targetHandle, type, data };
  };

  const sanitizedNodes = Array.isArray(opts.nodes)
    ? (opts.nodes as any[]).map(sanitizeNode)
    : [];
  const sanitizedEdges = Array.isArray(opts.edges)
    ? (opts.edges as any[]).map(sanitizeEdge)
    : [];

  const payload: Workflow = {
    nodes: sanitizedNodes as any,
    edges: sanitizedEdges as any,
    meta: {
      name: opts.name ?? 'Untitled',
      version: 1,
      exportedAt: new Date().toISOString(),
    } as WorkflowMeta,
  } as any; // typed via schema validation below

  const parsed = WorkflowSchema.safeParse(payload);
  if (!parsed.success) {
    throw parsed.error; // caller toasts error
  }

  const json = JSON.stringify(parsed.data, null, 2);
  const fileName = `${(parsed.data.meta?.name ?? 'workflow')
    .toLowerCase()
    .replace(/\s+/g, '-')}-v${parsed.data.meta?.version ?? 1}.json`;
  saveAs(json, fileName, 'application/json');
}

// Import ---------------------------------------------------------------
export async function importWorkflow(file: File): Promise<Workflow> {
  const text = await file.text();
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    const err = new Error('Invalid file: not JSON.');
    (err as any).code = 'INVALID_JSON';
    throw err;
  }

  const parsed = WorkflowSchema.safeParse(raw);
  if (!parsed.success) {
    const err = new Error('Invalid workflow: schema mismatch.');
    (err as any).code = 'INVALID_SCHEMA';
    (err as any).issues = parsed.error.issues;
    throw err;
  }
  return parsed.data;
}

// Browser helper -------------------------------------------------------
export function saveAs(text: string, filename: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
