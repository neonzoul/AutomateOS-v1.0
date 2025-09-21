/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // AutomateOS Brand Colors - Inspired by "Her" OS
        coral: {
          50: '#fef7f7',
          100: '#fdeaea',
          200: '#fad9d9',
          300: '#f5bbbb',
          400: '#ee9292',
          500: '#e84b4b', // Primary brand color
          600: '#d73d3d',
          700: '#b52f2f',
          800: '#952929',
          900: '#7a1e1e', // Deep burgundy
        },
        cream: {
          50: '#fff9f5',
          100: '#fff3e9', // Soft cream background
          200: '#ffe9d6',
          300: '#ffd9b8',
          400: '#ffc48a',
          500: '#ffae5c',
          600: '#e69548',
          700: '#cc7d3a',
          800: '#b3652c',
          900: '#99511e',
        },
        // Neutral grays for structure
        neutral: {
          50: '#f5f5f5', // Light gray
          100: '#eeeeee',
          200: '#dddddd',
          300: '#cccccc',
          400: '#aaaaaa',
          500: '#888888',
          600: '#666666',
          700: '#444444',
          800: '#333333',
          900: '#222222', // Dark gray
        }
      },
      backgroundImage: {
        // Gradient backgrounds for depth
        'canvas-light': 'linear-gradient(135deg, #fff3e9 0%, #f5f5f5 100%)',
        'canvas-dark': 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
        'node-start': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'node-http': 'linear-gradient(135deg, #e84b4b 0%, #d73d3d 100%)',
        'node-hover': 'linear-gradient(135deg, #f5bbbb 0%, #ee9292 100%)',
        'status-running': 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
        'status-success': 'linear-gradient(45deg, #10b981, #059669)',
        'status-error': 'linear-gradient(45deg, #ef4444, #dc2626)',
      },
      boxShadow: {
        // Organic, soft shadows for depth
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'large': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 20px rgba(232, 75, 75, 0.3)',
        'glow-soft': '0 0 8px rgba(232, 75, 75, 0.2)',
      },
      animation: {
        // Breathing and organic animations
        'breathe': 'breathe 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'spring-in': 'springIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.02)', opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(232, 75, 75, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(232, 75, 75, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        springIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      }
    },
  },
  plugins: [],
};
