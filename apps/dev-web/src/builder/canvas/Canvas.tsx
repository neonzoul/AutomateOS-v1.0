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
import AppNode from './nodes/AppNode';
import AgentNode from './nodes/AgentNode';
import ConditionNode from './nodes/ConditionNode';
import StopNode from './nodes/StopNode';
import { NODE_SPECS } from '../registry/nodeSpecs';
import { AppNodeToolbar } from './AppNodeToolbar';
import { LeftSidebar } from '../sidebar/LeftSidebar';
import { ControllerBar } from '../controls/ControllerBar';
import { Inspector } from '../inspector/Inspector';
import { RunPanel } from '../run/RunPanel';
import { PanelToggle } from '../../components/ui/PanelToggle';
import { startRun } from '../run/runActions';

// Node types registry
const nodeTypes: NodeTypes = {
  start: StartNode,
  http: HttpNode,
  app: AppNode,
  agent: AgentNode,
  condition: ConditionNode,
  stop: StopNode,
};

interface CanvasProps {
  onHttpNodeCreate?: (handler: (e: React.MouseEvent) => void) => void;
  httpNodeHandler: ((e: React.MouseEvent) => void) | null;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  onClear: () => void;
  onAppNodeHandlersReady?: (handlers: Record<string, (e: React.MouseEvent) => void>) => void;
}

/**
 * Canvas: Main React Flow workflow builder canvas
 * - Integrates with Zustand store for state management
 * - Provides pan, zoom, selection capabilities
 * - Ready for custom node types
 * - Contains all floating UI panels as absolute positioned overlays
 */
