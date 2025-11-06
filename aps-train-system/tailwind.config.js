/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'model-a': '#4A90E2',
        'model-b': '#E74C3C',
        'model-c': '#2ECC71',
      },
    },
  },
  plugins: [],
}
