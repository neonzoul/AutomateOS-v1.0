import React from 'react';
import { useBuilderStore } from '../../../core/state';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';

type StartNodeData = { label?: string };

interface StartNodeProps {
  id: string;
  data?: StartNodeData;
}

export default function StartNode({ data, id }: StartNodeProps) {
  const isSelected = useBuilderStore((s) => s.selectedNodeId === id);

  return (
    <motion.div
      data-id="start"
      data-node-id={id}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{
        scale: 1.05,
        boxShadow: '0px 8px 24px rgba(0, 200, 100, 0.3)',
        transition: { duration: 0.2 }
      }}
      style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #00D98E 0%, #00C87A 100%)',
        border: isSelected
          ? '3px solid #E63946'
          : 'none',
        boxShadow: '0px 4px 16px rgba(0, 200, 100, 0.25)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Play Icon */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 5.14v13.72L19 12 8 5.14z"
          fill="white"
        />
      </svg>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#E63946',
          border: '2px solid white',
          width: '12px',
          height: '12px',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)',
          right: '-6px',
        }}
      />
    </motion.div>
  );
}
