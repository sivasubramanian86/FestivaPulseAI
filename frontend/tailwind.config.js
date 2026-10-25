/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
      }
    },
  },
  plugins: [],
}
