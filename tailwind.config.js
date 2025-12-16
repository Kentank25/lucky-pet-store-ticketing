/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        'bg-canvas': 'var(--color-bg-canvas)',
        'bg-surface': 'var(--color-bg-surface)',
        'bg-subtle': 'var(--color-bg-subtle)',
        'bg-muted': 'var(--color-bg-muted)',
        
        'text-main': 'var(--color-text-main)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        'text-inverted': 'var(--color-text-inverted)',

        'border-subtle': 'var(--color-border-subtle)',
        'border-main': 'var(--color-border-main)',

        'primary': 'var(--color-primary)',
        'primary-soft': 'var(--color-primary-soft)',
        'primary-hover': 'var(--color-primary-hover)',
        
        'secondary': 'var(--color-secondary)',

        'glass-bg': 'var(--glass-bg)',
        'glass-border': 'var(--glass-border)',
      },
      boxShadow: {
        'glass-shadow': 'var(--glass-shadow)',
        'glow-primary': '0 0 20px -5px var(--color-primary-hover)',
        'glow-secondary': '0 0 20px -5px var(--color-secondary)',
        'elevation-1': '0 2px 5px -1px rgba(0, 0, 0, 0.1), 0 1px 3px -1px rgba(0, 0, 0, 0.06)',
        'elevation-2': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'elevation-3': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
