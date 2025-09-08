// Import/Export helpers (stubs) for workflow graph round-trip.
// Will be connected to builder store selectors later.
import { downloadJson } from './utils/downloadJson';

// Types kept loose until schema package integrated.
export interface WorkflowExportShape {
  nodes: unknown[];
  edges: unknown[];
  meta?: Record<string, unknown>;
}

export function exportWorkflow(graph: WorkflowExportShape) {
  // Basic validation placeholder
  if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
    throw new Error('Invalid workflow shape');
  }
  downloadJson('workflow.json', graph);
}

export async function importWorkflow(file: File): Promise<WorkflowExportShape> {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    throw new Error('Invalid workflow file');
  }
  return parsed as WorkflowExportShape;
}
