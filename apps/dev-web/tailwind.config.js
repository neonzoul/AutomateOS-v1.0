/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Cinematic color system inspired by "Her" and "La La Land"
      colors: {
        // "Her" Inspired Warmth - Primary palette
        'coral-sunset': '#FF6B6B',      // Love, creativity, human connection
        'coral-light': '#FF8E8E',       // Lighter coral for hover states
        'coral-dark': '#FF4757',        // Deeper coral for active states
        'peach-soft': '#FFB4A2',        // Intimacy, comfort, evening glow
        'peach-light': '#FFC8B8',       // Light peach for backgrounds
        'cream-warm': '#FFF8F0',        // Canvas for possibilities
        'cream-light': '#FFFBF7',       // Lighter cream for cards

        // "La La Land" Dream Palette - Accent colors
        'golden-hour': '#FFD93D',       // Dreams, possibility, LA sunsets
        'lavender-twilight': '#A29BFE', // Mystery, romance, twilight
        'sage-whisper': '#00DFA2',      // Growth, harmony, reflection

        // Cinematic Neutrals - Supporting palette
        'warm-gray-50': '#FDFCFB',      // Almost white with warmth
        'warm-gray-100': '#F8F6F3',     // Very light warm gray
        'warm-gray-200': '#F0ECE8',     // Light warm gray for backgrounds
        'warm-gray-300': '#E5DFD9',     // Borders and separators
        'warm-gray-400': '#C4BCB5',     // Disabled states
        'warm-gray-500': '#9B8E85',     // Secondary text
        'warm-gray-600': '#756B62',     // Primary text on light
        'warm-gray-700': '#554D46',     // Strong text
        'warm-gray-800': '#3A342F',     // Headers
        'warm-gray-900': '#252017',     // Darkest text

        // Functional colors with cinematic warmth
        'success': '#00DFA2',           // Sage whisper for success
        'warning': '#FFD93D',           // Golden hour for warnings
        'error': '#FF6B6B',             // Coral sunset for errors
        'info': '#A29BFE',              // Lavender twilight for info

        // System colors (maintaining Apple standards)
        'system-blue': '#007AFF',
        'system-green': '#34C759',
        'system-red': '#FF3B30',
        'system-orange': '#FF9500',
      },

      // Cinematic typography system
      fontFamily: {
        'sans': [
          '-apple-system',
          'BlinkMacSystemFont',
          'Inter',
          'system-ui',
          'sans-serif'
        ],
        'display': [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif'
        ],
        'mono': [
          'SF Mono',
          'Monaco',
          'Inconsolata',
          'Roboto Mono',
          'monospace'
        ],
      },

      fontSize: {
        'display': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.003em', fontWeight: '600' }],
        'title-1': ['2.125rem', { lineHeight: '1.2', letterSpacing: '-0.002em', fontWeight: '600' }],
        'title-2': ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.001em', fontWeight: '600' }],
        'title-3': ['1.375rem', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '600' }],
        'body': ['1.0625rem', { lineHeight: '1.5', letterSpacing: '-0.022em', fontWeight: '400' }],
        'callout': ['1rem', { lineHeight: '1.4', letterSpacing: '-0.02em', fontWeight: '400' }],
        'caption': ['0.8125rem', { lineHeight: '1.3', letterSpacing: '-0.008em', fontWeight: '400' }],
      },

      // Refined shadow system (three levels only)
      boxShadow: {
        'raised': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)',
        'overlay': '0 4px 16px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.08)',
        'modal': '0 8px 32px rgba(0, 0, 0, 0.24), 0 4px 8px rgba(0, 0, 0, 0.12)',

        // Apple-style focus rings
        'focus-ring': '0 0 0 2px #007AFF, 0 0 0 4px rgba(0, 122, 255, 0.2)',
      },

      // Minimal border radius (more sophisticated)
      borderRadius: {
        'sm': '0.25rem',   // 4px
        'DEFAULT': '0.375rem', // 6px
        'md': '0.5rem',    // 8px
        'lg': '0.75rem',   // 12px
        'xl': '1rem',      // 16px
      },

      // Apple's spring animation curve
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
        'apple-in': 'cubic-bezier(0.42, 0, 1, 1)',
        'apple-out': 'cubic-bezier(0, 0, 0.58, 1)',
      },

      // Consistent transition durations
      transitionDuration: {
        'micro': '200ms',
        'macro': '350ms',
        'slow': '500ms',
      },

      // Systematic spacing scale
      spacing: {
        '4.5': '1.125rem',  // 18px
        '5.5': '1.375rem',  // 22px
        '6.5': '1.625rem',  // 26px
        '15': '3.75rem',    // 60px
        '18': '4.5rem',     // 72px
        '22': '5.5rem',     // 88px
      },

      // Cinematic gradient system
      backgroundImage: {
        // Primary cinematic gradients
        'coral-sunset': 'linear-gradient(135deg, #FF6B6B 0%, #FFB4A2 100%)',
        'coral-dream': 'linear-gradient(135deg, #FF8E8E 0%, #FFC8B8 100%)',
        'golden-twilight': 'linear-gradient(135deg, #FFD93D 0%, #A29BFE 100%)',
        'sage-flow': 'linear-gradient(135deg, #00DFA2 0%, #FFD93D 100%)',

        // Soft background gradients
        'warm-glow': 'linear-gradient(135deg, #FFF8F0 0%, #F8F6F3 100%)',
        'canvas-dream': 'linear-gradient(135deg, #FDFCFB 0%, #F0ECE8 100%)',

        // Organic flow gradients (for nodes)
        'flow-coral': 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 50%, #FFB4A2 100%)',
        'flow-lavender': 'linear-gradient(135deg, #A29BFE 0%, #B8B5FF 50%, #D1CEFF 100%)',
        'flow-sage': 'linear-gradient(135deg, #00DFA2 0%, #42E8C2 50%, #84F5E1 100%)',

        // Cinematic scene gradients
        'her-scene': 'radial-gradient(circle at 30% 70%, #FF6B6B 0%, #FFB4A2 40%, #FFF8F0 100%)',
        'lalaland-scene': 'radial-gradient(circle at 70% 30%, #FFD93D 0%, #A29BFE 40%, #F8F6F3 100%)',
      }
    },
  },
  plugins: [],
};
