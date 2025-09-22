'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MainHeaderProps {
  onRun?: () => void;
  onExport?: () => void;
  isRunning?: boolean;
}

export function MainHeader({ onRun, onExport, isRunning = false }: MainHeaderProps) {
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
        background: '#E84B4B',
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
            gap: '12px',
            cursor: 'pointer',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* AutomateOS Logo SVG */}
          <motion.div
            style={{
              width: '36px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
            <svg
              width="36"
              height="20"
              viewBox="0 0 72 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 20C18 11.7157 24.2157 5.5 32.5 5.5C40.7843 5.5 47 11.7157 47 20C47 28.2843 40.7843 34.5 32.5 34.5C27.5065 34.5 23.1847 31.6375 21.0033 27.5M51 20C51 11.7157 57.2157 5.5 65.5 5.5C73.7843 5.5 80 11.7157 80 20C80 28.2843 73.7843 34.5 65.5 34.5C57.2157 34.5 51 28.2843 51 20ZM51 20C51 28.2843 44.7843 34.5 36.5 34.5C31.5065 34.5 27.1847 31.6375 25.0033 27.5M25 20C25 11.7157 31.2157 5.5 39.5 5.5C44.4935 5.5 48.8153 8.3625 50.9967 12.5M-8 20C-8 11.7157 -1.78427 5.5 6.5 5.5C14.7843 5.5 21 11.7157 21 20C21 28.2843 14.7843 34.5 6.5 34.5C-1.78427 34.5 -8 28.2843 -8 20Z"
                stroke="rgba(255, 255, 255, 0.9)"
                strokeWidth="5"
                strokeLinecap="round"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                }}
              />
            </svg>
          </motion.div>
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
              borderRadius: '8px',
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
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <motion.svg
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    style={{ display: 'inline-block' }}
                  >
                    <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                  </motion.svg>
                  Running
                </motion.div>
              ) : (
                <motion.div
                  key="run"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ color: 'rgba(255, 255, 255, 0.98)' }}
                  >
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Run
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Export Button (previously Share) */}
          <motion.button
            onClick={onExport}
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
              borderRadius: '8px',
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