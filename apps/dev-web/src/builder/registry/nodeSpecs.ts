/**
 * Module: builder/registry/nodeSpecs.ts
 * Purpose: Define the Node Registry with Zod schemas and defaults for builder nodes (start, http).
 * Used by: Canvas (nodeTypes + add defaults), Inspector (schema-driven forms).
 * Notes: Client-side validation only; never include secrets in node config.
 */
import { z } from 'zod';
import {
  StartConfigSchema,
  HttpConfigSchema,
  type StartConfig,
  type HttpConfig,
  type NodeSpec as BaseNodeSpec,
} from '@automateos/workflow-schema';

export type NodeSpec<TConfig> = BaseNodeSpec<TConfig>;

export const NODE_SPECS = {
  start: {
    type: 'start',
    label: 'Start',
    description: 'Workflow entry point',
    configSchema: StartConfigSchema,
    runtime: { adapter: 'start' as const },
    defaultData: { label: 'Start', config: {} },
  } satisfies NodeSpec<StartConfig>,

  http: {
    type: 'http',
    label: 'HTTP Request',
    description: 'Make an HTTP request',
    configSchema: HttpConfigSchema,
    runtime: { adapter: 'http' as const },
    defaultData: {
      label: 'HTTP',
      config: { method: 'GET', url: 'https://api.example.com' },
    },
  } satisfies NodeSpec<HttpConfig>,
} as const;

export type NodeTypeKey = keyof typeof NODE_SPECS; // 'start' | 'http'
