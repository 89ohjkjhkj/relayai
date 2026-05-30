import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0edff',
          100: '#ddd6fe',
          200: '#c4b5fd',
          300: '#a78bfa',
          400: '#8b5cf6',
          500: '#6c5ce7',
          600: '#5b4bd5',
          700: '#4c3cc0',
          800: '#3d2f9e',
          900: '#2e2478',
        },
        dark: {
          50: '#2a2a4a',
          100: '#252545',
          200: '#1f1f3a',
          300: '#1a1a32',
          400: '#151528',
          500: '#111122',
          600: '#0d0d1a',
          700: '#0a0a14',
          800: '#07070e',
          900: '#040408',
        },
      },
    },
  },
  plugins: [],
}
export default config
