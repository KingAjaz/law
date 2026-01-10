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
        // Primary Brand: Wine Magenta #A10454
        brand: {
          50: '#FCE6EF',  // Light Rose Tint (soft background)
          100: '#F8D1DF',
          200: '#F1A3BF',
          300: '#E9759F',
          400: '#E2477F',
          500: '#A10454', // Main brand color - Wine Magenta
          600: '#8A0347',
          700: '#72023A',
          800: '#5B002D', // Deep Plum (secondary accent)
          900: '#440022',
          950: '#2D0016',
        },
        // Primary colors (alias to brand for compatibility)
        primary: {
          50: '#FCE6EF',
          100: '#F8D1DF',
          200: '#F1A3BF',
          300: '#E9759F',
          400: '#E2477F',
          500: '#A10454',
          600: '#8A0347',
          700: '#72023A',
          800: '#5B002D',
          900: '#440022',
          950: '#2D0016',
        },
        // Highlight/CTA: Coral Rose #E43F8C
        highlight: {
          DEFAULT: '#E43F8C',
          50: '#FDF2F8',
          100: '#FCE6F0',
          200: '#F9CCE1',
          300: '#F5B3D2',
          400: '#F099C3',
          500: '#E43F8C',
          600: '#D61A7A',
          700: '#B81466',
          800: '#9A0F52',
          900: '#7C0A3E',
        },
        // Dark theme colors (for auth pages) - based on Deep Plum
        dark: {
          50: '#F5F0F3',
          100: '#EBE1E7',
          200: '#D7C3CF',
          300: '#C3A5B7',
          400: '#AF879F',
          500: '#9B6987',
          600: '#874B6F',
          700: '#732D57',
          800: '#5B002D', // Deep Plum
          900: '#440022',
          950: '#2D0016',
        },
        // Text colors - use with text-text-primary or text-text-muted
        text: {
          primary: '#1A1A1A',    // Charcoal Black
          muted: '#6B6B6B',      // Cool Gray
        },
        // Gray scale for borders and neutral elements
        gray: {
          50: '#F9F9F9',
          100: '#F5F5F5',
          200: '#E5E5E5',  // Border/Divider - Light Gray
          300: '#CCCCCC',  // Border medium
          400: '#999999',  // Border dark
          500: '#6B6B6B',  // Text Muted - Cool Gray
          600: '#4A4A4A',
          700: '#333333',
          800: '#1F1F1F',
          900: '#1A1A1A',  // Text Primary - Charcoal Black
        },
        // Keep white as pure white
        white: '#FFFFFF',
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
