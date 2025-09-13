/**
 * Module: packages/workflow-schema
 * Purpose: Centralized Zod schemas for workflow validation across the AutomateOS platform
 * Used by: Builder UI (Inspector forms), Orchestrator (validation), Engine (execution)
 */

import { z } from 'zod';

// === Node Configuration Schemas ===

// Start node has no specific config
export const StartConfigSchema = z.object({}).strict();

// HTTP node config schema
export const HttpConfigSchema = z
  .object({
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('GET'),
    url: z.string().url('Please enter a valid URL'),
    headers: z.record(z.string(), z.string()).optional(),
    body: z.string().optional(),
  })
  .strict();

// Base node data structure
export const BaseNodeDataSchema = z.object({
  label: z.string().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

// === Node Type Schemas ===

export const StartNodeSchema = z.object({
  id: z.string(),
  type: z.literal('start'),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: BaseNodeDataSchema.extend({
    config: StartConfigSchema.optional(),
  }),
});

export const HttpNodeSchema = z.object({
  id: z.string(),
  type: z.literal('http'),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: BaseNodeDataSchema.extend({
    config: HttpConfigSchema.optional(),
  }),
});

// Union of all node types
export const NodeSchema = z.discriminatedUnion('type', [
  StartNodeSchema,
  HttpNodeSchema,
]);

// === Edge Schema ===

export const EdgeSchema = z
  .object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    sourceHandle: z.string().optional(),
    targetHandle: z.string().optional(),
    type: z.string().optional(),
    data: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

// === Workflow Schema (Round-trip export/import) ===
// NOTE: Day5 import/export introduces a stricter meta object ("meta") with
// fixed literal version (1) + exportedAt timestamp for provenance. The legacy
// "metadata" key is kept (deprecated) for any early callers; prefer "meta".

export const WorkflowMetaSchema = z
  .object({
    name: z.string().default('Untitled'),
    version: z.literal(1).default(1),
    exportedAt: z.string().optional(), // ISO string added at export time
  })
  .strict();

export const DeprecatedMetadataSchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
    version: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .partial()
  .optional();

export const WorkflowSchema = z
  .object({
    nodes: z.array(NodeSchema),
    edges: z.array(EdgeSchema),
    meta: WorkflowMetaSchema.optional(),
    metadata: DeprecatedMetadataSchema, // backward compatibility
  })
  .strict();

// === Type Exports ===

export type StartConfig = z.infer<typeof StartConfigSchema>;
export type HttpConfig = z.output<typeof HttpConfigSchema>;
export type BaseNodeData = z.infer<typeof BaseNodeDataSchema>;
export type StartNode = z.infer<typeof StartNodeSchema>;
export type HttpNode = z.infer<typeof HttpNodeSchema>;
export type WorkflowNode = z.infer<typeof NodeSchema>;
export type WorkflowEdge = z.infer<typeof EdgeSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;
export type WorkflowMeta = z.infer<typeof WorkflowMetaSchema>;

// === Node Spec Interface ===

export interface NodeSpec<TConfig> {
  type: string;
  label: string;
  description?: string;
  configSchema: z.ZodType<any, any, any>; // Allow flexible schema typing
  defaultData: {
    label?: string;
    config?: TConfig;
  };
  runtime?: { adapter: string };
}
