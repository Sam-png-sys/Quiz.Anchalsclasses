/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#185fa5',
          light: '#e6f1fb',
          dark: '#378add',
        },
        surface: {
          DEFAULT: '#ffffff',
          2: '#f1efe8',
        },
      },
    },
  },
  plugins: [],
}
