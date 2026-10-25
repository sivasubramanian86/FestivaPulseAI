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
          dark: '#0B1326',
          darkSurface: '#10192E',
          darkCard: '#17223B',
          darkBorder: '#233252',
          light: '#F8FAFC',
          lightSurface: '#FFFFFF',
          lightCard: '#F1F5F9',
          lightBorder: '#CBD5E1',
          cyan: '#06B6D4',
          cyanGlow: '#22D3EE',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
        },
        festiva: {
          ivory: '#FAF8F5',
          card: '#FFFFFF',
          border: '#E8E4DD',
          indigo: '#1E1B4B',
          teal: '#0D9488',
          coral: '#E11D48',
          amber: '#D97706',
          slate: '#334155',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}
