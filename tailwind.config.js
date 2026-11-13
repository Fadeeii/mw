/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        atlas: {
          ivory: '#fcfbf9',
          cream: '#f7f5f0',
          stone: '#ede9e0',
          sand: '#ded8cb',
          border: '#e4dfd5',
          text: '#1c2024',
          muted: '#636c76',
          subtle: '#8a94a0',
          forest: '#265434',
          'forest-soft': '#edf5ef',
          terracotta: '#8f5635',
          'terracotta-soft': '#fbf3ed',
          ocean: '#275273',
          'ocean-soft': '#edf4f9',
          gold: '#9a7522'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace']
      },
      boxShadow: {
        'paper': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
        'paper-lg': '0 4px 6px -1px rgba(0,0,0,0.05), 0 16px 28px -4px rgba(0,0,0,0.09)',
        'pill': '0 1px 2px rgba(0,0,0,0.05)'
      }
    },
  },
  plugins: [],
}
