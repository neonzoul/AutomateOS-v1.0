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
} from '../../core/state';

import StartNode from './nodes/StartNode';
import HttpNode from './nodes/HttpNode';
import { NODE_SPECS } from '../registry/nodeSpecs';

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
      if (!t) return false;
      const tag = t.tagName;
      return (
        t.isContentEditable ||
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT'
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when a node is selected and not editing
      if (!selectedNodeId || isEditable(event.target)) {
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

  function ToolbarButtons() {
    const { screenToFlowPosition } = useReactFlow();
    const { addNode, clearWorkflow } = useGraphActions();
    const nodes = useNodes();
    const hasStart = nodes.some((n) => n.type === 'start');

    const addAtCursor = useCallback(
      (evt: React.MouseEvent, type: 'start' | 'http') => {
        if (type === 'start' && nodes.some((n) => n.type === 'start')) {
          alert('Only one Start node is allowed.');
          return;
        }

        const position = screenToFlowPosition({
          x: evt.clientX,
          y: evt.clientY,
        });
        const spec = NODE_SPECS[type];
        addNode({ type, position, data: spec.defaultData });
      },
      [screenToFlowPosition, addNode, nodes]
    );

    const handleClearWorkflow = useCallback(() => {
      if (
        confirm(
          'Are you sure you want to clear the entire workflow? This action cannot be undone.'
        )
      ) {
        clearWorkflow();
      }
    }, [clearWorkflow]);

    return (
      <Panel position="top-left">
        <div className="flex gap-2 bg-white/80 backdrop-blur px-2 py-1 rounded border shadow-sm">
          <button
            className={`px-2 py-1 text-sm rounded transition-colors ${
              hasStart
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
            onClick={(e) => addAtCursor(e, 'start')}
            disabled={hasStart}
            title={hasStart ? 'Only one Start node allowed' : 'Add Start node'}
          >
            + Start
          </button>
          <button
            className="px-2 py-1 text-sm rounded bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
            onClick={(e) => addAtCursor(e, 'http')}
          >
            + HTTP
          </button>
          <div className="w-px bg-gray-300" />
          <button
            className="px-2 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
            onClick={handleClearWorkflow}
            title="Clear workflow"
          >
            Clear
          </button>
        </div>
      </Panel>
    );
  }

  return (
    <div className="h-full w-full" data-testid="canvas">
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
        snapGrid={[16, 16]}
        connectOnClick={true}
        selectionOnDrag
        defaultEdgeOptions={{
          style: { strokeWidth: 2, stroke: '#6366f1' },
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
      >
        <ToolbarButtons />
        {/* Background with dot pattern */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#e2e8f0"
        />

        {/* Controls for zoom/pan/fit */}
        <Controls
          position="bottom-right"
          showZoom
          showFitView
          showInteractive
        />

        {/* Mini map for navigation */}
        <MiniMap
          position="bottom-left"
          nodeStrokeWidth={3}
          nodeColor="#6366f1"
          maskColor="rgba(0, 0, 0, 0.1)"
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
      </ReactFlow>
    </div>
  );
}
