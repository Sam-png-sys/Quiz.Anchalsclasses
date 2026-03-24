/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
      colors: {
        accent: { DEFAULT: '#4f6ef7', 2: '#7c3aed' },
      },
      backgroundImage: {
        'grad-primary': 'linear-gradient(135deg, #4f6ef7, #7c3aed)',
        'grad-soft':    'linear-gradient(135deg, #eef2ff, #f5f3ff)',
        'grad-dark':    'linear-gradient(135deg, #1e1e35, #16162a)',
      },
      boxShadow: {
        'glow':    '0 0 20px rgba(79,110,247,0.2)',
        'glow-lg': '0 0 40px rgba(79,110,247,0.25)',
        'card':    '0 2px 12px rgba(0,0,0,0.06)',
        'card-lg': '0 8px 32px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
}
