import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useBuilderStore,
  useReactFlowHandlers,
  useGraphActions,
  useSelectionActions,
  useSelectedNode,
  useIsWorkflowValid,
  resetBuilderStore,
  addStartNode,
} from '../core/state';

describe('Enhanced Store Selectors', () => {
  beforeEach(() => {
    resetBuilderStore();
  });

  it('should provide stable React Flow handlers', () => {
    const { result, rerender } = renderHook(() => useReactFlowHandlers());

    const firstHandlers = result.current;

    // Trigger a state change
    act(() => {
      const { addNode } = useBuilderStore.getState();
      addNode({
        type: 'start',
        position: { x: 0, y: 0 },
        data: { label: 'Start' },
      });
    });

    rerender();
    const secondHandlers = result.current;

    // Handlers should be stable references
    expect(firstHandlers.onNodesChange).toBe(secondHandlers.onNodesChange);
    expect(firstHandlers.onEdgesChange).toBe(secondHandlers.onEdgesChange);
    expect(firstHandlers.onConnect).toBe(secondHandlers.onConnect);
  });

  it('should provide graph actions correctly', () => {
    const { result } = renderHook(() => useGraphActions());

    expect(typeof result.current.addNode).toBe('function');
    expect(typeof result.current.removeNode).toBe('function');
    expect(typeof result.current.clearWorkflow).toBe('function');

    act(() => {
      result.current.addNode({
        type: 'start',
        position: { x: 0, y: 0 },
        data: { label: 'Start' },
      });
    });

    const nodes = useBuilderStore.getState().nodes;
    expect(nodes).toHaveLength(1);
  });

  it('should provide selection actions correctly', () => {
    const { result } = renderHook(() => useSelectionActions());

    expect(typeof result.current.setSelectedNode).toBe('function');
    expect(typeof result.current.updateNodeConfig).toBe('function');

    // Add a node first
    act(() => {
      const { addNode } = useBuilderStore.getState();
      addNode({
        id: 'test-node',
        type: 'start',
        position: { x: 0, y: 0 },
        data: { label: 'Start' },
      });
    });

    act(() => {
      result.current.setSelectedNode('test-node');
    });

    expect(useBuilderStore.getState().selectedNodeId).toBe('test-node');
  });

  it('should return selected node correctly', () => {
    const { result: selectedNodeResult } = renderHook(() => useSelectedNode());

    // Initially no selection
    expect(selectedNodeResult.current).toBeNull();

    // Add and select a node
    act(() => {
      const { addNode, setSelectedNode } = useBuilderStore.getState();
      addNode({
        id: 'test-node',
        type: 'start',
        position: { x: 0, y: 0 },
        data: { label: 'Start' },
      });
      setSelectedNode('test-node');
    });

    expect(selectedNodeResult.current?.id).toBe('test-node');
    expect(selectedNodeResult.current?.type).toBe('start');
  });

  it('should validate workflow correctly', () => {
    const { result } = renderHook(() => useIsWorkflowValid());

    // Initially invalid (no start node)
    expect(result.current).toBe(false);

    // Add a non-start node
    act(() => {
      const { addNode } = useBuilderStore.getState();
      addNode({
        type: 'http',
        position: { x: 0, y: 0 },
        data: { label: 'HTTP' },
      });
    });

    expect(result.current).toBe(false);

    // Add a start node
    act(() => {
      const { addNode } = useBuilderStore.getState();
      addNode({
        type: 'start',
        position: { x: 0, y: 0 },
        data: { label: 'Start' },
      });
    });

    expect(result.current).toBe(true);
  });

  it('should handle addStartNode helper correctly', () => {
    const initialState = useBuilderStore.getState();
    expect(initialState.nodes).toHaveLength(0);

    // Add first start node
    act(() => {
      addStartNode();
    });

    const state1 = useBuilderStore.getState();
    expect(state1.nodes).toHaveLength(1);
    expect(state1.nodes[0].type).toBe('start');

    // Try to add another start node (should be ignored)
    act(() => {
      addStartNode();
    });

    const state2 = useBuilderStore.getState();
    expect(state2.nodes).toHaveLength(1); // Still only one node
  });

  it('should reset store correctly', () => {
    // Add some data
    act(() => {
      const { addNode, setSelectedNode } = useBuilderStore.getState();
      addNode({
        type: 'start',
        position: { x: 0, y: 0 },
        data: { label: 'Start' },
      });
      setSelectedNode('test-id');
    });

    const beforeReset = useBuilderStore.getState();
    expect(beforeReset.nodes).toHaveLength(1);
    expect(beforeReset.selectedNodeId).toBe('test-id');

    // Reset
    act(() => {
      resetBuilderStore();
    });

    const afterReset = useBuilderStore.getState();
    expect(afterReset.nodes).toEqual([]);
    expect(afterReset.edges).toEqual([]);
    expect(afterReset.selectedNodeId).toBeNull();
  });
});
