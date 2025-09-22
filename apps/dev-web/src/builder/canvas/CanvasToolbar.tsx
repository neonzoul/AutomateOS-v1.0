// ::ORGANISM:: CANVAS TOOLBAR

'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Panel, useReactFlow } from '@xyflow/react';

import { useNodes, useEdges, useGraphActions } from '../../core/state';
import { NODE_SPECS } from '../registry/nodeSpecs';
import { exportWorkflow, importWorkflow } from '../io/importExport';
import { useBuilderStore } from '../../core/state';
import { WorkflowSchema } from '@automateos/workflow-schema';
import { SamplesPopup } from './SamplesPopup';

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

  // Use state to avoid hydration mismatch
  const [hasStart, setHasStart] = React.useState(false);
  const [isSamplesOpen, setIsSamplesOpen] = useState(false);

  React.useEffect(() => {
    setHasStart(nodes.some((n) => n.type === 'start'));
  }, [nodes]);

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

  // Export functionality moved to main header as Share button

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
        className="flex items-center backdrop-blur-xl"
        style={{
          gap: '4px',
          background: 'linear-gradient(145deg, #B8BCC8 0%, #A8ADB8 25%, #9CA3AF 50%, #8B959E 75%, #7A8490 100%)',
          padding: '6px 8px',
          borderRadius: '20px',
          border: '1px solid rgba(156, 163, 175, 0.25)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.12), inset 1px 0 0 rgba(255, 255, 255, 0.15), inset -1px 0 0 rgba(0, 0, 0, 0.06)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Aluminum texture overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            pointerEvents: 'none',
            borderRadius: '20px'
          }}
        />

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
              ? 'rgba(232,75,75,0.15)'
              : 'linear-gradient(135deg, #FF6B6B 0%, #E84B4B 100%)',
            color: hasStart ? 'rgba(232,75,75,0.6)' : 'rgba(255,255,255,0.98)',
            fontSize: '12px',
            fontWeight: '600',
            padding: '7px 14px',
            borderRadius: '16px',
            border: 'none',
            cursor: hasStart ? 'not-allowed' : 'pointer',
            transition: 'all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
            boxShadow: hasStart
              ? 'none'
              : '0 2px 8px rgba(232,75,75,0.2), inset 0 1px 0 rgba(255,255,255,0.4)',
            transform: 'scale(1)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
            minWidth: '70px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}>
            <path d="M8 5v14l11-7z"/>
          </svg>
          Start
        </button>
        <button
          onClick={(e) => addAtCursor(e, 'http')}
          aria-label="Add HTTP request"
          style={{
            background: 'linear-gradient(135deg, #A29BFE 0%, #9B8CE8 100%)',
            color: 'rgba(255,255,255,0.98)',
            fontSize: '12px',
            fontWeight: '600',
            padding: '7px 14px',
            borderRadius: '16px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
            boxShadow: '0 2px 8px rgba(162,155,254,0.2), inset 0 1px 0 rgba(255,255,255,0.4)',
            transform: 'scale(1)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
            minWidth: '70px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          HTTP
        </button>

        <div style={{ width: '1px', height: '24px', background: 'rgba(0, 0, 0, 0.08)', alignSelf: 'center', margin: '0 2px' }} />

        {/* Import Action - Export moved to main header as Share */}
        <label
          className="cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #FFD93D 0%, #F4C430 100%)',
            color: 'rgba(255,255,255,0.98)',
            fontSize: '12px',
            fontWeight: '600',
            padding: '7px 14px',
            borderRadius: '16px',
            border: 'none',
            transition: 'all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
            boxShadow: '0 2px 8px rgba(255,217,61,0.2), inset 0 1px 0 rgba(255,255,255,0.4)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
            minWidth: '80px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={onImport}
            data-testid="import-input"
            aria-label="Import workflow template"
          />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}>
            <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
          </svg>
          Import
        </label>
        <button
          onClick={() => setIsSamplesOpen(true)}
          title="Browse sample workflow templates"
          aria-label="Browse sample templates"
          style={{
            background: 'linear-gradient(135deg, #FFD93D 0%, #F4C430 100%)',
            color: 'rgba(255,255,255,0.98)',
            fontSize: '12px',
            fontWeight: '600',
            padding: '7px 14px',
            borderRadius: '16px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
            boxShadow: '0 2px 8px rgba(255,217,61,0.2), inset 0 1px 0 rgba(255,255,255,0.4)',
            transform: 'scale(1)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
            minWidth: '90px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.transform = 'scale(1.02)';
            target.style.boxShadow = '0 6px 16px rgba(255,217,61,0.25), inset 0 1px 0 rgba(255,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.transform = 'scale(1)';
            target.style.boxShadow = '0 4px 12px rgba(255,217,61,0.2), inset 0 1px 0 rgba(255,255,255,0.3)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}>
            <path d="M3,11H11V3H3M3,21H11V13H3M13,21H21V13H13M13,3V11H21V3"/>
          </svg>
          Samples
        </button>

        <div style={{ width: '1px', height: '24px', background: 'rgba(0, 0, 0, 0.08)', alignSelf: 'center', margin: '0 2px' }} />

        {/* Clear Action */}
        <button
          onClick={handleClearWorkflow}
          title="Clear workflow"
          aria-label="Clear workflow"
          style={{
            background: 'linear-gradient(135deg, #C4BCB5 0%, #9B8E85 100%)',
            color: 'rgba(255,255,255,0.98)',
            fontSize: '12px',
            fontWeight: '600',
            padding: '7px 14px',
            borderRadius: '16px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
            boxShadow: '0 2px 8px rgba(196,188,181,0.2), inset 0 1px 0 rgba(255,255,255,0.4)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
            minWidth: '70px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}>
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
          Clear
        </button>
      </div>

      {/* Samples Popup */}
      <SamplesPopup
        isOpen={isSamplesOpen}
        onClose={() => setIsSamplesOpen(false)}
        onLoadSlack={onLoadSlackTemplate}
        onLoadNotion={onLoadNotionTemplate}
      />
    </Panel>
  );
}
