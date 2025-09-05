// [Component]

import React from 'react';
import { Handle, Position } from '@xyflow/react';

type Props = {
  data?: { label?: string; config?: { method?: string; url?: string } };
};

export default function HttpNode({ data }: Props) {
  const method = data?.config?.method ?? 'GET';
  const url = data?.config?.url ?? '';

  return (
    <div className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 shadow-sm min-w-[180px]">
      <div className="text-indigo-700 font-semibold flex items-center gap-2">
        <span className="inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white">
          {method}
        </span>
        <span>{data?.label ?? 'HTTP'}</span>
      </div>
      <div
        className="text-[10px] text-indigo-600 truncate max-w-[220px]"
        title={url}
      >
        {url || 'https://…'}
      </div>

      {/* Input and output handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-indigo-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-indigo-500"
      />
    </div>
  );
}
