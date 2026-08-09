import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Luxury black + gold palette
        background: '#050505',
        surface: '#0c0c0e',
        elevated: '#131316',
        border: 'rgba(255, 255, 255, 0.08)',
        gold: {
          DEFAULT: '#d4af37',
          50: '#fbf7e8',
          100: '#f6ecc4',
          200: '#eddc8f',
          300: '#e3c95a',
          400: '#d4af37',
          500: '#c19b2e',
          600: '#a07d24',
          700: '#7d5f1f',
          800: '#5f481c',
          900: '#4a3817',
        },
        champagne: '#f7e7ce',
        ink: {
          DEFAULT: '#e7e7ea',
          muted: '#9a9aa3',
          faint: '#6b6b74',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        'display-lg': ['clamp(3rem, 8vw, 7rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-md': ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1', letterSpacing: '-0.025em' }],
        'display-sm': ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #f6ecc4 0%, #d4af37 45%, #a07d24 100%)',
        'gold-radial': 'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.18), transparent 60%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        gold: '0 0 40px -12px rgba(212, 175, 55, 0.5)',
        'gold-lg': '0 0 80px -20px rgba(212, 175, 55, 0.45)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-gold': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
        shimmer: 'shimmer 3s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'pulse-gold': 'pulse-gold 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
