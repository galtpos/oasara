/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // OASARA Brand Colors - Ocean Teal & Gold Theme
        // Primary: Ocean Teal for trust, calm, healthcare
        // Accent: Vibrant Gold for premium, action, emphasis
        'ocean': {
          50: '#EDF5F6',
          100: '#D4E8EA',
          200: '#A8D1D6',
          300: '#6BB3BC',
          400: '#3E95A0',
          500: '#2A7A85',
          600: '#1E6068',  // PRIMARY - Headers, links
          700: '#184D54',
          800: '#133B40',
          900: '#0D2A2E',
        },
        'sage': {
          50: '#F8FAF9',
          100: '#EEF3F0',
          200: '#DCE5E0',
          300: '#C4D4CB',
          400: '#A3BAB0',
          500: '#7A9A8D',
          600: '#5A7A6C',
          700: '#445C50',
          800: '#2F4038',
          900: '#1A2520',
        },
        'gold': {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',  // Stat numbers, highlights
          400: '#FBBF24',  // Vibrant gold - CTAs
          500: '#F59E0B',  // PRIMARY GOLD - buttons, accents
          600: '#D97706',  // Darker gold - hover states
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // Semantic colors
        'primary': '#1E6068',      // Ocean Teal 600
        'primary-light': '#3E95A0', // Ocean Teal 400
        'primary-dark': '#184D54',  // Ocean Teal 700
        'accent': '#F59E0B',        // Gold 500 (vibrant)
        'accent-light': '#FBBF24',  // Gold 400
        'accent-dark': '#D97706',   // Gold 600
        // Legacy colors (keeping for compatibility)
        'ignition-amber': '#D97706',
        'champagne-gold': '#F59E0B',
        'warm-clay': '#A3BAB0',
        'deep-teal': '#1E6068',
        'cream': '#F8FAF9',
        'desert-sand': '#EEF3F0',
        'dark-base': '#0D2A2E',
      },
      fontFamily: {
        'display': ['Cinzel', 'serif'],
        'serif': ['Cinzel', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-up': 'fade-up 0.5s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(201, 165, 79, 0.5)' },
          '50%': { opacity: '.8', boxShadow: '0 0 30px rgba(201, 165, 79, 0.8)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        'sm': '3px',
        'DEFAULT': '4px',
        'md': '6px',
        'lg': '8px',
      },
      boxShadow: {
        'gold': '0 4px 0 #8B6914, 0 6px 16px rgba(139, 105, 20, 0.3)',
        'gold-hover': '0 6px 0 #8B6914, 0 10px 24px rgba(139, 105, 20, 0.4)',
        'sage': '0 4px 0 #1A3D2F, 0 6px 16px rgba(45, 90, 71, 0.3)',
        'card': '0 4px 16px rgba(45, 90, 71, 0.08)',
        'card-hover': '0 8px 24px rgba(45, 90, 71, 0.12)',
      },
    },
  },
  plugins: [],
}
