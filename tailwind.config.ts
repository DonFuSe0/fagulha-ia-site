import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#ff7a00',
          light: '#ff944d',
          dark: '#cc6200'
        },
        background: {
          DEFAULT: '#0a0c10'
        }
      }
    }
  },
  plugins: []
};

export default config;