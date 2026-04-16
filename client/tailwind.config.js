/** @type {import('tailwindcss').Config} */
export default {
  content: {
    relative: true,
    files: [
      './index.html',
      './src/**/*.{js,jsx}',
      '../remote-auth/src/**/*.{js,jsx}',
      '../remote-community/src/**/*.{js,jsx}',
      '../remote-events/src/**/*.{js,jsx}',
    ],
  },
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
};
