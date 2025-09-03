import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from '@/builder/canvas/Canvas';

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
        {/* Inspector Panel Placeholder */}
        <div className="flex-1 p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Inspector
          </h3>
          <div className="text-sm text-gray-500">
            Select a node to configure its properties
          </div>
        </div>

        {/* Run Panel Placeholder */}
        <div className="h-48 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Run Controls
          </h3>
          <div className="space-y-2">
            <button
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled
            >
              Run Workflow
            </button>
            <div className="text-sm text-gray-500">Status: Ready</div>
          </div>
        </div>
      </div>
    </div>
  );
}
