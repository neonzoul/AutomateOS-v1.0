/**
 * Module: builder/registry/nodeSpecs.ts
 * Purpose: Define the Node Registry with Zod schemas and defaults for builder nodes (start, http).
 * Used by: Canvas (nodeTypes + add defaults), future Inspector (schema-driven forms).
 * Notes: Client-side validation only; never include secrets in node config.
 */
import { z } from 'zod';

// Generic node data shared shape
export const BaseNodeDataSchema = z.object({
  label: z.string().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

// Start node has no specific config
export const StartConfigSchema = z.object({}).strict();

// HTTP node config
export const HttpConfigSchema = z
  .object({
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('GET'),
    url: z.string().url(),
    headers: z.record(z.string(), z.string()).optional(),
    body: z.any().optional(),
  })
  .strict();

export type StartConfig = z.infer<typeof StartConfigSchema>;
export type HttpConfig = z.infer<typeof HttpConfigSchema>;

export type NodeSpec<TConfig> = {
  type: 'start' | 'http';
  label: string;
  description?: string;
  // Zod schema to validate config
  configSchema: z.ZodType<TConfig>;
  // Default data for new nodes
  defaultData: {
    label?: string;
    config?: TConfig;
  };
};

export const NODE_SPECS = {
  start: {
    type: 'start',
    label: 'Start',
    description: 'Workflow entry point',
    configSchema: StartConfigSchema,
    defaultData: { label: 'Start', config: {} },
  } satisfies NodeSpec<StartConfig>,

  http: {
    type: 'http',
    label: 'HTTP Request',
    description: 'Make an HTTP request',
    configSchema: HttpConfigSchema,
    defaultData: {
      label: 'HTTP',
      config: { method: 'GET', url: 'https://api.example.com' },
    },
  } satisfies NodeSpec<HttpConfig>,
} as const;

export type NodeTypeKey = keyof typeof NODE_SPECS; // 'start' | 'http'
