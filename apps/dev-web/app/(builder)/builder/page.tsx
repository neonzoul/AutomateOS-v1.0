import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from '@/builder/canvas/Canvas';
import { Inspector } from '@/builder/inspector/Inspector';
import { RunPanel } from '@/builder/run/RunPanel';

/**
 * BuilderPage: Main workflow builder interface
 * Layout: Two-column design with canvas on left, panels on right
 * - Canvas: React Flow workspace for visual workflow building
 * - Right Panel: Inspector + RunPanel (placeholder for now)
 */
export default function BuilderPage() {
  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left: Canvas area */}
      <div className="flex-1 min-w-0">
        <ReactFlowProvider>
          <Canvas />
        </ReactFlowProvider>
      </div>

      {/* Right: Inspector + Run panels */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {/* Inspector Panel */}
        <div className="flex-1 border-b border-gray-200">
          <Inspector />
        </div>

        <div className="border-b border-gray-200">
          <RunPanel />
        </div>
      </div>
    </div>
  );
}
