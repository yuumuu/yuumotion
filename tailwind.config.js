/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        bar: 'var(--bar)',
        surface: 'var(--surface)',
        hover: 'var(--hover)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        danger: 'var(--danger)',
        project: {
          solid: 'var(--project-solid)',
          accent: 'var(--project-accent)',
          soft: 'var(--project-soft)',
        },
        status: {
          urgent: 'var(--urgent)',
          'urgent-bg': 'var(--urgent-bg)',
          high: 'var(--high)',
          'high-bg': 'var(--high-bg)',
          medium: 'var(--medium)',
          'medium-bg': 'var(--medium-bg)',
          done: 'var(--done)',
          'done-bg': 'var(--done-bg)',
        },
        // Backwards compatibility tokens
        appflowy: {
          bg: 'var(--bg)',
          surface: 'var(--surface)',
          border: 'var(--border)',
          hover: 'var(--hover)',
          text: 'var(--text)',
          muted: 'var(--muted)',
          darkBg: 'var(--bg)',
          darkSurface: 'var(--surface)',
          darkBorder: 'var(--border)',
          darkHover: 'var(--hover)',
          darkText: 'var(--text)',
          darkMuted: 'var(--muted)'
        }
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['"Onest"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"Commit Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'card-rest': '0 1px 2px rgba(24, 24, 27, 0.05)',
        'card-hover': '0 6px 18px rgba(24, 24, 27, 0.09)',
        'card-drag': '0 18px 36px rgba(24, 24, 27, 0.18), 0 0 0 2px var(--project-accent)',
        'tactile-btn': 'inset 0 -2px 0 rgba(0, 0, 0, 0.16)',
        'focus-project': '0 0 0 3px var(--project-ring)',
      },
      transitionTimingFunction: {
        'spring-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'drag-glide': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
