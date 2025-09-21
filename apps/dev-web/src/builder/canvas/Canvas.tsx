// ::ORGANISM/CONTAINER:: CANVAS

'use client';

import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  NodeTypes,
  Panel,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  useNodes,
  useEdges,
  useReactFlowHandlers,
  useSelectionActions,
  useGraphActions,
  useSelectedNodeId,
  useBuilderStore,
} from '../../core/state';
import { useCredentialStore } from '../../core/credentials';

import StartNode from './nodes/StartNode';
import HttpNode from './nodes/HttpNode';
import { CanvasToolbar } from './CanvasToolbar';

// Node types registry
const nodeTypes: NodeTypes = {
  start: StartNode,
  http: HttpNode,
};

/**
 * Canvas: Main React Flow workflow builder canvas
 * - Integrates with Zustand store for state management
 * - Provides pan, zoom, selection capabilities
 * - Ready for custom node types
 */
export function Canvas() {
  const nodes = useNodes();
  const edges = useEdges();
  const selectedNodeId = useSelectedNodeId();
  const { onNodesChange, onEdgesChange, onConnect } = useReactFlowHandlers();
  const { setSelectedNode } = useSelectionActions();
  const { addNode, removeNode, duplicateNode } = useGraphActions();

  // Keyboard shortcuts handler
  useEffect(() => {
    const isEditable = (el: EventTarget | null) => {
      const t = el as HTMLElement | null;
      const active =
        (typeof document !== 'undefined'
          ? (document.activeElement as HTMLElement | null)
          : null) || t;
      if (!active) return false;
      const tag = active.tagName;
      if (active.isContentEditable) return true;
      if (active.getAttribute?.('contenteditable') === 'true') return true;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when a node is selected and not editing
      if (!selectedNodeId || isEditable(event.target)) {
        return;
      }

      // Explicit guard: if current active element is contentEditable, ignore shortcuts
      const active = document.activeElement as HTMLElement | null;
      if (
        active &&
        (active.isContentEditable ||
          active.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      switch (event.key) {
        case 'Delete':
        case 'Backspace':
          event.preventDefault();
          removeNode(selectedNodeId);
          break;
        case 'd':
        case 'D':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            duplicateNode(selectedNodeId);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, removeNode, duplicateNode]);

  // Handle node selection
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: any) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  // Handle canvas click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div className="h-full w-full bg-canvas relative overflow-hidden" data-testid="canvas">

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        connectOnClick={true}
        selectionOnDrag
        defaultEdgeOptions={{
          style: {
            strokeWidth: 2,
            stroke: '#007AFF',
          },
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
        style={{
          background: 'transparent',
        }}
      >
        <CanvasToolbar />

        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#D1D1D6"
          style={{
            opacity: 0.4,
          }}
        />

        <Controls
          position="bottom-right"
          showZoom
          showFitView
          showInteractive
        />

        <MiniMap
          position="bottom-left"
          nodeStrokeWidth={1}
          nodeColor={(node) => {
            if (node.type === 'start') return '#34C759';
            if (node.type === 'http') return '#007AFF';
            return '#86868B';
          }}
          maskColor="rgba(0, 0, 0, 0.05)"
        />

        {nodes.length === 0 && (
          <Panel position="top-center" className="pointer-events-none">
            <div className="text-center space-y-3 max-w-sm mx-auto mt-24">
              <h2 className="text-title-3 text-primary">
                Welcome to AutomateOS
              </h2>
              <p className="text-body text-secondary">
                Start by adding a trigger to begin building your workflow.
              </p>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

// Dev/Test helper: expose builder store snapshots for Playwright (non-production or test mode)
if (typeof window !== 'undefined') {
  // Runtime-aware test bridge exposure:
  // - Expose in dev builds
  // - Expose when USE_MOCK_GATEWAY env is 'true' at build time
  // - Expose when runtime indicates mock mode via localStorage or a window flag
  const shouldExposeBridge =
    process.env.NODE_ENV !== 'production' ||
    process.env.USE_MOCK_GATEWAY === 'true' ||
    (typeof window !== 'undefined' &&
      (window.localStorage?.getItem('mockApiMode') === 'true' ||
        (window as any).__AOS_ENABLE_TEST_BRIDGE === true));

  if (shouldExposeBridge) {
    const w = window as any;
    if (!w.__AOS_BUILDER_STORE_BOUND) {
      // Resilient binder: try to attach bridge immediately, and retry a few times
      const bindBridgeOnce = () => {
        try {
          // snapshot accessor
          w.__getBuilderSnapshot = () => {
            const s = useBuilderStore.getState();
            return { nodes: s.nodes, edges: s.edges };
          };

          // subscribe helper
          w.__subscribeBuilder = (cb: (s: any) => void) =>
            useBuilderStore.subscribe((s) =>
              cb({ nodes: s.nodes, edges: s.edges })
            );

          // setter: replace entire graph
          w.__setBuilderGraph = (graph: { nodes: any[]; edges: any[] }) => {
            const s = useBuilderStore.getState();
            s.setGraph(graph);
          };

          // select node by id
          w.__setSelectedNode = (nodeId: string | null) => {
            const s = useBuilderStore.getState();
            s.setSelectedNode(nodeId);
          };

          // credential store access for testing
          w.__getCredentialStore = () => {
            return useCredentialStore.getState();
          };

          w.__AOS_BUILDER_STORE_BOUND = true;
          return true;
        } catch (e) {
          return false;
        }
      };

      // Try binding immediately, then retry periodically for up to ~5 seconds
      if (!bindBridgeOnce()) {
        let tries = 0;
        const maxTries = 25; // 25 * 200ms = 5s
        const iv = setInterval(() => {
          tries += 1;
          const ok = bindBridgeOnce();
          if (ok || tries >= maxTries) {
            clearInterval(iv);
            if (!ok) {
              // final warning for debugging in CI
              // eslint-disable-next-line no-console
              console.warn(
                '[builder] test bridge binding timed out after retries'
              );
            }
          }
        }, 200);
      }
    }
  }
}
