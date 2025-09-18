'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { nanoid } from 'nanoid';
import {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import { WorkflowSchema, type Workflow } from '@automateos/workflow-schema';

// === Initial Core State Types ===

// Narrow node data to what our builder expects.
// Extend this later with per-node types via a discriminated union.
export type NodeData = {
  label?: string;
  config?: Record<string, unknown>;
};

export interface BuilderState {
  // Core React Flow state
  nodes: Node<NodeData>[];
  edges: Edge[];

  // Selection
  selectedNodeId: string | null;

  // React Flow handlers (stable)
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  // Actions
  setSelectedNode: (nodeId: string | null) => void;
  updateNodeConfig: (
    nodeId: string,
    config: Partial<NodeData['config']>
  ) => void;

  addNode: (node: Omit<Node<NodeData>, 'id'> & { id?: string }) => void;
  removeNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  clearWorkflow: () => void;
  setGraph: (graph: { nodes: Node<NodeData>[]; edges: Edge[] }) => void; // import/export helper
  clearUiState: () => void; // resets selection + run state (import flow)

  // === Run Slice ===
  runStatus: 'idle' | 'queued' | 'running' | 'succeeded' | 'failed';
  currentRunId: string | null;
  logs: string[];
  nodeRunStatuses: Record<string, 'idle' | 'running' | 'succeeded' | 'failed'>;
  stepDurations: Record<string, number>; // nodeId -> durationMs
  setRunStatus: (
    status: BuilderState['runStatus'],
    runId?: string | null
  ) => void;
  appendLog: (line: string) => void;
  resetRun: () => void;
  setNodeRunStatuses: (
    m: Record<string, 'idle' | 'running' | 'succeeded' | 'failed'>
  ) => void;
  updateNodeRunStatus: (
    id: string,
    status: 'running' | 'succeeded' | 'failed'
  ) => void;
  setStepDuration: (nodeId: string, durationMs: number) => void;
}

// === Initial Store State Interface ===
const initialNodes: Node<NodeData>[] = [];
const initialEdges: Edge[] = [];

// === LocalStorage Persistence ===
const STORAGE_KEY = 'automateos.dev.graph';

// Check if localStorage persistence is enabled (dev only)
const isDevStorageEnabled = () => {
  return (
    typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_DEV_STORAGE === 'true' &&
    process.env.NODE_ENV !== 'production'
  );
};

// Hydrate state from localStorage
const getInitialState = () => {
  if (!isDevStorageEnabled()) {
    return { nodes: initialNodes, edges: initialEdges };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate with WorkflowSchema to ensure data integrity
      const result = WorkflowSchema.safeParse(parsed);
      if (result.success) {
        return {
          nodes: result.data.nodes || initialNodes,
          edges: result.data.edges || initialEdges,
        };
      } else {
        console.warn(
          'Invalid workflow in localStorage, clearing:',
          result.error
        );
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  } catch (error) {
    console.warn('Failed to load builder state from localStorage:', error);
    // Clear corrupted data
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  return { nodes: initialNodes, edges: initialEdges };
};

export const useBuilderStore = create<BuilderState>()(
  devtools(
    subscribeWithSelector((set, get) => {
      const { nodes, edges } = getInitialState();

      return {
        nodes,
        edges,
        selectedNodeId: null,
        runStatus: 'idle',
        currentRunId: null,
        logs: [],
        nodeRunStatuses: {},
        stepDurations: {},

        onNodesChange: (changes) =>
          set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) })),

        onEdgesChange: (changes) =>
          set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),

        onConnect: (connection: Connection) =>
          set((s) => ({ edges: addEdge(connection, s.edges) })),

        setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

        updateNodeConfig: (nodeId, config) =>
          set((s) => ({
            nodes: s.nodes.map((n) =>
              n.id === nodeId
                ? {
                    ...n,
                    data: {
                      ...(n.data ?? {}),
                      config: {
                        ...((n.data?.config as Record<string, unknown>) ?? {}),
                        ...config,
                      },
                    },
                  }
                : n
            ),
          })),

        addNode: (nodeInput) =>
          set((s) => {
            const id = nodeInput.id ?? nanoid(8);
            const newNode: Node<NodeData> = {
              ...nodeInput,
              id,
              type: nodeInput.type ?? 'default',
              position: nodeInput.position ?? { x: 100, y: 100 },
              data: nodeInput.data ?? {},
            };
            return { nodes: [...s.nodes, newNode] };
          }),

        removeNode: (nodeId) =>
          set((s) => ({
            nodes: s.nodes.filter((n) => n.id !== nodeId),
            edges: s.edges.filter(
              (e) => e.source !== nodeId && e.target !== nodeId
            ),
            selectedNodeId:
              s.selectedNodeId === nodeId ? null : s.selectedNodeId,
          })),

        duplicateNode: (nodeId) =>
          set((s) => {
            const node = s.nodes.find((n) => n.id === nodeId);
            if (!node) return s;

            const newId = nanoid(8);
            const duplicatedNode: Node<NodeData> = {
              ...structuredClone(node), // deep copy all fields
              id: newId,
              position: {
                x: node.position.x + 40,
                y: node.position.y + 40,
              },
            };

            return {
              nodes: [...s.nodes, duplicatedNode],
              selectedNodeId: newId,
            };
          }),

        clearWorkflow: () =>
          set({ nodes: [], edges: [], selectedNodeId: null }),

        setGraph: (graph) =>
          set(() => ({ nodes: graph.nodes, edges: graph.edges })),
        clearUiState: () =>
          set(() => ({
            selectedNodeId: null,
            runStatus: 'idle',
            currentRunId: null,
            logs: [],
            nodeRunStatuses: {},
            stepDurations: {},
          })),

        // === Run Slice Implementation ===
        setRunStatus: (status, runId) =>
          set((s) => ({
            runStatus: status,
            currentRunId:
              typeof runId === 'undefined' ? s.currentRunId : (runId ?? null),
          })),
        appendLog: (line) => set((s) => ({ logs: [...s.logs, line] })),
        resetRun: () =>
          set({
            runStatus: 'idle',
            currentRunId: null,
            logs: [],
            nodeRunStatuses: {},
            stepDurations: {},
          }),
        setNodeRunStatuses: (m) => set({ nodeRunStatuses: m }),
        updateNodeRunStatus: (id, status) =>
          set((s) => ({
            nodeRunStatuses: { ...s.nodeRunStatuses, [id]: status },
          })),
        setStepDuration: (nodeId, durationMs) =>
          set((s) => ({
            stepDurations: { ...s.stepDurations, [nodeId]: durationMs },
          })),
      };
    }),
    { name: 'automateos-builder' }
  )
);

