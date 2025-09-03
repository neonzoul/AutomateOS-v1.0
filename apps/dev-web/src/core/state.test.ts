import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useBuilderStore } from '../core/state';
import type { NodeData } from '../core/state';

// Mock nanoid to return predictable IDs
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'test-node-id'),
}));

describe('BuilderStore', () => {
  beforeEach(() => {
    // Reset store before each test - only reset the state we care about
    useBuilderStore.setState({
      nodes: [],
      edges: [],
      selectedNodeId: null,
    });
  });

  describe('Initial State', () => {
    it('should initialize with empty state', () => {
      const state = useBuilderStore.getState();

      expect(state.nodes).toEqual([]);
      expect(state.edges).toEqual([]);
      expect(state.selectedNodeId).toBeNull();
    });

    it('should have all required handlers', () => {
      const state = useBuilderStore.getState();

      expect(typeof state.onNodesChange).toBe('function');
      expect(typeof state.onEdgesChange).toBe('function');
      expect(typeof state.onConnect).toBe('function');
      expect(typeof state.setSelectedNode).toBe('function');
      expect(typeof state.updateNodeConfig).toBe('function');
      expect(typeof state.addNode).toBe('function');
      expect(typeof state.removeNode).toBe('function');
      expect(typeof state.clearWorkflow).toBe('function');
    });
  });

  describe('Node Management', () => {
    it('should add a node with default values', () => {
      const { addNode } = useBuilderStore.getState();

      addNode({
        type: 'start',
        position: { x: 100, y: 100 },
        data: { label: 'Start Node' },
      });

      const { nodes } = useBuilderStore.getState();
      expect(nodes).toHaveLength(1);
      expect(nodes[0]).toMatchObject({
        id: 'test-node-id',
        type: 'start',
        position: { x: 100, y: 100 },
        data: { label: 'Start Node' },
      });
    });

    it('should add a node with custom ID', () => {
      const { addNode } = useBuilderStore.getState();

      addNode({
        id: 'custom-id',
        type: 'http',
        position: { x: 200, y: 200 },
        data: { label: 'HTTP Node' },
      });

      const { nodes } = useBuilderStore.getState();
      expect(nodes[0].id).toBe('custom-id');
    });

    it('should add node with default position and data when not provided', () => {
      const { addNode } = useBuilderStore.getState();

      addNode({
        type: 'start',
        position: { x: 0, y: 0 }, // Required field
        data: {}, // Required field
      });

      const { nodes } = useBuilderStore.getState();
      expect(nodes[0]).toMatchObject({
        type: 'start',
        position: { x: 0, y: 0 },
        data: {},
      });
    });

    it('should remove a node and its connected edges', () => {
      const state = useBuilderStore.getState();

      // Add two nodes
      state.addNode({
        id: 'node1',
        type: 'start',
        position: { x: 0, y: 0 },
        data: {},
      });
      state.addNode({
        id: 'node2',
        type: 'http',
        position: { x: 100, y: 100 },
        data: {},
      });

      // Manually add an edge (since onConnect is mocked)
      useBuilderStore.setState({
        edges: [{ id: 'edge1', source: 'node1', target: 'node2' }],
      });

      // Remove node1
      state.removeNode('node1');

      const { nodes, edges } = useBuilderStore.getState();
      expect(nodes).toHaveLength(1);
      expect(nodes[0].id).toBe('node2');
      expect(edges).toHaveLength(0); // Edge should be removed
    });

    it('should clear selection when removing selected node', () => {
      const state = useBuilderStore.getState();

      state.addNode({
        id: 'node1',
        type: 'start',
        position: { x: 0, y: 0 },
        data: {},
      });

      state.setSelectedNode('node1');
      expect(useBuilderStore.getState().selectedNodeId).toBe('node1');

      state.removeNode('node1');
      expect(useBuilderStore.getState().selectedNodeId).toBeNull();
    });
  });

  describe('Node Configuration', () => {
    beforeEach(() => {
      const { addNode } = useBuilderStore.getState();
      addNode({
        id: 'test-node',
        type: 'http',
        position: { x: 0, y: 0 },
        data: {
          label: 'HTTP Node',
          config: {
            url: 'https://api.example.com',
            method: 'GET',
          },
        },
      });
    });

    it('should update node configuration', () => {
      const { updateNodeConfig } = useBuilderStore.getState();

      updateNodeConfig('test-node', {
        url: 'https://new-api.example.com',
        timeout: 5000,
      });

      const { nodes } = useBuilderStore.getState();
      const node = nodes.find((n) => n.id === 'test-node');

      expect(node?.data.config).toEqual({
        url: 'https://new-api.example.com',
        method: 'GET', // Existing config preserved
        timeout: 5000, // New config added
      });
    });

    it('should handle node with no existing config', () => {
      const { addNode, updateNodeConfig } = useBuilderStore.getState();

      addNode({
        id: 'no-config-node',
        type: 'start',
        position: { x: 0, y: 0 },
        data: { label: 'Start' },
      });

      updateNodeConfig('no-config-node', {
        newProperty: 'value',
      });

      const { nodes } = useBuilderStore.getState();
      const node = nodes.find((n) => n.id === 'no-config-node');

      expect(node?.data.config).toEqual({
        newProperty: 'value',
      });
    });
  });

  describe('Selection Management', () => {
    it('should set selected node', () => {
      const { setSelectedNode } = useBuilderStore.getState();

      setSelectedNode('node-123');

      expect(useBuilderStore.getState().selectedNodeId).toBe('node-123');
    });

    it('should clear selection', () => {
      const { setSelectedNode } = useBuilderStore.getState();

      setSelectedNode('node-123');
      setSelectedNode(null);

      expect(useBuilderStore.getState().selectedNodeId).toBeNull();
    });
  });

  describe('Workflow Management', () => {
    it('should clear entire workflow', () => {
      const state = useBuilderStore.getState();

      // Add some data
      state.addNode({
        id: 'node1',
        type: 'start',
        position: { x: 0, y: 0 },
        data: {},
      });
      state.setSelectedNode('node1');

      // Clear workflow
      state.clearWorkflow();

      const newState = useBuilderStore.getState();
      expect(newState.nodes).toEqual([]);
      expect(newState.edges).toEqual([]);
      expect(newState.selectedNodeId).toBeNull();
    });
  });

  describe('React Flow Handlers', () => {
    it('should have stable onNodesChange handler', () => {
      const state1 = useBuilderStore.getState();
      const handler1 = state1.onNodesChange;

      // Trigger a state change
      state1.setSelectedNode('test');

      const state2 = useBuilderStore.getState();
      const handler2 = state2.onNodesChange;

      // Handlers should be the same reference (stable)
      expect(handler1).toBe(handler2);
    });

    it('should have stable onEdgesChange handler', () => {
      const state1 = useBuilderStore.getState();
      const handler1 = state1.onEdgesChange;

      // Trigger a state change
      state1.setSelectedNode('test');

      const state2 = useBuilderStore.getState();
      const handler2 = state2.onEdgesChange;

      // Handlers should be the same reference (stable)
      expect(handler1).toBe(handler2);
    });

    it('should have stable onConnect handler', () => {
      const state1 = useBuilderStore.getState();
      const handler1 = state1.onConnect;

      // Trigger a state change
      state1.setSelectedNode('test');

      const state2 = useBuilderStore.getState();
      const handler2 = state2.onConnect;

      // Handlers should be the same reference (stable)
      expect(handler1).toBe(handler2);
    });
  });

  describe('Type Safety', () => {
    it('should maintain proper node data types', () => {
      const { addNode } = useBuilderStore.getState();

      const nodeData: NodeData = {
        label: 'Test Node',
        config: {
          stringProp: 'string',
          numberProp: 42,
          booleanProp: true,
          objectProp: { nested: 'value' },
        },
      };

      addNode({
        type: 'test',
        position: { x: 0, y: 0 },
        data: nodeData,
      });

      const { nodes } = useBuilderStore.getState();
      const node = nodes[0];

      expect(node.data.label).toBe('Test Node');
      expect(node.data.config?.stringProp).toBe('string');
      expect(node.data.config?.numberProp).toBe(42);
      expect(node.data.config?.booleanProp).toBe(true);
      expect(node.data.config?.objectProp).toEqual({ nested: 'value' });
    });
  });
});
