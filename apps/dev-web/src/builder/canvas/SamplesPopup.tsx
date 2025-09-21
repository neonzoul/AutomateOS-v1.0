'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkflowSchema } from '@automateos/workflow-schema';
import { useBuilderStore } from '../../core/state';

interface SamplesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSlack: () => void;
  onLoadNotion: () => void;
}

/**
 * SamplesPopup: Sophisticated template selector inspired by Apple's design philosophy
 *
 * Design Philosophy:
 * - Spatial depth with backdrop blur and layered shadows
 * - Organic spring animations that feel alive
 * - Golden ratio proportions and generous whitespace
 * - "Her" movie color palette with coral and warm neutrals
 * - Apple-level attention to micro-interactions
 */
export function SamplesPopup({ isOpen, onClose, onLoadSlack, onLoadNotion }: SamplesPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Popup container animations - Apple-inspired organic motion
  const popupVariants = {
    hidden: {
      opacity: 0,
      scale: 0.92,
      y: -20,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.1, 0.25, 1.0] as const,
      },
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 500,
        damping: 35,
        mass: 0.8,
      },
    },
  };

  // Backdrop animations
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }
    },
  };

  // Sample option animations - staggered entrance
  const optionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        type: "spring" as const,
        stiffness: 400,
        damping: 25,
      },
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Sophisticated backdrop with blur */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-50"
            style={{
              background: 'rgba(58, 52, 47, 0.15)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          />

          {/* Main popup container */}
          <motion.div
            ref={popupRef}
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed z-50"
            style={{
              top: '120px',
              left: '20px',
              maxWidth: '340px',
              width: 'calc(100vw - 40px)',
              background: 'rgba(255, 251, 247, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(232, 75, 75, 0.12)',
              boxShadow: `
                0 32px 64px rgba(232, 75, 75, 0.08),
                0 16px 32px rgba(232, 75, 75, 0.04),
                0 8px 16px rgba(0, 0, 0, 0.04),
                inset 0 1px 0 rgba(255, 255, 255, 0.8)
              `,
              padding: '24px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
            }}
          >
            {/* Header with subtle depth */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 0.1, duration: 0.4, ease: "easeOut" }
              }}
              style={{
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: '1px solid rgba(232, 75, 75, 0.08)',
              }}
            >
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#3A342F',
                letterSpacing: '-0.01em',
                lineHeight: '1.3',
              }}>
                ✨ Sample Workflows
              </h3>
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '14px',
                color: 'rgba(58, 52, 47, 0.7)',
                lineHeight: '1.4',
                fontWeight: '400',
              }}>
                Get started with pre-built automation templates
              </p>
            </motion.div>

            {/* Sample options with sophisticated styling */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Slack Template Option */}
              <motion.button
                custom={0}
                variants={optionVariants}
                initial="hidden"
                animate="visible"
                onClick={() => {
                  onLoadSlack();
                  onClose();
                }}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
                whileTap={{
                  scale: 0.98,
                  transition: { duration: 0.1 }
                }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #E84B4B 0%, #D63A3A 100%)',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  color: 'rgba(255, 255, 255, 0.98)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: '0 4px 16px rgba(232, 75, 75, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onFocus={(e) => {
                  e.target.style.outline = 'none';
                  e.target.style.boxShadow = '0 4px 16px rgba(232, 75, 75, 0.25), 0 0 0 3px rgba(232, 75, 75, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = '0 4px 16px rgba(232, 75, 75, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    fontSize: '24px',
                    width: '40px',
                    height: '40px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                  }}>
                    💬
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      marginBottom: '2px',
                      lineHeight: '1.3',
                    }}>
                      Slack Notification
                    </div>
                    <div style={{
                      fontSize: '13px',
                      opacity: 0.85,
                      lineHeight: '1.3',
                      fontWeight: '400',
                    }}>
                      Send automated messages to Slack channels
                    </div>
                  </div>
                  <div style={{
                    fontSize: '16px',
                    opacity: 0.7,
                    transform: 'translateX(0px)',
                    transition: 'transform 0.2s ease',
                  }}>
                    →
                  </div>
                </div>
              </motion.button>

              {/* Notion Template Option */}
              <motion.button
                custom={1}
                variants={optionVariants}
                initial="hidden"
                animate="visible"
                onClick={() => {
                  onLoadNotion();
                  onClose();
                }}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
                whileTap={{
                  scale: 0.98,
                  transition: { duration: 0.1 }
                }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  color: 'rgba(255, 255, 255, 0.98)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: '0 4px 16px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onFocus={(e) => {
                  e.target.style.outline = 'none';
                  e.target.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.25), 0 0 0 3px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    fontSize: '24px',
                    width: '40px',
                    height: '40px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                  }}>
                    📝
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      marginBottom: '2px',
                      lineHeight: '1.3',
                    }}>
                      Notion Database
                    </div>
                    <div style={{
                      fontSize: '13px',
                      opacity: 0.85,
                      lineHeight: '1.3',
                      fontWeight: '400',
                    }}>
                      Create and update Notion database records
                    </div>
                  </div>
                  <div style={{
                    fontSize: '16px',
                    opacity: 0.7,
                    transform: 'translateX(0px)',
                    transition: 'transform 0.2s ease',
                  }}>
                    →
                  </div>
                </div>
              </motion.button>
            </div>

            {/* Subtle footer hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: 0.4, duration: 0.3 }
              }}
              style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(232, 75, 75, 0.08)',
                fontSize: '12px',
                color: 'rgba(58, 52, 47, 0.5)',
                textAlign: 'center',
                lineHeight: '1.4',
              }}
            >
              Press <kbd style={{
                background: 'rgba(232, 75, 75, 0.1)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '500',
                color: 'rgba(58, 52, 47, 0.7)',
              }}>ESC</kbd> to close
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}