// === LocalStorage Auto-Save Subscription ===
// Subscribe to nodes and edges changes and persist to localStorage (dev only)
if (isDevStorageEnabled()) {
  let saveTimer: number | null = null;

  const save = (nodes: Node<NodeData>[], edges: Edge[]) => {
    try {
      // Create a workflow object that matches WorkflowSchema
      // We need to cast the nodes and edges to match the schema types
      const workflow = {
        nodes: nodes as any, // Cast to WorkflowNode[] for validation
        edges: edges as any, // Cast to WorkflowEdge[] for validation
        meta: {
          name: 'Autosaved Workflow',
          version: 1 as const,
          exportedAt: new Date().toISOString(),
        },
      };

      // Validate before saving
      const result = WorkflowSchema.safeParse(workflow);
      if (result.success) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
      } else {
        console.warn('Failed to validate workflow for autosave:', result.error);
      }
    } catch (error) {
      console.warn('Failed to save builder state to localStorage:', error);
    }
  };

  useBuilderStore.subscribe(
    (state) => ({ nodes: state.nodes, edges: state.edges }),
    (state) => {
      if (saveTimer) window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => save(state.nodes, state.edges), 120);
    },
    {
      equalityFn: shallow,
    }
  );
}

// === Performance-Optimized Selector Hooks ===

