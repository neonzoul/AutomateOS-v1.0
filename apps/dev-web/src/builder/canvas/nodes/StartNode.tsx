import React from 'react';
import { useBuilderStore } from '../../../core/state';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { nodeEntranceVariants, subtleHover, pressEffect } from '../../../components/ui/motion';

type StartNodeData = { label?: string };

interface StartNodeProps {
  id: string;
  data?: StartNodeData;
}

export default function StartNode({ data, id }: StartNodeProps) {
  const status = useBuilderStore((s) => s.nodeRunStatuses[id] ?? 'idle');
  const isSelected = useBuilderStore((s) => s.selectedNodeId === id);

  const getStatusColor = () => {
    switch (status) {
      case 'running': return 'bg-golden-hour';
      case 'succeeded': return 'bg-sage-whisper';
      case 'failed': return 'bg-coral-sunset';
      default: return 'bg-warm-gray-300';
    }
  };

  return (
    <motion.div
      data-id="start"
      data-node-id={id}
      className={`
        relative cursor-pointer transition-all duration-500 ease-out
        ${isSelected
          ? 'scale-105'
          : 'hover:scale-102'
        }
      `}
      style={{
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 30%, #FFB4A2 100%)',
        borderRadius: '32px',
        padding: '24px 32px',
        minWidth: '200px',
        border: isSelected ? '3px solid rgba(255,255,255,0.6)' : '2px solid rgba(255,255,255,0.3)',
        boxShadow: isSelected
          ? '0 20px 60px rgba(255,107,107,0.4), 0 8px 24px rgba(255,107,107,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
          : '0 12px 32px rgba(255,107,107,0.25), 0 4px 12px rgba(255,107,107,0.15), inset 0 1px 0 rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)',
      }}
      variants={nodeEntranceVariants}
      initial="initial"
      animate="animate"
      whileHover={{
        boxShadow: '0 16px 48px rgba(255,107,107,0.35), 0 6px 16px rgba(255,107,107,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}
      whileTap={pressEffect}
      tabIndex={0}
    >
      {/* Organic status indicator - Her style */}
      <div
        className={`absolute top-4 left-4 w-4 h-4 rounded-full ${status === 'running' ? 'animate-pulse' : ''}`}
        style={{
          background: status === 'running' ? '#FFD93D' :
                     status === 'succeeded' ? '#00DFA2' :
                     status === 'failed' ? '#FF6B6B' : 'rgba(255,255,255,0.4)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)'
        }}
      />

      <div className="text-center">
        <div
          className="mb-3"
          style={{
            color: 'rgba(255,255,255,0.95)',
            fontSize: '22px',
            fontWeight: '600',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
            letterSpacing: '-0.5px',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          ✨ {data?.label ?? 'Start'}
        </div>
        <div
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: '16px',
            fontWeight: '500',
            lineHeight: '1.4',
            letterSpacing: '-0.2px'
          }}
        >
          Begin your creative journey
          {status !== 'idle' && (
            <div
              className="mt-2"
              style={{
                color: 'rgba(255,255,255,0.75)',
                fontSize: '14px',
                textTransform: 'capitalize'
              }}
            >
              {status}
            </div>
          )}
        </div>
      </div>

      {/* Output handle - Her style */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: 'rgba(255,255,255,0.9)',
          border: '2px solid rgba(255,255,255,0.6)',
          width: '14px',
          height: '14px',
          boxShadow: '0 4px 12px rgba(255,107,107,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
          transition: 'all 0.3s ease'
        }}
        className="hover:!scale-110"
      />
    </motion.div>
  );
}
