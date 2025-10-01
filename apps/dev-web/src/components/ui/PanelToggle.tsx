'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PanelToggleProps {
  isOpen: boolean;
  onClick: () => void;
  side: 'left' | 'right';
  style?: React.CSSProperties;
}

export function PanelToggle({ isOpen, onClick, side, style }: PanelToggleProps) {
  // Determine chevron direction based on panel state and side
  const getChevronRotation = () => {
    if (side === 'left') {
      return isOpen ? 0 : 180; // Closed: chevron points right (180°)
    } else {
      return isOpen ? 180 : 0; // Closed: chevron points left (0°)
    }
  };

  return (
    <motion.button
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      onClick={onClick}
      style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        [side]: 0,
        width: '36px',
        height: '111px',
        background: '#E63946',
        borderRadius: side === 'left' ? '0px 10px 10px 0px' : '10px 0px 0px 10px',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: side === 'left'
          ? '4px 0 12px rgba(230, 57, 70, 0.3)'
          : '-4px 0 12px rgba(230, 57, 70, 0.3)',
        zIndex: 100,
        transition: 'all 0.3s ease',
        ...style
      }}
    >
      {/* Chevron Icon */}
      <motion.svg
        width="16"
        height="24"
        viewBox="0 0 16 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{
          rotate: getChevronRotation()
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <path
          d="M14 2L4 12L14 22"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </motion.button>
  );
}
