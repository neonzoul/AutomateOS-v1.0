import { expect, test } from 'vitest';
import { useBuilderStore } from '../core/state';

test('Zustand store basic functionality', () => {
  const store = useBuilderStore.getState();

  // Test initial state
  expect(store.nodes).toEqual([]);
  expect(store.edges).toEqual([]);
  expect(store.selectedNodeId).toBeNull();

  // Test adding a node
  store.addNode({
    type: 'start',
    position: { x: 0, y: 0 },
    data: { label: 'Start' },
  });

  const { nodes } = useBuilderStore.getState();
  expect(nodes).toHaveLength(1);
  expect(nodes[0].type).toBe('start');

  console.log('✅ Zustand store test passed!');
});
