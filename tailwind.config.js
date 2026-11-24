/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        appflowy: {
          bg: '#FBFBFC',
          surface: '#FFFFFF',
          border: '#E8E9EC',
          hover: '#F2F3F5',
          text: '#22252A',
          muted: '#6C727E',
          darkBg: '#18191B',
          darkSurface: '#202226',
          darkBorder: '#2E3137',
          darkHover: '#2A2D33',
          darkText: '#ECEEF2',
          darkMuted: '#949BA6'
        }
      }
    }
  },
  plugins: []
};
