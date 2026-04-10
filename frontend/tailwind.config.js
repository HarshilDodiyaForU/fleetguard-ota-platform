/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fleet: {
          bg: '#0A0E27',
          panel: '#0F173D',
          accent: '#22D3EE',
        },
      },
    },
  },
  plugins: [],
}
