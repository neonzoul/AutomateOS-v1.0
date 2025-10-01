'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AppIconProps {
  name: string;
  iconContent: React.ReactNode;
  index: number;
  isDark?: boolean;
}

function AppIcon({ name, iconContent, index, isDark = false }: AppIconProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: "easeOut"
      }}
      whileHover={{
        y: -4,
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: isDark ? '#1D3557' : '#FFFFFF',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        flexShrink: 0,
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.cursor = 'grabbing';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.cursor = 'grab';
      }}
      title={name}
    >
      {iconContent}
    </motion.div>
  );
}

// Google Icon Component
function GoogleIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
  );
}

// Slack Icon Component
function SlackIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 127 127" xmlns="http://www.w3.org/2000/svg">
      <path d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2S.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2s-13.2-5.9-13.2-13.2V80z" fill="#E01E5A"/>
      <path d="M47 27c-7.3 0-13.2-5.9-13.2-13.2S39.7.6 47 .6s13.2 5.9 13.2 13.2V27H47zm0 6.7c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2H13.9C6.6 60.1.7 54.2.7 46.9s5.9-13.2 13.2-13.2H47z" fill="#36C5F0"/>
      <path d="M99.9 46.9c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2-5.9 13.2-13.2 13.2H99.9V46.9zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V13.8C66.9 6.5 72.8.6 80.1.6c7.3 0 13.2 5.9 13.2 13.2v33.1z" fill="#2EB67D"/>
      <path d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80.1z" fill="#ECB22E"/>
    </svg>
  );
}

// LINE Icon Component
function LineIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#00C300" rx="15%"/>
      <path fill="#FFF" d="M443 233c0-84-84-152-188-152S67 149 67 233c0 75 66 138 156 150 6 1 14 4 16 9 2 4 1 11 1 15v35c0 3 2 6 6 5 2-1 90-53 123-91h-1c27-30 43-63 43-123zm-265 37h-70c-3 0-6-3-6-6v-88c0-3 3-6 6-6s6 3 6 6v82h64c3 0 6 3 6 6s-3 6-6 6zm39-94v88c0 3-3 6-6 6s-6-3-6-6v-88c0-3 3-6 6-6s6 3 6 6zm101 94h-70c-3 0-6-3-6-6v-88c0-3 3-6 6-6s6 3 6 6v82h64c3 0 6 3 6 6s-3 6-6 6zm88-63l-54 63c-1 1-2 2-4 2h-1c-3 0-5-3-5-6v-88c0-3 2-6 5-6h1c2 0 3 1 4 2l54 63v-59c0-3 3-6 6-6s6 3 6 6v88c0 3-3 6-6 6s-5-2-6-5z"/>
    </svg>
  );
}

// Notion Icon Component
function NotionIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path fill="#000" d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z M8.933 19.507v64.24c0 2.723 1.167 4.277 4.667 4.083l56.89 -3.307c3.113 -0.193 4.08 -1.547 4.08 -4.08V17.467c0 -2.53 -0.777 -4.083 -3.307 -3.89l-59.02 3.307c-2.72 0.193 -3.31 1.553 -3.31 2.623z M82.6 5.447c0.777 0.777 0.583 1.36 -0.19 1.553L77.953 8.557c-0.777 0.193 -1.553 0.39 -2.14 0.39 0 0 -0.97 -0.193 -0.97 -0.97V5.833c0 -0.777 0.58 -1.167 1.553 -1.167l4.667 -0.583c0.777 -0.193 1.36 0.193 1.553 1.36z"/>
    </svg>
  );
}

// Facebook Icon Component
function FacebookIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

// TikTok Icon Component
function TikTokIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#000" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}

// DNA Logo for AutomateOS
function DNAIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white">
      <path d="M12 2c.825 0 1.5.675 1.5 1.5v3.55a4.5 4.5 0 0 1 0 9.9v3.55c0 .825-.675 1.5-1.5 1.5s-1.5-.675-1.5-1.5v-3.55a4.5 4.5 0 0 1 0-9.9V3.5c0-.825.675-1.5 1.5-1.5z"/>
    </svg>
  );
}

export function AppNodeToolbar() {
  // App icons - Google, Slack, LINE, Notion, Facebook, TikTok
  const appIcons = [
    { name: 'Google', icon: <GoogleIcon /> },
    { name: 'Slack', icon: <SlackIcon /> },
    { name: 'LINE', icon: <LineIcon /> },
    { name: 'Notion', icon: <NotionIcon /> },
    { name: 'Facebook', icon: <FacebookIcon /> },
    { name: 'TikTok', icon: <TikTokIcon /> },
  ];

  // Control icons - AutomateOS, Workflow, AI
  const controlIcons = [
    { name: 'AutomateOS', icon: <DNAIcon />, isDark: true },
    { name: 'Workflow', icon: <span style={{ fontSize: '24px' }}>🔄</span>, isDark: true },
    { name: 'AI Agent', icon: <span style={{ fontSize: '24px' }}>🤖</span>, isDark: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.6)',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: '16px',
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
        position: 'relative'
      }}
    >
      {/* App Icons Group */}
      <div style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
      }}>
        {appIcons.map((item, index) => (
          <AppIcon
            key={item.name}
            name={item.name}
            iconContent={item.icon}
            index={index}
            isDark={false}
          />
        ))}
      </div>

      {/* Vertical Divider */}
      <div style={{
        width: '1px',
        height: '40px',
        background: 'rgba(0, 0, 0, 0.1)',
        flexShrink: 0,
        margin: '0 8px'
      }} />

      {/* Control Icons Group */}
      <div style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
      }}>
        {controlIcons.map((item, index) => (
          <AppIcon
            key={item.name}
            name={item.name}
            iconContent={item.icon}
            index={appIcons.length + index}
            isDark={item.isDark}
          />
        ))}
      </div>
    </motion.div>
  );
}
