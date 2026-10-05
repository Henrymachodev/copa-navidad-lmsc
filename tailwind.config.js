/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#A3E229',
          greenHover: '#b6f23d',
          blue: '#150D8B',
          blueAccent: '#2a39d1',
          lilac: '#b89bf0',
          purple: '#9e70ff',
          light: '#f3f4f2',
          dark: '#070422',
          surface: '#0f0a42',
          card: '#130d52',
        },
        navy: {
          950: '#070422',
          900: '#0b0736',
          850: '#0f0a42',
          800: '#140e56',
          700: '#1c156d',
        },
        lime: {
          neon: '#A3E229',
          hover: '#b6f23d',
          glow: '#c5f756',
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
        orbitron: ['Orbitron', 'sans-serif'],
        prosto: ['"Prosto One"', 'sans-serif'],
        sans: ['Poppins', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'glow-brand-green': '0 0 30px rgba(163, 226, 41, 0.45)',
        'glow-brand-blue': '0 0 30px rgba(42, 57, 209, 0.4)',
        'glow-lime': '0 0 25px -4px rgba(163, 226, 41, 0.45)',
        'glow-gold': '0 0 25px -5px rgba(245, 197, 24, 0.4)',
        'glow-red': '0 0 25px -5px rgba(201, 24, 43, 0.4)',
      }
    },
  },
  plugins: [],
}
