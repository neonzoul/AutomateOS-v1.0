'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ControlButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'dark' | 'darker';
}

function ControlButton({
  icon,
  onClick,
  disabled = false,
  variant = 'dark'
}: ControlButtonProps) {
  return (
    <motion.button
      whileHover={!disabled ? {
        scale: 1.05,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={!disabled ? {
        scale: 0.95,
        transition: { duration: 0.1 }
      } : {}}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '48px',
        height: '48px',
        borderRadius: '8px',
        background: variant === 'dark' ? '#3D3D3D' : '#4D4D4D',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: '#FFFFFF',
        fontSize: '20px',
        opacity: disabled ? 0.5 : 1,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.2s ease'
      }}
    >
      {icon}
    </motion.button>
  );
}

interface ControllerBarProps {
  onRun?: () => void;
  onStop?: () => void;
  onSave?: () => void;
  onUndo?: () => void;
  onRefresh?: () => void;
  onAdd?: () => void;
  onClear?: () => void;
  isRunning?: boolean;
}

export function ControllerBar({
  onRun,
  onStop,
  onSave,
  onUndo,
  onRefresh,
  onAdd,
  onClear,
  isRunning = false
}: ControllerBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px'
      }}
    >
      {/* Container with gray matte background */}
      <div style={{
        background: '#AEAEAE',
        borderRadius: '20px',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
      }}>

        {/* Left Control Group - Playback Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {/* Play/Pause Button */}
          <ControlButton
            icon={
              isRunning ? (
                // Pause icon
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="5" width="4" height="14" rx="1" fill="white"/>
                  <rect x="14" y="5" width="4" height="14" rx="1" fill="white"/>
                </svg>
              ) : (
                // Play icon
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5.14v13.72L19 12 8 5.14z" fill="white"/>
                </svg>
              )
            }
            onClick={isRunning ? onStop : onRun}
            variant="dark"
          />

          {/* Pause Button (standalone) */}
          <ControlButton
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="5" width="4" height="14" rx="1" fill="white"/>
                <rect x="14" y="5" width="4" height="14" rx="1" fill="white"/>
              </svg>
            }
            onClick={onStop}
            variant="dark"
            disabled={!isRunning}
          />

          {/* Skip Forward Button */}
          <ControlButton
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 5.14v13.72L15 12 4 5.14zM17 5v14h2V5h-2z" fill="white"/>
              </svg>
            }
            onClick={() => console.log('Skip forward')}
            variant="dark"
          />

          {/* Repeat/Loop Button */}
          <ControlButton
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" fill="white"/>
              </svg>
            }
            onClick={() => console.log('Repeat')}
            variant="dark"
          />
        </div>

        {/* Divider */}
        <div style={{
          width: '1px',
          height: '48px',
          background: 'rgba(255, 255, 255, 0.2)'
        }} />

        {/* Right Control Group - Utility Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {/* Download/Save Button */}
          <ControlButton
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z" fill="white"/>
              </svg>
            }
            onClick={onSave}
            variant="darker"
          />

          {/* Undo Button */}
          <ControlButton
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" fill="white"/>
              </svg>
            }
            onClick={onUndo}
            variant="darker"
          />

          {/* Refresh Button */}
          <ControlButton
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="white"/>
              </svg>
            }
            onClick={onRefresh}
            variant="darker"
          />

          {/* Add/Plus Button */}
          <ControlButton
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="white"/>
              </svg>
            }
            onClick={onAdd}
            variant="darker"
          />

          {/* Clear/Trash Button */}
          <ControlButton
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="white"/>
              </svg>
            }
            onClick={onClear}
            variant="darker"
          />
        </div>
      </div>
    </motion.div>
  );
}
