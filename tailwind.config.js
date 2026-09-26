/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: 'selector',
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          dark: '#60a5fa',
        },
        background: {
          main: '#f8fafc',
          'main-dark': '#0f172a',
          card: '#ffffff',
          'card-dark': '#1e293b',
        },
        text: {
          main: '#0f172a',
          'main-dark': '#f8fafc',
          muted: '#64748b',
          'muted-dark': '#94a3b8',
        },
        border: {
          main: '#e2e8f0',
          'main-dark': '#334155',
        },
        danger: {
          DEFAULT: '#dc2626',
          dark: '#f87171',
        },
        success: {
          DEFAULT: '#16a34a',
          dark: '#4ade80',
        },
        warning: {
          DEFAULT: '#d97706',
          dark: '#fbbf24',
        },
        accent: '#FFC629',
      },
    },
  },
  plugins: [],
}
