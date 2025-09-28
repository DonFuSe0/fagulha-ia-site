/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        muted: 'var(--muted)',
        text: 'var(--text)',
        primary: 'var(--primary)',
        'primary-600': 'var(--primary-600)',
        'primary-700': 'var(--primary-700)',
        accent: 'var(--accent)',
        success: 'var(--success)',
        danger: 'var(--danger)'
      }
    }
  },
  plugins: []
};