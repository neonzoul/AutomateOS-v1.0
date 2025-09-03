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
  clearWorkflow: () => void;
}

// === Initial Store State Interface ===
const initialNodes: Node<NodeData>[] = [];
const initialEdges: Edge[] = [];

export const useBuilderStore = create<BuilderState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      nodes: initialNodes,
      edges: initialEdges,
      selectedNodeId: null,

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
          selectedNodeId: s.selectedNodeId === nodeId ? null : s.selectedNodeId,
        })),

      clearWorkflow: () => set({ nodes: [], edges: [], selectedNodeId: null }),
    })),
    { name: 'automateos-builder' }
  )
);

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
  const clearWorkflow = useBuilderStore((s) => s.clearWorkflow);
  return { addNode, removeNode, clearWorkflow };
};

export const useSelectionActions = () => {
  const setSelectedNode = useBuilderStore((s) => s.setSelectedNode);
  const updateNodeConfig = useBuilderStore((s) => s.updateNodeConfig);
  return { setSelectedNode, updateNodeConfig };
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
  });

// Debug helper (development only)
export const getStoreSnapshot = () => {
  if (process.env.NODE_ENV === 'development') {
    return useBuilderStore.getState();
  }
  return null;
};
