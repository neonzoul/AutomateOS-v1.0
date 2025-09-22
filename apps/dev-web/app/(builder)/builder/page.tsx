'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from '@/builder/canvas/Canvas';
import { Inspector } from '@/builder/inspector/Inspector';
import { RunPanel } from '@/builder/run/RunPanel';
import { MainHeader } from '@/components/ui/MainHeader';
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
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Main Header */}
      <MainHeader
        onRun={handleRun}
        onExport={handleExport}
        isRunning={useBuilderStore((s) => s.runStatus === 'running')}
      />

      {/* Main Content - Absolutely positioned for perfect isolation */}
      <div style={{ position: 'relative', height: 'calc(100vh - 56px)', marginTop: '56px', overflow: 'hidden' }}>

        {/* Left: Canvas area - Absolutely positioned, never moves */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 'calc(100vw - 420px)', height: '100%' }}>
          <ReactFlowProvider>
            <Canvas />
          </ReactFlowProvider>
        </div>

        {/* Right: Inspector + Run panels - Absolutely positioned, fixed size */}
        <div
          className="bg-white border-l border-gray-200"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '420px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Inspector Panel - Fixed height with scroll */}
          <div
            className="custom-scrollbar"
            style={{
              height: 'calc(100% - 300px)',
              overflowY: 'scroll',
              overflowX: 'auto',
              borderBottom: '1px solid #E5E7EB'
            }}
          >
            <Inspector />
          </div>

          {/* Run Panel - Fixed height */}
          <div className="custom-scrollbar" style={{ height: '300px', overflowY: 'scroll', overflowX: 'auto' }}>
            <RunPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
