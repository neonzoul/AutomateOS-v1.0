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
  const { nodes, edges } = useBuilderStore();
  const [leftPanelOpen, setLeftPanelOpen] = React.useState(true);
  const [rightPanelOpen, setRightPanelOpen] = React.useState(true);

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

  return (
    <div className="canvas-layout"
      style={{
        height: '100vh',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateRows: '80px 64px 1fr 70px',
        gridTemplateColumns: `${leftPanelOpen ? '350px' : '0px'} 1fr ${rightPanelOpen ? '386px' : '0px'}`,
        transition: 'grid-template-columns 0.3s ease'
      }}
    >
      {/* Main Header - Spans all columns */}
      <div style={{ gridColumn: '1 / -1', gridRow: '1' }}>
        <MainHeader
          onRun={handleRun}
          onExport={handleExport}
          isRunning={useBuilderStore((s) => s.runStatus === 'running')}
        />
      </div>

      {/* App Node Toolbar - Spans all columns */}
      <div style={{ gridColumn: '1 / -1', gridRow: '2' }}>
        <AppNodeToolbar />
      </div>

      {/* Left Sidebar */}
      <div style={{
        gridColumn: '1',
        gridRow: '3',
        position: 'relative',
        overflow: 'hidden',
        width: leftPanelOpen ? '350px' : '0px',
        transition: 'width 0.3s ease'
      }}>
        {leftPanelOpen && <LeftSidebar />}
        <PanelToggle
          isOpen={leftPanelOpen}
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          side="left"
        />
      </div>

      {/* Center Canvas */}
      <div style={{ gridColumn: '2', gridRow: '3', position: 'relative' }}>
        <ReactFlowProvider>
          <Canvas />
        </ReactFlowProvider>
      </div>

      {/* Right Inspector Panel */}
      <div style={{
        gridColumn: '3',
        gridRow: '3',
        background: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(40px)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        width: rightPanelOpen ? '386px' : '0px',
        transition: 'width 0.3s ease'
      }}>
        {rightPanelOpen && (
          <>
            {/* Inspector Panel - Flexible height with scroll */}
            <div
              className="custom-scrollbar"
              style={{
                flex: 1,
                overflowY: 'scroll',
                overflowX: 'auto',
                borderBottom: '1px solid rgba(255, 255, 255, 0.4)'
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
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 248, 240, 0.72) 100%)',
                backdropFilter: 'blur(40px)'
              }}
            >
              <RunPanel />
            </div>
          </>
        )}
        <PanelToggle
          isOpen={rightPanelOpen}
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          side="right"
        />
      </div>

      {/* Bottom Controller Bar - Spans all columns */}
      <div style={{ gridColumn: '1 / -1', gridRow: '4' }}>
        <ControllerBar
          onRun={handleRun}
          onStop={() => console.log('Stop workflow')}
          onStep={() => console.log('Step through workflow')}
          isRunning={useBuilderStore((s) => s.runStatus === 'running')}
        />
      </div>
    </div>
  );
}
