/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arcade: {
          bg: "#0d0e15",
          panel: "#161925",
          border: "#252b41",
          glow: "#3b82f6",
        }
      },
      boxShadow: {
        'tactile-in': 'inset 0 4px 6px -1px rgba(0, 0, 0, 0.5), inset 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        'coin-3d': '0 4px 0 0 rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.3)',
        'btn-3d': '0 6px 0 0 var(--tw-shadow-color, #1e293b), 0 10px 20px rgba(0,0,0,0.4)',
        'btn-3d-pressed': '0 2px 0 0 var(--tw-shadow-color, #1e293b), 0 4px 8px rgba(0,0,0,0.4)',
      }
    },
  },
  plugins: [],
}
