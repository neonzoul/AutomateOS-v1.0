import React from 'react';
import { useBuilderStore } from '../../../core/state';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';

interface AgentNodeData {
  label?: string;
  agentType?: string;
}

interface AgentNodeProps {
  id: string;
  data?: AgentNodeData;
}

export default function AgentNode({ data, id }: AgentNodeProps) {
  const isSelected = useBuilderStore((s) => s.selectedNodeId === id);

  return (
    <div style={{ position: 'relative' }}>
      {/* Main Agent Node - Pill Shape */}
      <motion.div
        data-id="agent-node"
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
          border: isSelected ? '2px solid #E63946' : '1px solid rgba(29, 53, 87, 0.1)',
          borderRadius: '50px',
          padding: '16px 24px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: 'auto',
          position: 'relative'
        }}
      >
        {/* Agent Icon */}
        <div style={{
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {/* Spiral/Knot Icon for GPT Agent */}
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 8C17.2 8 15 10.2 15 13C15 14.3 15.5 15.5 16.3 16.4C14.4 17.2 13 19.1 13 21.3C13 24.1 15.2 26.3 18 26.3C19.3 26.3 20.5 25.8 21.4 25C22.2 26.9 24.1 28.3 26.3 28.3C29.1 28.3 31.3 26.1 31.3 23.3C31.3 22 30.8 20.8 30 19.9C31.9 19.1 33.3 17.2 33.3 15C33.3 12.2 31.1 10 28.3 10C27 10 25.8 10.5 24.9 11.3C24.1 9.4 22.2 8 20 8Z"
              fill="#000000"
            />
          </svg>
        </div>

        {/* Agent Title */}
        <div style={{
          fontFamily: 'Inter',
          fontStyle: 'normal',
          fontWeight: 600,
          fontSize: '22px',
          lineHeight: '27px',
          color: '#0D0D0D',
        }}>
          {data?.label || 'GPT Agent'}
        </div>

        {/* Handles */}
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: '#E63946',
            border: '1px solid rgba(29, 53, 87, 0.1)',
            width: '12px',
            height: '12px',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        />
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

      {/* Connection Point Button Below Node */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'absolute',
          bottom: '-16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '24px',
          height: '24px',
          background: '#FFFFFF',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          fontSize: '16px',
          fontWeight: '600',
          color: '#000000',
          zIndex: 10
        }}
      >
        +
      </motion.div>
    </div>
  );
}
