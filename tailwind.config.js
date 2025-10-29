/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // OASARA Brand Colors
        'ignition-amber': '#D97925',
        'champagne-gold': '#D4AF37',
        'warm-clay': '#C17754',
        'deep-teal': '#0B697A',
        'cream': '#FFF8F0',
        'desert-sand': '#E5D4B8',
        'dark-base': '#0A0A0A',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Open Sans', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-up': 'fade-up 0.5s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(217, 121, 37, 0.5)' },
          '50%': { opacity: '.8', boxShadow: '0 0 30px rgba(217, 121, 37, 0.8)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
