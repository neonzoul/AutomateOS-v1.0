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

  return (
    <Panel position="top-left">
      <div className="flex gap-2 bg-white/80 backdrop-blur px-2 py-1 rounded border shadow-sm">
        {/* Node Creation Buttons */}
        <button
          className={`px-2 py-1 text-sm rounded transition-colors ${
            hasStart
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-emerald-500 text-white hover:bg-emerald-600'
          }`}
          onClick={(e) => addAtCursor(e, 'start')}
          disabled={hasStart}
          title={hasStart ? 'Only one Start node allowed' : 'Add Start node'}
          aria-label={
            hasStart ? 'Only one Start node allowed' : 'Add Start node'
          }
        >
          + Start
        </button>
        <button
          className="px-2 py-1 text-sm rounded bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
          onClick={(e) => addAtCursor(e, 'http')}
          aria-label="Add HTTP node"
        >
          + HTTP
        </button>

        {/* Separator */}
        <div className="w-px bg-gray-300" />

        {/* Import/Export Actions */}
        <label className="px-2 py-1 text-sm rounded bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={onImport}
            data-testid="import-input"
            aria-label="Import workflow JSON file"
          />
          Import
        </label>
        <button
          className="px-2 py-1 text-sm rounded bg-slate-500 text-white hover:bg-slate-600 transition-colors"
          onClick={onExport}
          data-testid="export-btn"
          aria-label="Export workflow as JSON file"
        >
          Export
        </button>
        <button
          className="px-2 py-1 text-sm rounded bg-purple-500 text-white hover:bg-purple-600 transition-colors"
          onClick={onLoadSlackTemplate}
          title="Load a ready-to-use Slack notification workflow"
          aria-label="Load Slack notification template"
        >
          📢 Slack Template
        </button>

        {/* Separator */}
        <div className="w-px bg-gray-300" />

        {/* Clear Action */}
        <button
          className="px-2 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
          onClick={handleClearWorkflow}
          title="Clear workflow"
          aria-label="Clear entire workflow"
        >
          Clear
        </button>
      </div>
    </Panel>
  );
}
