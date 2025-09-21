// ::ORGANISM:: CANVAS TOOLBAR

'use client';

import React, { useCallback, useRef } from 'react';
import { Panel, useReactFlow } from '@xyflow/react';

import { useNodes, useEdges, useGraphActions } from '../../core/state';
import { NODE_SPECS } from '../registry/nodeSpecs';
import { exportWorkflow, importWorkflow } from '../io/importExport';
import { useBuilderStore } from '../../core/state';
import { WorkflowSchema } from '@automateos/workflow-schema';

// Lightweight toast shim (replace with real UI system later)
function notify(opts: {
  type?: 'success' | 'error';
  title: string;
  message?: string;
}) {
  if (typeof window === 'undefined') return;
  const color = opts.type === 'error' ? '#dc2626' : '#16a34a';
  // eslint-disable-next-line no-console
  console.log(
    `[%c${opts.title}%c] ${opts.message ?? ''}`,
    `color:${color};font-weight:bold;`,
    'color:inherit;'
  );
}

/**
 * CanvasToolbar: Main toolbar for canvas actions including Import/Export
 * - One-click import/export with no raw JSON exposure
 * - File input handling with validation and reset
 * - Toast feedback for success/error states
 * - Node creation shortcuts (Start, HTTP)
 */
export function CanvasToolbar() {
  const { screenToFlowPosition } = useReactFlow();
  const { addNode, clearWorkflow } = useGraphActions();
  const setGraph = useBuilderStore((s) => s.setGraph);
  const clearUiState = useBuilderStore((s) => s.clearUiState);
  const nodes = useNodes();
  const edges = useEdges();
  const hasStart = nodes.some((n) => n.type === 'start');

  // Ref for file input to enable programmatic reset
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addAtCursor = useCallback(
    (evt: React.MouseEvent, type: 'start' | 'http') => {
      if (type === 'start' && nodes.some((n) => n.type === 'start')) {
        alert('Only one Start node is allowed.');
        return;
      }

      // Get position - use cursor position if available, otherwise use center of canvas
      let position;
      try {
        const base = screenToFlowPosition({
          x: evt.clientX + 140, // push right of toolbar
          y: evt.clientY + 40, // push below toolbar
        });
        position = base;
      } catch (error) {
        // Fallback to center position if screenToFlowPosition fails
        console.warn(
          'screenToFlowPosition failed, using fallback position:',
          error
        );
        position = { x: 200, y: 200 };
      }

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

  const onExport = async () => {
    try {
      await exportWorkflow({ nodes, edges, name: 'Workflow' });
      notify({ title: 'Exported', message: 'Workflow JSON downloaded.' });
    } catch (e) {
      notify({
        type: 'error',
        title: 'Export failed',
        message: (e as any)?.message,
      });
    }
  };

  const onImport: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const wf = await importWorkflow(file);
      setGraph({ nodes: wf.nodes as any, edges: wf.edges as any });
      clearUiState();
      notify({ title: 'Imported', message: 'Workflow loaded onto canvas.' });
    } catch (e) {
      const err: any = e;
      const code = err?.code;
      const msg =
        code === 'INVALID_JSON'
          ? 'File is not valid JSON'
          : code === 'INVALID_SCHEMA'
            ? 'Schema validation failed'
            : err?.message || 'Import failed';
      notify({ type: 'error', title: 'Import error', message: msg });
    } finally {
      // Reset file input to allow re-selecting the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onLoadSlackTemplate = async () => {
    try {
      const response = await fetch('/examples/slack-notification.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.status}`);
      }

      const templateData = await response.json();

      // Validate with WorkflowSchema
      const parsed = WorkflowSchema.safeParse(templateData);
      if (!parsed.success) {
        throw new Error('Template validation failed: Invalid schema');
      }

      // Load into the graph
      setGraph({
        nodes: parsed.data.nodes as any,
        edges: parsed.data.edges as any,
      });
      clearUiState();

      notify({
        title: 'Slack Template Loaded',
        message:
          '⚠️ Replace the webhook URL in the HTTP node with your own Slack webhook!',
      });
    } catch (e) {
      notify({
        type: 'error',
        title: 'Template load failed',
        message: (e as any)?.message || 'Could not load Slack template',
      });
    }
  };

  const onLoadNotionTemplate = async () => {
    try {
      const response = await fetch('/examples/notion-automation.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.status}`);
      }

      const templateData = await response.json();

      // Validate with WorkflowSchema
      const parsed = WorkflowSchema.safeParse(templateData);
      if (!parsed.success) {
        throw new Error('Template validation failed: Invalid schema');
      }

      // Load into the graph
      setGraph({
        nodes: parsed.data.nodes as any,
        edges: parsed.data.edges as any,
      });
      clearUiState();

      notify({
        title: 'Notion Template Loaded',
        message:
          '⚠️ Update the database ID and create a "notion-integration-token" credential with your Notion Integration Token!',
      });
    } catch (e) {
      notify({
        type: 'error',
        title: 'Template load failed',
        message: (e as any)?.message || 'Could not load Notion template',
      });
    }
  };

  return (
    <Panel position="top-left" style={{ zIndex: 1000 }}>
      <div
        className="flex gap-3 backdrop-blur-xl"
        style={{
          background: 'rgba(255,255,255,0.9)',
          padding: '12px 16px',
          borderRadius: '28px',
          border: '1px solid rgba(232,75,75,0.1)',
          boxShadow: '0 8px 24px rgba(232,75,75,0.08), 0 2px 8px rgba(232,75,75,0.04), inset 0 1px 0 rgba(255,255,255,0.8)'
        }}
      >
        {/* Node Creation Buttons */}
        <button
          onClick={(e) => addAtCursor(e, 'start')}
          disabled={hasStart}
          title={hasStart ? 'Only one workflow trigger allowed' : 'Add workflow trigger'}
          aria-label={
            hasStart ? 'Only one workflow trigger allowed' : 'Add workflow trigger'
          }
          style={{
            background: hasStart
              ? 'rgba(232,75,75,0.1)'
              : '#E84B4B',
            color: hasStart ? 'rgba(232,75,75,0.5)' : 'rgba(255,255,255,0.95)',
            fontSize: '14px',
            fontWeight: '600',
            padding: '10px 16px',
            borderRadius: '20px',
            border: 'none',
            cursor: hasStart ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: hasStart
              ? 'none'
              : '0 4px 12px rgba(232,75,75,0.15), inset 0 1px 0 rgba(255,255,255,0.3)',
            transform: 'scale(1)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif'
          }}
          onMouseEnter={(e) => {
            if (!hasStart) {
              const target = e.target as HTMLButtonElement;
              target.style.transform = 'scale(1.02)';
              target.style.boxShadow = '0 6px 16px rgba(232,75,75,0.2), inset 0 1px 0 rgba(255,255,255,0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!hasStart) {
              const target = e.target as HTMLButtonElement;
              target.style.transform = 'scale(1)';
              target.style.boxShadow = '0 4px 12px rgba(232,75,75,0.15), inset 0 1px 0 rgba(255,255,255,0.3)';
            }
          }}
        >
          ✨ Start
        </button>
        <button
          onClick={(e) => addAtCursor(e, 'http')}
          aria-label="Add HTTP request"
          style={{
            background: '#A29BFE',
            color: 'rgba(255,255,255,0.95)',
            fontSize: '14px',
            fontWeight: '600',
            padding: '10px 16px',
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(162,155,254,0.15), inset 0 1px 0 rgba(255,255,255,0.3)',
            transform: 'scale(1)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif'
          }}
          onMouseEnter={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.transform = 'scale(1.02)';
            target.style.boxShadow = '0 6px 16px rgba(162,155,254,0.2), inset 0 1px 0 rgba(255,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.transform = 'scale(1)';
            target.style.boxShadow = '0 4px 12px rgba(162,155,254,0.15), inset 0 1px 0 rgba(255,255,255,0.3)';
          }}
        >
          🌐 HTTP
        </button>

        <div className="w-px bg-coral-sunset/20 h-8 self-center" />

        {/* Import/Export Actions */}
        <label className="px-5 py-2.5 text-body font-medium rounded-full bg-lavender-twilight text-white hover:bg-lavender-twilight/90 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out cursor-pointer drop-shadow-sm">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={onImport}
            data-testid="import-input"
            aria-label="Import workflow template"
          />
          📁 Import
        </label>
        <button
          className="px-5 py-2.5 text-body font-medium rounded-full bg-lavender-twilight text-white hover:bg-lavender-twilight/90 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out drop-shadow-sm"
          onClick={onExport}
          data-testid="export-btn"
          aria-label="Export workflow"
        >
          💾 Export
        </button>
        <button
          className="px-5 py-2.5 text-body font-medium rounded-full bg-golden-hour text-white hover:bg-golden-hour/90 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out drop-shadow-sm"
          onClick={onLoadSlackTemplate}
          title="Load Slack workflow template"
          aria-label="Load Slack template"
        >
          💬 Slack
        </button>
        <button
          className="px-5 py-2.5 text-body font-medium rounded-full bg-golden-hour text-white hover:bg-golden-hour/90 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out drop-shadow-sm"
          onClick={onLoadNotionTemplate}
          title="Load Notion workflow template"
          aria-label="Load Notion template"
        >
          📝 Notion
        </button>

        <div className="w-px bg-coral-sunset/20 h-8 self-center" />

        {/* Clear Action */}
        <button
          className="px-5 py-2.5 text-body font-medium rounded-full bg-warm-gray-400 text-white hover:bg-warm-gray-500 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out drop-shadow-sm"
          onClick={handleClearWorkflow}
          title="Clear workflow"
          aria-label="Clear workflow"
        >
          🗑️ Clear
        </button>
      </div>
    </Panel>
  );
}
