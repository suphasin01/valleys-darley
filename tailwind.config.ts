import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          50: '#fef7f7',
          100: '#fce8e8',
          200: '#f8d0d0',
          300: '#f3a8a8',
          400: '#ee7a7a',
          500: '#e95454',
          600: '#d93838',
          700: '#b92828',
          800: '#9a2222',
          900: '#821d1d',
          950: '#4a0f0f',
        },
        blush: {
          50: '#fdf4f5',
          100: '#fbeaeb',
          200: '#f6d5d7',
          300: '#f0b3b7',
          400: '#e98a90',
          500: '#de6b72',
          600: '#d4535b',
          700: '#b9464d',
          800: '#9e3e44',
          900: '#88363b',
          950: '#4d1d21',
        },
        sand: {
          50: '#fcfaf8',
          100: '#f8f4f0',
          200: '#f0e9e1',
          300: '#e4d9cc',
          400: '#d4c3b0',
          500: '#c4b39e',
          600: '#a89f91',
          700: '#8f897d',
          800: '#75716a',
          900: '#625e59',
          950: '#363431',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      fontSize: {
        'hero': ['clamp(3rem, 12vw, 8rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'section': ['clamp(2rem, 6vw, 4rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
