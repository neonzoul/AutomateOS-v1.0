'use client';

import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from '@/builder/canvas/Canvas';
import { AppNodeToolbar } from '@/builder/canvas/AppNodeToolbar';
import { LeftSidebar } from '@/builder/sidebar/LeftSidebar';
import { ControllerBar } from '@/builder/controls/ControllerBar';
import { Inspector } from '@/builder/inspector/Inspector';
import { RunPanel } from '@/builder/run/RunPanel';
import { MainHeader } from '@/components/ui/MainHeader';
import { PanelToggle } from '@/components/ui/PanelToggle';
import { useBuilderStore } from '@/core/state';
import { startRun } from '@/builder/run/runActions';
import { exportWorkflow } from '@/builder/io/importExport';
import { WorkflowSchema } from '@automateos/workflow-schema';

/**
 * BuilderPage: Main workflow builder interface
 * Layout: Header + Two-column design with canvas on left, panels on right
 * - Header: Main navigation bar with AutomateOS branding and actions
 * - Canvas: React Flow workspace for visual workflow building
 * - Right Panel: Inspector + RunPanel (placeholder for now)
 */
export default function BuilderPage() {
  const { nodes, edges, clearWorkflow } = useBuilderStore();
  const [leftPanelOpen, setLeftPanelOpen] = React.useState(false);
  const [rightPanelOpen, setRightPanelOpen] = React.useState(false);
  const [httpNodeHandler, setHttpNodeHandler] = React.useState<((e: React.MouseEvent) => void) | null>(null);

  const handleRun = async () => {
    // Clean workflow data for validation - remove React Flow specific properties
    const cleanNodes = nodes.map(({ style, animated, ...node }: any) => node);
    const cleanEdges = edges.map(({ style, animated, ...edge }: any) => edge);
    const workflow = { nodes: cleanNodes, edges: cleanEdges };

    const result = WorkflowSchema.safeParse(workflow);

    if (result.success) {
      await startRun(workflow);
    } else {
      console.error('Workflow validation failed:', result.error);
    }
  };

  const handleExport = async () => {
    try {
      // Clean data for export - remove React Flow specific properties
      const cleanNodes = nodes.map(({ style, animated, ...node }: any) => node);
      const cleanEdges = edges.map(({ style, animated, ...edge }: any) => edge);
      await exportWorkflow({ nodes: cleanNodes, edges: cleanEdges, name: 'Workflow' });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleClear = () => {
    if (
      confirm(
        'Are you sure you want to clear the entire workflow? This action cannot be undone.'
      )
    ) {
      clearWorkflow();
    }
  };

  return (
    <div className="canvas-layout"
      style={{
        height: '100vh',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Main Header - Fixed at top */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '80px',
        zIndex: 1000
      }}>
        <MainHeader
          onRun={handleRun}
          onExport={handleExport}
          isRunning={useBuilderStore((s) => s.runStatus === 'running')}
        />
      </div>

      {/* Canvas - Full screen background layer */}
      <div style={{
        position: 'fixed',
        top: '80px',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1
      }}>
        <ReactFlowProvider>
          <Canvas
            onHttpNodeCreate={(handler) => setHttpNodeHandler(() => handler)}
            httpNodeHandler={httpNodeHandler}
            leftPanelOpen={leftPanelOpen}
            rightPanelOpen={rightPanelOpen}
            onToggleLeftPanel={() => setLeftPanelOpen(!leftPanelOpen)}
            onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
            onClear={handleClear}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
