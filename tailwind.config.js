/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        soc: {
          bg: '#080c14',
          card: '#0d1322',
          cardHover: '#131b2e',
          border: '#1e293b',
          borderGlow: '#334155',
          accent: '#00f0ff',
          neonGreen: '#10b981',
          neonAmber: '#f59e0b',
          neonRed: '#f43f5e',
          neonPurple: '#a855f7',
          muted: '#64748b',
          text: '#f1f5f9'
        },
        wm: {
          dark: '#05070c',
          panel: '#0e1524',
          subtle: '#1a243b',
          border: '#1f2d48',
          accent: '#00ff88',
          blue: '#38bdf8',
          critical: '#ff3366',
          high: '#ff8800',
          medium: '#ffcc00',
          low: '#38bdf8',
          info: '#a78bfa'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace', 'ui-monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif']
      },
      boxShadow: {
        'glow-green': '0 0 20px -3px rgba(16, 185, 129, 0.3)',
        'glow-cyan': '0 0 25px -4px rgba(6, 182, 212, 0.35)',
        'glow-red': '0 0 25px -4px rgba(244, 63, 94, 0.4)',
        'cyber-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
