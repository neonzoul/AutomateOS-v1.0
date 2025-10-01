import React from 'react';
import { useBuilderStore } from '../../../core/state';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';

interface AppNodeData {
  label?: string;
  description?: string;
  appIcon?: string;
  appName?: string;
  tags?: string[];
}

interface AppNodeProps {
  id: string;
  data?: AppNodeData;
}

export default function AppNode({ data, id }: AppNodeProps) {
  const isSelected = useBuilderStore((s) => s.selectedNodeId === id);

  const tags = data?.tags || ['Tag', 'Tag', 'Tag'];
  const tagColors = ['#7949FF', '#494FFF', '#FF494C'];

  return (
    <motion.div
      data-id="app-node"
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
        minWidth: '280px',
        background: '#FFFFFF',
        border: isSelected ? '2px solid #E63946' : '1px solid rgba(29, 53, 87, 0.1)',
        borderRadius: '20px',
        padding: '16px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header with Icon and Title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '8px'
      }}>
        {/* App Icon */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: '#1D3557',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '20px'
        }}>
          {data?.appIcon || '💬'}
        </div>

        {/* Title */}
        <div style={{
          fontFamily: 'Inter',
          fontStyle: 'normal',
          fontWeight: 600,
          fontSize: '16px',
          lineHeight: '19px',
          color: '#1D3557',
          flex: 1
        }}>
          {data?.label || data?.appName || 'Send to Slack'}
        </div>
      </div>

      {/* Description */}
      <div style={{
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: 400,
        fontSize: '8px',
        lineHeight: '10px',
        color: '#1D3557',
        opacity: 0.6,
        marginBottom: '12px',
        minHeight: '30px'
      }}>
        {data?.description || 'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit.'}
      </div>

      {/* Tags */}
      <div style={{
        display: 'flex',
        gap: '0.75px',
        alignItems: 'center'
      }}>
        {tags.slice(0, 3).map((tag, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0.75px 1.5px',
              height: '6px',
              background: tagColors[index % tagColors.length],
              borderRadius: '1px',
              fontFamily: 'Inter',
              fontStyle: 'normal',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '17px',
              textAlign: 'center',
              color: '#FFFFFF',
              minWidth: '18px'
            }}
          >
            <span style={{ fontSize: '3px', opacity: 0.8 }}>Tag</span>
          </div>
        ))}
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
  );
}
