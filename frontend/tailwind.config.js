/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tactical: {
          dark: '#0C0814',
          darkSurface: '#140F22',
          darkCard: '#1D1630',
          darkBorder: '#352952',
          light: '#FAF7F2',
          lightSurface: '#FFFFFF',
          lightCard: '#FDFBF7',
          lightBorder: '#E8DFD1',
          cyan: '#D4AF37',
          cyanGlow: '#F5E6CA',
          emerald: '#059669',
          amber: '#F59E0B',
          rose: '#E11D48',
        },
        festiva: {
          ivory: '#FAF7F2',
          ivoryCard: '#FFFFFF',
          ivoryWell: '#FDFBF7',
          border: '#E8DFD1',
          gold: '#D4AF37',
          goldLight: '#F5E6CA',
          goldMuted: '#C59F4E',
          royalIndigo: '#1E1B4B',
          royalPlum: '#2D112C',
          obsidian: '#0C0814',
          obsidianSurface: '#140F22',
          obsidianCard: '#1D1630',
          obsidianBorder: '#352952',
          emerald: '#059669',
          ruby: '#E11D48',
          marigold: '#F59E0B',
          marigoldWarm: '#D97706',
          slate: '#334155',
        }
      },
      fontFamily: {
        display: ['Cinzel', 'Playfair Display', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}
