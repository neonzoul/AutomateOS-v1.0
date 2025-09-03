import React from 'react';
import { Handle, Position } from '@xyflow/react';

type Props = { data?: { label?: string } };

export default function StartNode({ data }: Props) {
  return (
    <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 shadow-sm min-w-[120px] text-center">
      <div className="text-emerald-700 font-semibold">
        {data?.label ?? 'Start'}
      </div>
      <div className="text-xs text-emerald-600">entry</div>

      {/* Only output handle for start */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-emerald-500"
      />
    </div>
  );
}
