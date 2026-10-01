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
          blue: '#0504AA',
          white: '#FFFFFF',
          gold: '#C9A227',
          dark: '#1a1a2e',
          light: '#f8f9fa',
          border: '#e0e0e0',
          muted: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      spacing: {
        sidebar: '280px',
      },
    },
  },
  plugins: [],
}
