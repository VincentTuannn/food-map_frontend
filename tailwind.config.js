/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: '#FF6B35',
          light: 'rgba(255,107,53,0.12)',
          dim:   'rgba(255,107,53,0.06)',
        },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'sans-serif'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.08)',
        sheet: '0 -8px 32px rgba(0,0,0,0.12)',
        poi: '0 4px 16px rgba(255,107,53,0.35)',
      },
    },
  },
  plugins: [],
}