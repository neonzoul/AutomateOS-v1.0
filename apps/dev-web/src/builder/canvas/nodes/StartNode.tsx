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
        y: -4,
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
        transition: { duration: 0.2 }
      }}
      style={{
        background: '#FFFFFF',
        borderRadius: '28px',
        padding: '20px 28px',
        minWidth: '220px',
        border: isSelected
          ? '2px solid #E63946'
          : '1px solid rgba(29, 53, 87, 0.1)',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative'
      }}
    >
      {/* Status Indicator Dot */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: '#E63946',
          boxShadow: '0 2px 4px rgba(230, 57, 70, 0.3)',
        }}
      />

      {/* Content */}
      <div style={{ textAlign: 'center', marginTop: '8px' }}>
        {/* Icon and Title */}
        <div
          style={{
            fontFamily: 'Inter',
            fontStyle: 'normal',
            fontWeight: 600,
            fontSize: '24px',
            lineHeight: '29px',
            color: '#1D3557',
            marginBottom: '8px'
          }}
        >
          ✨ {data?.label ?? 'Start'}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontFamily: 'Inter',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '17px',
            color: '#1D3557',
            opacity: 0.6
          }}
        >
          Begin your creative journey
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#E63946',
          border: '1px solid rgba(29, 53, 87, 0.1)',
          width: '12px',
          height: '12px',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      />
    </motion.div>
  );
}
