/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060c18',
          900: '#0a0f1d',
          850: '#0d1629',
          800: '#111d35',
          700: '#192b4d',
        },
        lime: {
          neon: '#80e100',
          hover: '#90f00a',
          glow: '#a6f728',
        },
        gold: {
          400: '#f5c518',
          500: '#e5b20a',
          600: '#c59500',
        },
        navidad: {
          red: '#c9182b',
          crimson: '#9e0d1d',
          green: '#1b7a42',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'glow-lime': '0 0 25px -4px rgba(128, 225, 0, 0.45)',
        'glow-gold': '0 0 25px -5px rgba(245, 197, 24, 0.4)',
        'glow-red': '0 0 25px -5px rgba(201, 24, 43, 0.4)',
      }
    },
  },
  plugins: [],
}
