/**
 * Module: packages/workflow-schema/src/workflow.ts
 * Purpose: Core workflow, node, and edge schemas for round-trip import/export
 * Key deps: zod
 *
 * This module defines the canonical schemas for nodes, edges, and workflows
 * that ensure round-trip safety for import/export functionality.
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
    json_body: z.record(z.string(), z.unknown()).optional(), // For JSON payloads
    auth: z.object({
      credentialName: z.string(),
    }).optional(), // Credential reference by name
  })
  .strict();

// Condition node config schema
export const ConditionConfigSchema = z
  .object({
    condition: z.string().default(''),
    field: z.string().optional(),
    operator: z.enum(['==', '!=', '>', '<', '>=', '<=', 'contains', 'not_contains']).optional(),
    value: z.string().optional(),
  })
  .strict();

// Stop node has no specific config
export const StopConfigSchema = z.object({}).strict();

// Agent node config schema
export const AgentConfigSchema = z
  .object({
    model: z.string().optional(), // e.g., "gpt-4", "claude-3"
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().optional(),
    systemPrompt: z.string().optional(),
    memory: z.object({
      type: z.enum(['buffer', 'summary', 'vector']).optional(),
      config: z.record(z.string(), z.unknown()).optional(),
    }).optional(),
    tools: z.array(z.object({
      name: z.string(),
      type: z.string(),
      config: z.record(z.string(), z.unknown()).optional(),
    })).optional(),
  })
  .strict();

// Base node data structure
export const BaseNodeDataSchema = z.object({
  label: z.string().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  // UI-only fields (not used by engine, safe to ignore during execution)
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  icon: z.string().optional(),
  isCollapsed: z.boolean().optional(), // For collapsible nodes (e.g., Agent)
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

export const ConditionNodeSchema = z.object({
  id: z.string(),
  type: z.literal('condition'),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: BaseNodeDataSchema.extend({
    config: ConditionConfigSchema.optional(),
  }),
});

export const StopNodeSchema = z.object({
  id: z.string(),
  type: z.literal('stop'),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: BaseNodeDataSchema.extend({
    config: StopConfigSchema.optional(),
  }),
});

export const AgentNodeSchema = z.object({
  id: z.string(),
  type: z.literal('agent'),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: BaseNodeDataSchema.extend({
    config: AgentConfigSchema.optional(),
  }),
});

// Union of all node types - ensures type safety across the platform
export const NodeSchema = z.discriminatedUnion('type', [
  StartNodeSchema,
  HttpNodeSchema,
  ConditionNodeSchema,
  StopNodeSchema,
  AgentNodeSchema,
]);

// === Edge Schema ===

export const EdgeSchema = z
  .object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    sourceHandle: z.string().nullable().optional(),
    targetHandle: z.string().nullable().optional(),
    type: z.string().optional(),
    data: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

// === Workflow Metadata Schema ===

export const WorkflowMetaSchema = z
  .object({
    name: z.string().default('Untitled'),
    version: z.literal(1).default(1),
    exportedAt: z.string().optional(), // ISO string added at export time
    description: z.string().optional(),
  })
  .strict();

// Legacy metadata schema for backward compatibility
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

// === Workflow Schema ===

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
export type ConditionConfig = z.output<typeof ConditionConfigSchema>;
export type StopConfig = z.infer<typeof StopConfigSchema>;
export type AgentConfig = z.output<typeof AgentConfigSchema>;
export type BaseNodeData = z.infer<typeof BaseNodeDataSchema>;
export type StartNode = z.infer<typeof StartNodeSchema>;
export type HttpNode = z.infer<typeof HttpNodeSchema>;
export type ConditionNode = z.infer<typeof ConditionNodeSchema>;
export type StopNode = z.infer<typeof StopNodeSchema>;
export type AgentNode = z.infer<typeof AgentNodeSchema>;
export type WorkflowNode = z.infer<typeof NodeSchema>;
export type WorkflowEdge = z.infer<typeof EdgeSchema>;
export type WorkflowMeta = z.infer<typeof WorkflowMetaSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;

// === WorkflowJson Type for Serialization ===

/**
 * WorkflowJson represents the exact JSON structure for import/export.
 * This type ensures type safety when serializing/deserializing workflows
 * and matches the WorkflowSchema validation.
 */
export type WorkflowJson = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  meta?: WorkflowMeta;
  metadata?: {
    name?: string;
    description?: string;
    version?: string;
    createdAt?: string;
    updatedAt?: string;
  };
};

// === Node Spec Interface ===

export interface NodeSpec<TConfig = any> {
  type: string;
  label: string;
  description?: string;
  configSchema: z.ZodType<any, any, any>; // Allow flexible schema typing for schemas with defaults/transforms
  defaultData: {
    label?: string;
    config?: TConfig;
    // UI-only fields
    description?: string;
    tags?: string[];
    icon?: string;
    isCollapsed?: boolean;
  };
  runtime?: { adapter: string };
}
