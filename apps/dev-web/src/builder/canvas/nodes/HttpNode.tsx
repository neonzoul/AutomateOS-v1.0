import React from 'react';
import { useBuilderStore } from '../../../core/state';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { nodeEntranceVariants, subtleHover, pressEffect } from '../../../components/ui/motion';

type HttpNodeData = {
  label?: string;
  config?: { method?: string; url?: string };
};

interface HttpNodeProps {
  id: string;
  data?: HttpNodeData;
}

export default function HttpNode({ data, id }: HttpNodeProps) {
  const method = data?.config?.method ?? 'GET';
  const url = data?.config?.url ?? '';
  const status = useBuilderStore((s) => s.nodeRunStatuses[id] ?? 'idle');
  const isSelected = useBuilderStore((s) => s.selectedNodeId === id);

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'text-white bg-lavender-twilight';
      case 'POST': return 'text-white bg-coral-sunset';
      case 'PUT': return 'text-white bg-golden-hour';
      case 'DELETE': return 'text-white bg-coral-sunset';
      default: return 'text-white bg-lavender-twilight';
    }
  };

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
      data-id="http"
      data-node-id={id}
      className={`
        relative cursor-pointer transition-all duration-500 ease-out
        ${isSelected
          ? 'scale-105'
          : 'hover:scale-102'
        }
      `}
      style={{
        background: isSelected
          ? 'linear-gradient(135deg, #FFFBF7 0%, #FFF8F0 100%)'
          : 'linear-gradient(135deg, #FFF8F0 0%, #FFFBF7 100%)',
        borderRadius: '28px',
        padding: '28px 36px',
        minWidth: '280px',
        border: isSelected
          ? '2px solid #E84B4B'
          : '1px solid rgba(232, 75, 75, 0.15)',
        boxShadow: isSelected
          ? '0 16px 48px rgba(232, 75, 75, 0.15), 0 4px 16px rgba(232, 75, 75, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)'
          : '0 8px 32px rgba(232, 75, 75, 0.08), 0 2px 8px rgba(232, 75, 75, 0.04), inset 0 1px 0 rgba(255,255,255,0.6)',
        backdropFilter: 'blur(20px)',
      }}
      variants={nodeEntranceVariants}
      initial="initial"
      animate="animate"
      whileHover={subtleHover}
      whileTap={pressEffect}
      tabIndex={0}
    >
      {/* Her-style coral accent circle */}
      <div
        className={`absolute top-5 left-5 w-5 h-5 rounded-full flex items-center justify-center ${status === 'running' ? 'animate-pulse' : ''}`}
        style={{
          background: status === 'running' ? '#FFD93D' :
                     status === 'succeeded' ? '#00DFA2' :
                     status === 'failed' ? '#E84B4B' : '#E84B4B',
          boxShadow: '0 3px 12px rgba(232, 75, 75, 0.25), inset 0 1px 0 rgba(255,255,255,0.4)'
        }}
      >
        <div className="w-2 h-2 bg-white rounded-full opacity-90" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <span
            style={{
              background: '#E84B4B',
              color: 'rgba(255,255,255,0.95)',
              fontSize: '13px',
              fontWeight: '600',
              padding: '10px 18px',
              borderRadius: '20px',
              minWidth: '70px',
              textAlign: 'center',
              boxShadow: '0 3px 12px rgba(232, 75, 75, 0.25), inset 0 1px 0 rgba(255,255,255,0.3)',
              letterSpacing: '0.3px'
            }}
          >
            {method}
          </span>
          <div
            style={{
              color: '#2D1B1B',
              fontSize: '22px',
              fontWeight: '600',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
              letterSpacing: '-0.3px'
            }}
          >
            🌐 {data?.label ?? 'API Request'}
          </div>
        </div>

        <div className="space-y-3 mt-3">
          <div
            style={{
              color: 'rgba(45, 27, 27, 0.75)',
              fontSize: '15px',
              fontWeight: '400',
              lineHeight: '1.5'
            }}
          >
            {url ? (
              <span
                className="font-mono truncate block"
                title={url}
                style={{
                  fontSize: '13px',
                  backgroundColor: 'rgba(232, 75, 75, 0.08)',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(232, 75, 75, 0.15)',
                  color: 'rgba(45, 27, 27, 0.8)'
                }}
              >
                {url}
              </span>
            ) : (
              <span
                className="italic"
                style={{
                  color: 'rgba(45, 27, 27, 0.5)'
                }}
              >
                Configure request URL
              </span>
            )}
          </div>

          {status !== 'idle' && (
            <div
              className="mt-3 px-3 py-1 rounded-full inline-block"
              style={{
                backgroundColor: 'rgba(232, 75, 75, 0.1)',
                color: '#E84B4B',
                fontSize: '13px',
                fontWeight: '500',
                textTransform: 'capitalize',
                border: '1px solid rgba(232, 75, 75, 0.2)'
              }}
            >
              {status}
            </div>
          )}
        </div>
      </div>

      {/* Input and output handles - Her style coral accents */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#E84B4B',
          border: '2px solid rgba(232, 75, 75, 0.8)',
          width: '16px',
          height: '16px',
          boxShadow: '0 4px 16px rgba(232, 75, 75, 0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
          transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
        }}
        className="hover:!scale-110"
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#E84B4B',
          border: '2px solid rgba(232, 75, 75, 0.8)',
          width: '16px',
          height: '16px',
          boxShadow: '0 4px 16px rgba(232, 75, 75, 0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
          transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
        }}
        className="hover:!scale-110"
      />
    </motion.div>
  );
}
