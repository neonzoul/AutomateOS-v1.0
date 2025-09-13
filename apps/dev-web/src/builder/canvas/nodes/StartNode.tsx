import React from 'react';
import { useBuilderStore } from '../../../core/state';
import { Handle, Position } from '@xyflow/react';

type StartNodeData = { label?: string };
// React Flow provides id + data on props; we type minimally
interface StartNodeProps {
  id: string;
  data?: StartNodeData;
}
export default function StartNode({ data, id }: StartNodeProps) {
  const status = useBuilderStore((s) => s.nodeRunStatuses[id] ?? 'idle');
  return (
    <div
      data-id="start"
      data-node-id={id}
      className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 shadow-sm min-w-[120px] text-center"
    >
      <div className="text-emerald-700 font-semibold">
        {data?.label ?? 'Start'}
      </div>
      <div className="text-xs text-emerald-600 flex items-center justify-center gap-1">
        entry
        {status && status !== 'idle' && (
          <span className="text-[9px] px-1 rounded bg-white border border-emerald-300 text-emerald-700 uppercase tracking-wide">
            {status}
          </span>
        )}
      </div>

      {/* Only output handle for start */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-emerald-500"
      />
    </div>
  );
}
