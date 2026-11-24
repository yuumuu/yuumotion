/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        appflowy: {
          bg: '#FAFAFA',
          surface: '#FFFFFF',
          border: '#E4E4E7',
          hover: '#F4F4F5',
          text: '#09090B',
          muted: '#71717A',
          darkBg: '#09090B',
          darkSurface: '#18181B',
          darkBorder: '#27272A',
          darkHover: '#222226',
          darkText: '#F4F4F5',
          darkMuted: '#A1A1AA'
        },
        linear: {
          panel: '#121215',
          lightPanel: '#F4F4F5',
          neonViolet: '#8B5CF6',
          neonRose: '#F43F5E',
          neonAmber: '#F59E0B',
          neonBlue: '#3B82F6',
          neonEmerald: '#10B981'
        }
      }
    }
  },
  plugins: []
};
