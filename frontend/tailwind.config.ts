import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#0096C7',
          'dark-blue': '#023E8A',
          'light-blue': '#ADE8F4',
        },
        secondary: {
          'mint-green': '#7DD87D',
          'soft-teal': '#48B7A5',
          'calm-purple': '#6C63FF',
        },
        neutral: {
          background: '#F7F9FC',
          white: '#FFFFFF',
          'light-gray': '#E9EEF5',
          'text-dark': '#1F2937',
          'text-medium': '#4B5563',
          border: '#D1D5DB',
        },
        status: {
          success: '#2ECC71',
          warning: '#F1C40F',
          error: '#E74C3C',
        }
      }
    },
  },
  plugins: [],
} satisfies Config