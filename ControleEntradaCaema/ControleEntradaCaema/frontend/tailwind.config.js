/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F4F6F9',
        surface: '#FFFFFF',
        navy: {
          DEFAULT: '#0E2A43',
          light: '#163C5C',
          dark: '#081C2E',
        },
        teal: {
          DEFAULT: '#0D7377',
          light: '#12969B',
          dark: '#0A5A5D',
        },
        ink: {
          DEFAULT: '#172431',
          muted: '#64748B',
          faint: '#94A3B8',
        },
        border: '#E2E8F0',
        success: {
          DEFAULT: '#1E8A4C',
          bg: '#E7F6ED',
        },
        warning: {
          DEFAULT: '#C2650C',
          bg: '#FDF0E1',
        },
        danger: {
          DEFAULT: '#C0362C',
          bg: '#FBEAE8',
        },
      },
      fontFamily: {
        display: ['"Manrope"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(14, 42, 67, 0.06), 0 1px 3px rgba(14, 42, 67, 0.08)',
        popover: '0 8px 24px rgba(14, 42, 67, 0.16)',
      },
      borderRadius: {
        card: '0.75rem',
      },
    },
  },
  plugins: [],
}
