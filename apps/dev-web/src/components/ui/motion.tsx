'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

// Apple-inspired animation constants
export const APPLE_SPRING = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export const APPLE_TIMING = {
  duration: 0.2,
  ease: [0.25, 0.1, 0.25, 1.0] as const,
};

// Minimal node entrance animation
export const nodeEntranceVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: APPLE_SPRING
  },
};

// Subtle hover effects (no scaling)
export const subtleHover = {
  transition: APPLE_TIMING,
};

// Press feedback (minimal)
export const pressEffect = {
  scale: 0.97,
  transition: { duration: 0.1 },
};

// Legacy export for old components (deprecated)
export const motionVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
};