import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand color: #A67B5B (warm brown/beige)
        brand: {
          50: '#faf8f6',
          100: '#f5f0eb',
          200: '#e8ddd0',
          300: '#d4c2b0',
          400: '#b89d85',
          500: '#a67b5b', // Main brand color
          600: '#8f6849',
          700: '#6f5139',
          800: '#58412e',
          900: '#463424',
          950: '#2d2117',
        },
        // Keep white as pure white
        white: '#ffffff',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
