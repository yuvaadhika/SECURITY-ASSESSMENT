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
          bg: '#f8fafc',         // Mild soft slate background
          card: '#ffffff',       // Pure white clean cards
          cardHover: '#f1f5f9',  // Subtle slate hover
          border: '#e2e8f0',     // Crisp clean hairline border
          borderGlow: '#cbd5e1', // Soft border highlight
          accent: '#2563eb',     // Royal / Cobalt blue (Human enterprise standard)
          neonGreen: '#059669',  // Natural Emerald
          neonAmber: '#d97706',  // Natural Amber
          neonRed: '#dc2626',    // Natural Crimson
          neonPurple: '#7c3aed', // Natural Violet / Indigo
          muted: '#64748b',      // Slate 500
          text: '#0f172a',       // Deep Slate 900
          subtext: '#334155'     // Slate 700
        },
        wm: {
          dark: '#0f172a',
          panel: '#ffffff',
          subtle: '#f8fafc',
          border: '#e2e8f0',
          accent: '#059669',
          blue: '#2563eb',
          critical: '#dc2626',
          high: '#ea580c',
          medium: '#d97706',
          low: '#2563eb',
          info: '#6366f1'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'soft-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)',
        'soft-md': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.07)',
        'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'phone': '0 25px 50px -12px rgba(15, 23, 42, 0.18), 0 0 0 12px #1e293b, 0 0 0 14px #334155',
        'glow-green': '0 4px 14px -2px rgba(5, 150, 105, 0.25)',
        'glow-cyan': '0 4px 14px -2px rgba(37, 99, 235, 0.25)',
        'glow-red': '0 4px 14px -2px rgba(220, 38, 38, 0.25)',
        'cyber-card': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)'
      }
    },
  },
  plugins: [],
}
