/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        navy: '#0F2557',
        ink: '#0D1117',
        gold: '#D97706',
        cream: '#FAFAF7',
      },
    },
  },
  plugins: [],
};
