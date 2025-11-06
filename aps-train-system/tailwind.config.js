/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores corporativos Metro de Madrid
        'metro-blue': '#003DA5',
        'metro-blue-light': '#0066CC',
        'metro-red': '#E30613',
        'metro-red-dark': '#B30000',
        'metro-gray': '#6B7280',
        'metro-gray-light': '#F3F4F6',

        // Colores para modelos de tren (adaptados)
        'model-a': '#0066CC',
        'model-b': '#E30613',
        'model-c': '#2ECC71',
      },
      boxShadow: {
        'metro': '0 4px 6px -1px rgba(0, 61, 165, 0.1), 0 2px 4px -1px rgba(0, 61, 165, 0.06)',
        'metro-lg': '0 10px 15px -3px rgba(0, 61, 165, 0.1), 0 4px 6px -2px rgba(0, 61, 165, 0.05)',
      },
    },
  },
  plugins: [],
}
