/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
        },
        accent: {
          teal: 'var(--accent-teal)',
          purple: 'var(--accent-purple)',
          amber: 'var(--accent-amber)',
          red: 'var(--accent-red)',
        },
      },
      boxShadow: {
        'glass': '0 4px 6px var(--glass-shadow)',
        'glass-lg': '0 8px 16px var(--glass-shadow)',
        'glass-xl': '0 12px 24px var(--glass-shadow)',
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.05)',
        'glow': '0 0 15px rgba(66, 153, 225, 0.5)',
        'glow-teal': '0 0 15px rgba(0, 240, 204, 0.5)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(8px)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
} 