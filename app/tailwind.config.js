/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f1f8e9',
          100: '#dcedc8',
          500: '#4CAF50',
          600: '#2E7D32',
          700: '#1B5E20',
        }
      }
    },
  },
  plugins: [],
}
