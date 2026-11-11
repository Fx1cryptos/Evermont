/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        evermont: {
          blue: '#080A9F',
          white: '#FFFFFF',
          gold: '#C8A43D',
          dark: '#07143D',
          light: '#F5F7FB',
          border: '#e0e0e0',
          muted: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['"Avenir Next"', 'Segoe UI', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Iowan Old Style"', 'Palatino', '"Palatino Linotype"', 'Georgia', 'serif'],
      },
      spacing: {
        sidebar: '280px',
      },
    },
  },
  plugins: [],
}
