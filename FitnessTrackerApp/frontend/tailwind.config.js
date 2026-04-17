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
        brand: {
          orange: '#FF8A00',
          darkOrange: '#E57900',
          green: '#00C853',
          darkGreen: '#00A844',
          bg: '#F9FAFB',
          darkBg: '#111827',
          card: '#FFFFFF',
          darkCard: '#1F2937'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      }
    },
  },
  plugins: [],
}
