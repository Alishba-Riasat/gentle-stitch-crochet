/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#8B5A2B',   // Your crochet brand color
        secondary: '#D2B48C', // Light brown
      },
    },
  },
 
  plugins: [require('@tailwindcss/line-clamp')],
  plugins: [require('tailwind-scrollbar-hide')],
}