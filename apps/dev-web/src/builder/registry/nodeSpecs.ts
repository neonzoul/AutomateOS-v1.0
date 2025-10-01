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
  ConditionConfigSchema,
  StopConfigSchema,
  AgentConfigSchema,
  type StartConfig,
  type HttpConfig,
  type ConditionConfig,
  type StopConfig,
  type AgentConfig,
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

  condition: {
    type: 'condition',
    label: 'Condition',
    description: 'Branch workflow based on condition',
    configSchema: ConditionConfigSchema,
    runtime: { adapter: 'condition' as const },
    defaultData: {
      label: 'If/Else',
      config: { condition: '' },
    },
  } satisfies NodeSpec<ConditionConfig>,

  stop: {
    type: 'stop',
    label: 'Stop',
    description: 'End workflow execution',
    configSchema: StopConfigSchema,
    runtime: { adapter: 'stop' as const },
    defaultData: { label: 'Stop', config: {} },
  } satisfies NodeSpec<StopConfig>,

  agent: {
    type: 'agent',
    label: 'AI Agent',
    description: 'Conversational AI agent with model, memory, and tools',
    configSchema: AgentConfigSchema,
    runtime: { adapter: 'agent' as const },
    defaultData: {
      label: 'AI Agent',
      config: {
        model: 'gpt-4',
        temperature: 0.7,
        systemPrompt: 'You are a helpful AI assistant.',
      } as AgentConfig,
      isCollapsed: false as boolean,
    } as const,
  } satisfies NodeSpec<AgentConfig>,
} as const;

export type NodeTypeKey = keyof typeof NODE_SPECS; // 'start' | 'http' | 'condition' | 'stop' | 'agent'
