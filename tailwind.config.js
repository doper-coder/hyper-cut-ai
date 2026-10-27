/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0d0f12',
          850: '#13161c',
          800: '#1a1d24',
          700: '#262a34',
          600: '#343a47',
          500: '#485061'
        },
        accent: {
          blue: '#3b82f6',
          purple: '#8b5cf6',
          cyan: '#06b6d4',
          emerald: '#10b981',
          rose: '#f43f5e'
        }
      }
    },
  },
  plugins: [],
}
