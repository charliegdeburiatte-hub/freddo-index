/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'freddo-green': '#4CAF50',
        'cadbury-purple': '#4A1C6E',
        'panel': 'rgba(15,15,15,0.88)',
        'base': '#0F0F0F',
      },
      fontFamily: {
        // Rufina loaded via @import in index.css
        'rufina': ['Rufina', 'serif'],
      },
    },
  },
  plugins: [],
}
