'use client';

import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';
import { forwardRef } from 'react';

// Motion variants for common animations
export const motionVariants = {
  // Node animations
  nodeEnter: {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", damping: 15, stiffness: 300 }
    },
  },
} as const;

// Simple utility for breathing animation
export const breathingAnimation = {
  scale: [1, 1.02, 1],
  opacity: [0.8, 1, 0.8],
  transition: {
    repeat: Infinity,
    duration: 2,
    ease: "easeInOut"
  }
};