// Basic selectors
export const useNodes = () => useBuilderStore((state) => state.nodes);
export const useEdges = () => useBuilderStore((state) => state.edges);
export const useSelectedNodeId = () =>
  useBuilderStore((state) => state.selectedNodeId);

// Derived selectors with optimized comparison
export const useSelectedNode = () =>
  useBuilderStore(
    (s) => s.nodes.find((n) => n.id === s.selectedNodeId) ?? null
  );

// Grouped selectors to prevent re-renders (using simple object selectors)
export const useReactFlowHandlers = () => {
  const onNodesChange = useBuilderStore((s) => s.onNodesChange);
  const onEdgesChange = useBuilderStore((s) => s.onEdgesChange);
  const onConnect = useBuilderStore((s) => s.onConnect);
  return { onNodesChange, onEdgesChange, onConnect };
};

export const useGraphActions = () => {
  const addNode = useBuilderStore((s) => s.addNode);
  const removeNode = useBuilderStore((s) => s.removeNode);
  const duplicateNode = useBuilderStore((s) => s.duplicateNode);
  const clearWorkflow = useBuilderStore((s) => s.clearWorkflow);
  const setGraph = useBuilderStore((s) => s.setGraph);
  const clearUiState = useBuilderStore((s) => s.clearUiState);
  return {
    addNode,
    removeNode,
    duplicateNode,
    clearWorkflow,
    setGraph,
    clearUiState,
  };
};

export const useSelectionActions = () => {
  const setSelectedNode = useBuilderStore((s) => s.setSelectedNode);
  const updateNodeConfig = useBuilderStore((s) => s.updateNodeConfig);
  return { setSelectedNode, updateNodeConfig };
};

// Run state selectors
export const useRunState = () => {
  const runStatus = useBuilderStore((s) => s.runStatus);
  const currentRunId = useBuilderStore((s) => s.currentRunId);
  const logs = useBuilderStore((s) => s.logs);
  const nodeRunStatuses = useBuilderStore((s) => s.nodeRunStatuses);
  const stepDurations = useBuilderStore((s) => s.stepDurations);
  return { runStatus, currentRunId, logs, nodeRunStatuses, stepDurations };
};

export const useRunActions = () => {
  const setRunStatus = useBuilderStore((s) => s.setRunStatus);
  const appendLog = useBuilderStore((s) => s.appendLog);
  const resetRun = useBuilderStore((s) => s.resetRun);
  return { setRunStatus, appendLog, resetRun };
};

// === Builder-specific Actions ===

// Add start node with validation (only one start node allowed)
export const addStartNode = () =>
  useBuilderStore.setState((s) => {
    if (s.nodes.some((n) => n.type === 'start')) return s;
    return {
      nodes: [
        ...s.nodes,
        {
          id: nanoid(8),
          type: 'start',
          position: { x: 80, y: 80 },
          data: { label: 'Start' },
        },
      ],
    };
  });

// Workflow validation helpers
export const useIsWorkflowValid = () => {
  const nodes = useBuilderStore((state) => state.nodes);
  // Basic validation: must have at least one start node
  return nodes.some((node) => node.type === 'start');
};

// === Development & Testing Helpers ===

// Test-only reset helper (deterministic tests)
export const resetBuilderStore = () =>
  useBuilderStore.setState({
    nodes: [],
    edges: [],
    selectedNodeId: null,
    runStatus: 'idle',
    currentRunId: null,
    logs: [],
    nodeRunStatuses: {},
    stepDurations: {},
  });

// Debug helper (development only)
export const getStoreSnapshot = () => {
  if (process.env.NODE_ENV === 'development') {
    return useBuilderStore.getState();
  }
  return null;
};
