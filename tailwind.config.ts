import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        arena: {
          bg: '#0a0a0f',
          surface: '#0f0f1a',
          border: '#1e1e2e',
          card: '#12121e',
        },
        bob: {
          DEFAULT: '#00ff88',
          dim: '#00cc6a',
          glow: 'rgba(0,255,136,0.15)',
        },
        mycrosaift: {
          DEFAULT: '#ff3366',
          dim: '#cc2952',
          glow: 'rgba(255,51,102,0.15)',
        },
        severity: {
          critical: '#ff1744',
          high: '#ff6d00',
          medium: '#ffd600',
          low: '#29b6f6',
          info: '#78909c',
        },
      },
      animation: {
        'pulse-green': 'pulse-green 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'pulse-red': 'pulse-red 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'count-up': 'fade-in 0.5s ease-out',
      },
      keyframes: {
        'pulse-green': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(0,255,136,0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(0,255,136,0)' },
        },
        'pulse-red': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(255,51,102,0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(255,51,102,0)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