export function Canvas({
  onHttpNodeCreate,
  httpNodeHandler,
  leftPanelOpen,
  rightPanelOpen,
  onToggleLeftPanel,
  onToggleRightPanel,
  onClear,
  onAppNodeHandlersReady
}: CanvasProps) {
  const nodes = useNodes();
  const edges = useEdges();
  const selectedNodeId = useSelectedNodeId();
  const { onNodesChange, onEdgesChange, onConnect } = useReactFlowHandlers();
  const { setSelectedNode } = useSelectionActions();
  const { addNode, removeNode, duplicateNode } = useGraphActions();
  const { screenToFlowPosition } = useReactFlow();

  // Generic node creation handler factory
  const createNodeHandler = useCallback(
    (appName: string, icon?: string) => (evt: React.MouseEvent) => {
      let position;
      try {
        const base = screenToFlowPosition({
          x: evt.clientX,
          y: evt.clientY + 40,
        });
        position = base;
      } catch (error) {
        console.warn(
          'screenToFlowPosition failed, using fallback position:',
          error
        );
        position = { x: 200, y: 200 };
      }

      const spec = NODE_SPECS['http'];
      addNode({
        type: 'http',
        position,
        data: {
          ...spec.defaultData,
          label: appName,
          icon: icon || appName.toLowerCase(),
          description: `Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit.`,
          tags: ['Tag', 'Tag', 'Tag'],
          config: { method: 'POST', url: `https://api.${appName.toLowerCase()}.com` }
        }
      });
    },
    [screenToFlowPosition, addNode]
  );

  // HTTP node creation handler - expose to parent
  const handleHttpNodeCreate = useCallback(
    (evt: React.MouseEvent) => createNodeHandler('HTTP', 'http')(evt),
    [createNodeHandler]
  );

  // Condition node creation handler
  const handleConditionNodeCreate = useCallback(
    (evt: React.MouseEvent) => {
      let position;
      try {
        const base = screenToFlowPosition({
          x: evt.clientX,
          y: evt.clientY + 40,
        });
        position = base;
      } catch (error) {
        console.warn(
          'screenToFlowPosition failed, using fallback position:',
          error
        );
        position = { x: 200, y: 200 };
      }

      const spec = NODE_SPECS['condition'];
      addNode({
        type: 'condition',
        position,
        data: {
          ...spec.defaultData,
          description: 'Branch your workflow based on a condition',
          tags: ['Logic', 'Control', 'Branch'],
        }
      });
    },
    [screenToFlowPosition, addNode]
  );

  // Stop node creation handler
  const handleStopNodeCreate = useCallback(
    (evt: React.MouseEvent) => {
      let position;
      try {
        const base = screenToFlowPosition({
          x: evt.clientX,
          y: evt.clientY + 40,
        });
        position = base;
      } catch (error) {
        console.warn(
          'screenToFlowPosition failed, using fallback position:',
          error
        );
        position = { x: 200, y: 200 };
      }

      const spec = NODE_SPECS['stop'];
      addNode({
        type: 'stop',
        position,
        data: {
          ...spec.defaultData,
          description: 'End workflow execution',
          tags: ['Control', 'Flow', 'End'],
        }
      });
    },
    [screenToFlowPosition, addNode]
  );

  // Create handlers for all app nodes
  const appNodeHandlers = useCallback(() => {
    return {
      google: createNodeHandler('Google'),
      slack: createNodeHandler('Slack'),
      line: createNodeHandler('LINE'),
      notion: createNodeHandler('Notion'),
      facebook: createNodeHandler('Facebook'),
      tiktok: createNodeHandler('TikTok'),
      http: handleHttpNodeCreate,
      condition: handleConditionNodeCreate,
      stop: handleStopNodeCreate,
    };
  }, [createNodeHandler, handleHttpNodeCreate, handleConditionNodeCreate, handleStopNodeCreate]);

  // Expose HTTP node creation handler to parent
  useEffect(() => {
    if (onHttpNodeCreate) {
      onHttpNodeCreate(handleHttpNodeCreate);
    }
  }, [onHttpNodeCreate, handleHttpNodeCreate]);

  // Expose all app node handlers to parent
  useEffect(() => {
    if (onAppNodeHandlersReady) {
      onAppNodeHandlersReady(appNodeHandlers());
    }
  }, [onAppNodeHandlersReady, appNodeHandlers]);

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
    <div
      className="absolute inset-0"
      data-testid="canvas"
      style={{
        background: '#FCFDFF',
        width: '100%',
        height: '100%',
      }}
    >
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
            stroke: '#FF6B6B',
            strokeLinecap: 'round',
          },
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
        style={{
          background: 'transparent',
          width: '100%',
          height: '100%',
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={40}
          size={3}
          color="rgba(255,107,107,0.15)"
          style={{
            opacity: 0.08,
          }}
        />

        <Controls
          position="bottom-right"
          showZoom
          showFitView
          showInteractive
          style={{
            background: 'rgba(255, 248, 240, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 107, 107, 0.15)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(255, 107, 107, 0.08)',
            padding: '8px',
            marginRight: rightPanelOpen ? '400px' : '16px',
            transition: 'margin-right 0.3s ease',
          }}
        />

        <MiniMap
          position="bottom-left"
          nodeStrokeWidth={2}
          nodeColor={(node) => {
            if (node.type === 'start') return '#00DFA2';
            if (node.type === 'http') return '#FF6B6B';
            return '#A29BFE';
          }}
          maskColor="rgba(255, 107, 107, 0.08)"
          style={{
            background: 'rgba(255, 248, 240, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 107, 107, 0.15)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(255, 107, 107, 0.08)',
            overflow: 'hidden',
            marginLeft: leftPanelOpen ? '364px' : '16px',
            transition: 'margin-left 0.3s ease',
          }}
        />

        {nodes.length === 0 && (
          <Panel position="top-center" className="pointer-events-none">
            <div className="text-center space-y-6 max-w-lg mx-auto mt-40">
              <div
                className="w-16 h-16 mx-auto mb-8 rounded-full flex items-center justify-center animate-pulse"
                style={{
                  background: '#E84B4B',
                  boxShadow:
                    '0 8px 24px rgba(232,75,75,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
                  animationDuration: '4s',
                }}
              >
                <div
                  className="w-8 h-8 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.9)',
                  }}
                ></div>
              </div>
              <h2
                style={{
                  color: '#2D1B1B',
                  fontSize: '32px',
                  fontWeight: '600',
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                  letterSpacing: '-0.5px',
                  marginBottom: '16px',
                }}
              >
                Begin Your Creative Journey
              </h2>
              <p
                style={{
                  color: 'rgba(45,27,27,0.7)',
                  fontSize: '17px',
                  fontWeight: '400',
                  lineHeight: '1.6',
                  letterSpacing: '-0.2px',
                  maxWidth: '400px',
                  margin: '0 auto',
                }}
              >
                Every masterpiece starts with a single step. Click{' '}
                <span style={{ color: '#E84B4B', fontWeight: '600' }}>
                  ✨ Start
                </span>{' '}
                above to begin crafting something beautiful.
              </p>
              <div className="flex items-center justify-center gap-2 mt-6">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    background: '#E84B4B',
                    boxShadow: '0 2px 6px rgba(232,75,75,0.3)',
                  }}
                ></div>
                <span
                  style={{
                    color: 'rgba(45,27,27,0.5)',
                    fontSize: '15px',
                    fontWeight: '400',
                  }}
                >
                  Let your creativity flow
                </span>
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    background: '#E84B4B',
                    boxShadow: '0 2px 6px rgba(232,75,75,0.3)',
                    animationDelay: '2s',
                  }}
                ></div>
              </div>
            </div>
          </Panel>
        )}

        {/* Floating App Node Toolbar */}
        <Panel position="top-center" style={{ marginTop: '8px', zIndex: 100 }}>
          <AppNodeToolbar appNodeHandlers={appNodeHandlers()} />
        </Panel>

        {/* Floating Controller Bar */}
        <Panel position="bottom-center" style={{ marginBottom: '8px', zIndex: 100 }}>
          <ControllerBar
            onRun={async () => {
              const cleanNodes = nodes.map(({ style, animated, ...node }: any) => node);
              const cleanEdges = edges.map(({ style, animated, ...edge }: any) => edge);
              await startRun({ nodes: cleanNodes, edges: cleanEdges });
            }}
            onStop={() => console.log('Stop workflow')}
            onClear={onClear}
            isRunning={useBuilderStore((s) => s.runStatus === 'running')}
          />
        </Panel>
      </ReactFlow>

      {/* Left Sidebar - Floating panel */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: leftPanelOpen ? '350px' : '0px',
          background: 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(40px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.4)',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          zIndex: 50,
        }}
      >
        {leftPanelOpen && <LeftSidebar />}
      </div>

      {/* Left Panel Toggle - Always visible */}
      <div
        style={{
          position: 'absolute',
          left: leftPanelOpen ? '350px' : '0px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 100,
          transition: 'left 0.3s ease',
        }}
      >
        <PanelToggle
          isOpen={leftPanelOpen}
          onClick={onToggleLeftPanel}
          side="left"
        />
      </div>

      {/* Right Inspector + Run Panel - Floating panel */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: rightPanelOpen ? '386px' : '0px',
          background: 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(40px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          zIndex: 50,
        }}
      >
        {rightPanelOpen && (
          <>
            {/* Inspector Panel - Flexible height with scroll */}
            <div
              className="custom-scrollbar"
              style={{
                flex: 1,
                overflowY: 'scroll',
                overflowX: 'auto',
                borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              <Inspector />
            </div>

            {/* Run Panel - Fixed height */}
            <div
              className="custom-scrollbar"
              style={{
                height: '300px',
                overflowY: 'scroll',
                overflowX: 'auto',
                background:
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 248, 240, 0.72) 100%)',
                backdropFilter: 'blur(40px)',
              }}
            >
              <RunPanel />
            </div>
          </>
        )}
      </div>

      {/* Right Panel Toggle - Always visible */}
      <div
        style={{
          position: 'absolute',
          right: rightPanelOpen ? '386px' : '0px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 100,
          transition: 'right 0.3s ease',
        }}
      >
        <PanelToggle
          isOpen={rightPanelOpen}
          onClick={onToggleRightPanel}
          side="right"
        />
      </div>
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
