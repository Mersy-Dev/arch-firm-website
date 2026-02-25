import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { '500':'#2A4A7A', '600':'#1E3A64' },
        gold:  { '500':'#C9A84C', '600':'#A88A38' },
        ink:   { '900':'#1A1A1A', '700':'#333333', '500':'#555555', '300':'#888888', '100':'#E5E5E5' },
      },
      fontFamily: {
        sans:    ['var(--font-body)', 'sans-serif'],
        display: ['var(--font-display)', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;