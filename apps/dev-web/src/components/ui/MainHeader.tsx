'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MainHeaderProps {
  onRun?: () => void;
  onShare?: () => void;
  isRunning?: boolean;
}

export function MainHeader({ onRun, onShare, isRunning = false }: MainHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '56px',
        zIndex: 9999,
        background: 'linear-gradient(135deg, #FF6B6B 0%, #E84B4B 100%)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
        boxShadow: scrolled
          ? '0 2px 4px -1px rgba(232, 75, 75, 0.06), 0 4px 6px -1px rgba(232, 75, 75, 0.10), 0 1px 0 rgba(232, 75, 75, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 1px 3px rgba(232, 75, 75, 0.12), 0 1px 2px rgba(232, 75, 75, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      }}
    >
      <div
        style={{
          height: '100%',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Logo Section */}
        <motion.div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.span
            style={{
              fontSize: '22px',
              color: 'rgba(255, 255, 255, 0.95)',
              display: 'inline-flex',
              alignItems: 'center',
              fontWeight: '700',
            }}
            animate={{
              y: [0, -2, 0],
            }}
            transition={{
              duration: 6,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            ∞
          </motion.span>
          <span
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
              fontSize: '18px',
              fontWeight: '700',
              letterSpacing: '-0.02em',
              color: 'rgba(255, 255, 255, 0.98)',
            }}
          >
            AutomateOS
          </span>
        </motion.div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Run Button */}
          <motion.button
            onClick={onRun}
            disabled={isRunning}
            whileHover={!isRunning ? { scale: 1.02, y: -1 } : {}}
            whileTap={!isRunning ? { scale: 0.98 } : {}}
            style={{
              padding: '8px 20px',
              minWidth: '80px',
              height: '36px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              fontSize: '14px',
              fontWeight: '600',
              letterSpacing: '-0.01em',
              background: isRunning
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(255, 255, 255, 0.15)',
              color: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: isRunning
                ? 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                : '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              opacity: isRunning ? 0.5 : 1,
            }}
          >
            <AnimatePresence mode="wait">
              {isRunning ? (
                <motion.div
                  key="running"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ display: 'inline-block' }}
                  >
                    ⟳
                  </motion.span>
                  Running
                </motion.div>
              ) : (
                <motion.span
                  key="run"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  Run
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Share Button */}
          <motion.button
            onClick={onShare}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '8px 20px',
              minWidth: '80px',
              height: '36px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              fontSize: '14px',
              fontWeight: '600',
              letterSpacing: '-0.01em',
              background: 'rgba(255, 255, 255, 0.15)',
              color: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.05)',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            Share
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}