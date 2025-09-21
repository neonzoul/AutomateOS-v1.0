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
    <div className="h-full w-full bg-canvas-light relative overflow-hidden" data-testid="canvas">
      {/* Ambient background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-cream-100/30 via-transparent to-coral-50/20 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-coral-100/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-100/10 rounded-full blur-3xl pointer-events-none" />

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
            strokeWidth: 3,
            stroke: '#e84b4b',
            strokeDasharray: '8,8',
          },
          animated: true,
        }}
        proOptions={{ hideAttribution: true }}
        style={{
          background: 'transparent',
        }}
      >
        <CanvasToolbar />

        {/* Beautiful organic background pattern */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={30}
          size={2}
          color="#e84b4b"
          style={{
            opacity: 0.15,
          }}
        />

        {/* Enhanced controls with better styling */}
        <Controls
          position="bottom-right"
          showZoom
          showFitView
          showInteractive
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(232, 75, 75, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            padding: '8px',
          }}
        />

        {/* Enhanced mini map */}
        <MiniMap
          position="bottom-left"
          nodeStrokeWidth={2}
          nodeColor={(node) => {
            if (node.type === 'start') return '#10b981';
            if (node.type === 'http') return '#e84b4b';
            return '#6b7280';
          }}
          maskColor="rgba(232, 75, 75, 0.1)"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(232, 75, 75, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
          }}
        />

        {/* Floating inspiration message */}
        {nodes.length === 0 && (
          <Panel position="top-center" className="pointer-events-none mt-32">
            <div className="text-center space-y-4 max-w-md mx-auto">
              <div className="text-6xl animate-float">✨</div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">
                  Welcome to AutomateOS
                </h2>
                <p className="text-gray-600">
                  Your creative automation playground awaits!
                  Start by adding a <span className="font-semibold text-emerald-600">Trigger</span> to begin building something magical.
                </p>
              </div>
              <div className="text-sm text-gray-500 flex items-center justify-center gap-2 mt-6">
                <div className="w-2 h-2 bg-coral-400 rounded-full animate-pulse" />
                <span>Click the toolbar above to get started</span>
                <div className="w-2 h-2 bg-coral-400 rounded-full animate-pulse" />
              </div>
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
