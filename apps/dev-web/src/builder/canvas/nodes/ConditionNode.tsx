import React from 'react';
import { useBuilderStore } from '../../../core/state';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';

type ConditionNodeData = {
  label?: string;
  description?: string;
  tags?: string[];
  icon?: string;
  config?: { condition?: string; field?: string; operator?: string; value?: string };
};

interface ConditionNodeProps {
  id: string;
  data?: ConditionNodeData;
}

export default function ConditionNode({ data, id }: ConditionNodeProps) {
  const condition = data?.config?.condition ?? '';
  const field = data?.config?.field ?? '';
  const operator = data?.config?.operator ?? '==';
  const value = data?.config?.value ?? '';
  const status = useBuilderStore((s) => s.nodeRunStatuses[id] ?? 'idle');
  const isSelected = useBuilderStore((s) => s.selectedNodeId === id);

  const getStatusColor = () => {
    switch (status) {
      case 'running': return '#FFD93D';
      case 'succeeded': return '#00DFA2';
      case 'failed': return '#E84B4B';
      default: return '#9E9E9E';
    }
  };

  return (
    <motion.div
      data-id="condition"
      data-node-id={id}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{
        scale: 1.05,
        filter: 'brightness(1.08)',
        transition: { duration: 0.2 }
      }}
      style={{
        width: '140px',
        height: '170px',
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      {/* SVG Diamond with Layered Glass Effect */}
      <svg
        viewBox="0 0 100 120"
        style={{
          width: '100%',
          height: '100%',
          filter: 'drop-shadow(0px 8px 24px rgba(147, 51, 234, 0.35))',
        }}
      >
        <defs>
          {/* Main glass gradient - Purple spectrum */}
          <linearGradient id={`mainGradient-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(147, 51, 234, 0.92)" />
            <stop offset="50%" stopColor="rgba(168, 85, 247, 0.95)" />
            <stop offset="100%" stopColor="rgba(192, 132, 252, 0.90)" />
          </linearGradient>

          {/* Reflection gradient - Multi-color shimmer */}
          <linearGradient id={`reflectionGradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.6)" />
            <stop offset="50%" stopColor="rgba(236, 72, 153, 0.5)" />
            <stop offset="100%" stopColor="rgba(147, 197, 253, 0.4)" />
          </linearGradient>

          {/* Top highlight gradient */}
          <radialGradient id={`highlightGradient-${id}`} cx="50%" cy="20%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
            <stop offset="60%" stopColor="rgba(255, 255, 255, 0.3)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Edge glow gradient */}
          <linearGradient id={`edgeGlow-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(147, 51, 234, 0.9)" />
            <stop offset="50%" stopColor="rgba(236, 72, 153, 0.7)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.8)" />
          </linearGradient>

          {/* Glossy filter */}
          <filter id={`glossy-${id}`}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blur" />
            <feSpecularLighting in="blur" surfaceScale="3" specularConstant="0.8" specularExponent="20" result="spec">
              <fePointLight x="30" y="10" z="100" />
            </feSpecularLighting>
            <feComposite in="SourceGraphic" in2="spec" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
          </filter>

          {/* Inner shadow */}
          <filter id={`innerShadow-${id}`}>
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feOffset in="blur" dx="0" dy="1" result="offsetBlur" />
            <feComposite in="offsetBlur" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="inverse" />
            <feFlood floodColor="rgba(147, 51, 234, 0.5)" result="color" />
            <feComposite in="color" in2="inverse" operator="in" result="shadow" />
            <feComposite in="SourceGraphic" in2="shadow" operator="over" />
          </filter>
        </defs>

        {/* Layer 1: Bottom shadow (deepest) */}
        <polygon
          points="50,14 86,60 50,106 14,60"
          fill="rgba(147, 51, 234, 0.4)"
          filter="url(#blur)"
          opacity="0.6"
        />

        {/* Layer 2: Deep purple base */}
        <polygon
          points="50,12 88,60 50,108 12,60"
          fill="rgba(107, 33, 168, 0.85)"
          opacity="0.7"
        />

        {/* Layer 3: Main glass layer */}
        <polygon
          points="50,10 90,60 50,110 10,60"
          fill={`url(#mainGradient-${id})`}
          stroke={`url(#edgeGlow-${id})`}
          strokeWidth="2"
          filter={`url(#glossy-${id})`}
        />

        {/* Layer 4: Middle reflection */}
        <polygon
          points="50,15 83,60 50,105 17,60"
          fill={`url(#reflectionGradient-${id})`}
          opacity="0.5"
        />

        {/* Layer 5: Top highlight (glossy shine) */}
        <polygon
          points="50,18 78,60 50,102 22,60"
          fill={`url(#highlightGradient-${id})`}
          opacity="0.6"
        />

        {/* Layer 6: Edge inner glow */}
        <polygon
          points="50,10 90,60 50,110 10,60"
          fill="none"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1"
          opacity="0.8"
        />

        {/* Selected border */}
        {isSelected && (
          <polygon
            points="50,10 90,60 50,110 10,60"
            fill="none"
            stroke="#E63946"
            strokeWidth="3"
          />
        )}

        {/* Content - using foreignObject */}
        <foreignObject x="20" y="35" width="60" height="50">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              position: 'relative',
            }}
          >
            {/* Status dot */}
            <div
              style={{
                position: 'absolute',
                top: '2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: getStatusColor(),
                boxShadow: `
                  0 0 8px ${getStatusColor()},
                  0 0 12px ${getStatusColor()}80,
                  inset 0 1px 2px rgba(255, 255, 255, 0.5)
                `,
                border: '1px solid rgba(255, 255, 255, 0.4)',
              }}
            />

            {/* If/Else text */}
            <div
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
                fontWeight: 700,
                fontSize: '13px',
                color: '#FFFFFF',
                textAlign: 'center',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                textShadow: `
                  0 1px 3px rgba(0, 0, 0, 0.5),
                  0 0 8px rgba(147, 51, 234, 0.6)
                `,
                marginTop: '12px',
              }}
            >
              {data?.label ?? 'If/Else'}
            </div>

            {/* Question mark */}
            {!condition && !field && (
              <div
                style={{
                  fontSize: '22px',
                  color: '#FFFFFF',
                  marginTop: '2px',
                  opacity: 0.8,
                  fontWeight: 300,
                  textShadow: `
                    0 0 10px rgba(255, 255, 255, 0.8),
                    0 2px 4px rgba(0, 0, 0, 0.3)
                  `,
                }}
              >
                ?
              </div>
            )}
          </div>
        </foreignObject>
      </svg>

      {/* Handles positioned at diamond points */}

      {/* Input Handle - Top */}
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        style={{
          background: '#E84B4B',
          border: '2px solid #FFFFFF',
          width: '12px',
          height: '12px',
          boxShadow: '0 2px 8px rgba(232, 75, 75, 0.4), 0 0 12px rgba(232, 75, 75, 0.3)',
          top: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      {/* Output Handle - True (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="source-true"
        style={{
          background: '#00D98E',
          border: '2px solid #FFFFFF',
          width: '12px',
          height: '12px',
          boxShadow: '0 2px 8px rgba(0, 217, 142, 0.5), 0 0 12px rgba(0, 217, 142, 0.4)',
          right: '0px',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />

      {/* True Label */}
      <div
        style={{
          position: 'absolute',
          right: '-48px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '12px',
          fontWeight: 700,
          color: '#00D98E',
          textShadow: '0 1px 3px rgba(0,0,0,0.3), 0 0 8px rgba(0, 217, 142, 0.6)',
          background: 'rgba(0, 217, 142, 0.15)',
          backdropFilter: 'blur(4px)',
          padding: '3px 8px',
          borderRadius: '6px',
          border: '1px solid rgba(0, 217, 142, 0.4)',
        }}
      >
        True
      </div>

      {/* Output Handle - False (Bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-false"
        style={{
          background: '#9E9E9E',
          border: '2px solid #FFFFFF',
          width: '12px',
          height: '12px',
          boxShadow: '0 2px 8px rgba(158, 158, 158, 0.5), 0 0 12px rgba(158, 158, 158, 0.3)',
          bottom: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      {/* False Label */}
      <div
        style={{
          position: 'absolute',
          bottom: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '12px',
          fontWeight: 700,
          color: '#9E9E9E',
          textShadow: '0 1px 3px rgba(0,0,0,0.3), 0 0 8px rgba(158, 158, 158, 0.5)',
          background: 'rgba(158, 158, 158, 0.15)',
          backdropFilter: 'blur(4px)',
          padding: '3px 8px',
          borderRadius: '6px',
          whiteSpace: 'nowrap',
          border: '1px solid rgba(158, 158, 158, 0.4)',
        }}
      >
        False
      </div>
    </motion.div>
  );
}
