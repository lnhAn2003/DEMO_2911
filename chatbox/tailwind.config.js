// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',  
    './pages/**/*.{js,ts,jsx,tsx}', 
    './src/**/*.{js,ts,jsx,tsx}',  
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sour Gummy', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#1E3A8A',       // Blue-900
        secondary: '#3B82F6',     // Blue-500
        accent: '#F59E0B',        // Yellow-500
        neutral: '#F3F4F6',       // Gray-100
        dark: '#111827',          // Gray-900
        light: '#FFFFFF',         // White
        'heatmap-empty': '#ebedf0',
        'heatmap-1': '#c6e48b',
        'heatmap-2': '#7bc96f',
        'heatmap-3': '#239a3b',
        'heatmap-4': '#196127',
      },
    },
  },
  plugins: [],
};
