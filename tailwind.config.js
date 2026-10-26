/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        }
      },
      borderRadius: {
        'xl': '28px',
        '2xl': '36px',
      },
      boxShadow: {
        'soft': '0 25px 60px rgba(0,0,0,0.06)',
        'card': '0 8px 30px rgba(0,0,0,0.04)',
        'premium': '0 30px 80px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
}