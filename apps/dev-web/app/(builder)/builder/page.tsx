'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from '@/builder/canvas/Canvas';
import { Inspector } from '@/builder/inspector/Inspector';
import { RunPanel } from '@/builder/run/RunPanel';
import { MainHeader } from '@/components/ui/MainHeader';
import { useBuilderStore } from '@/core/state';
import { startRun } from '@/builder/run/runActions';
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
    // Validate workflow
    const workflow = { nodes, edges, name: 'Current Workflow' };
    const result = WorkflowSchema.safeParse(workflow);

    if (result.success) {
      await startRun(workflow);
    } else {
      console.error('Workflow validation failed:', result.error);
    }
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share workflow');
  };

  return (
    <>
      {/* Main Header */}
      <MainHeader
        onRun={handleRun}
        onShare={handleShare}
        isRunning={useBuilderStore((s) => s.runStatus === 'running')}
      />

      {/* Main Content - Adjusted for header height */}
      <div
        className="grid bg-gray-50"
        style={{
          gridTemplateColumns: '1fr 360px',
          height: 'calc(100vh - 56px)',
          marginTop: '56px'
        }}
      >
        {/* Left: Canvas area */}
        <div className="min-w-0">
          <ReactFlowProvider>
            <Canvas />
          </ReactFlowProvider>
        </div>

        {/* Right: Inspector + Run panels */}
        <div className="bg-white border-l border-gray-200 flex flex-col">
          {/* Inspector Panel */}
          <div className="flex-1 border-b border-gray-200">
            <Inspector />
          </div>

          <RunPanel />
        </div>
      </div>
    </>
  );
}
