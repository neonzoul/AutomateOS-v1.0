import React from 'react';
import { useBuilderStore } from '../../../core/state';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { motionVariants } from '../../../components/ui/motion';

type StartNodeData = { label?: string };
// React Flow provides id + data on props; we type minimally
interface StartNodeProps {
  id: string;
  data?: StartNodeData;
}
export default function StartNode({ data, id }: StartNodeProps) {
  const status = useBuilderStore((s) => s.nodeRunStatuses[id] ?? 'idle');
  const isSelected = useBuilderStore((s) => s.selectedNodeId === id);
  const isRunning = status === 'running';

  return (
    <motion.div
      data-id="start"
      data-node-id={id}
      className="rounded-2xl border-2 bg-gradient-to-br from-emerald-400 to-emerald-600 px-4 py-3 shadow-soft min-w-[140px] text-center cursor-pointer"
      variants={motionVariants.nodeEnter}
      initial="initial"
      animate="animate"
      whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 25 } }}
      whileTap={{ scale: 0.98 }}
      style={{
        borderColor: isSelected ? '#10b981' : 'transparent',
        boxShadow: isSelected
          ? '0 0 20px rgba(16, 185, 129, 0.4)'
          : isRunning
            ? '0 0 15px rgba(16, 185, 129, 0.3)'
            : '0 2px 8px rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Breathing animation overlay for running state */}
      {isRunning && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-emerald-300"
          animate={{
            opacity: [0, 0.3, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
        />
      )}

      <div className="relative z-10">
        <div className="text-white font-semibold text-base mb-1">
          ✨ {data?.label ?? 'Trigger'}
        </div>
        <div className="text-emerald-100 text-xs flex items-center justify-center gap-1">
          Begin workflow
          {status && status !== 'idle' && (
            <motion.span
              className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-white uppercase tracking-wide font-medium"
              animate={isRunning ? {
                scale: [1, 1.02, 1],
                opacity: [0.8, 1, 0.8],
                transition: {
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                }
              } : {}}
            >
              {status === 'running' ? '▶ Running' : status}
            </motion.span>
          )}
        </div>
      </div>

      {/* Only output handle for start */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-white !border-2 !border-emerald-300 !w-4 !h-4 !shadow-md"
      />
    </motion.div>
  );
}
