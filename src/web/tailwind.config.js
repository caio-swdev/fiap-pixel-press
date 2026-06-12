/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#08080c',
        surface: '#101019',
        'surface-2': '#171722',
        'surface-3': '#1f1f2c',
        line: '#272733',
        fg: '#ECECF1',
        muted: '#82828f',
        'muted-2': '#5b5b68',
        accent: '#cdfa50',
        'accent-dim': '#a7cf3c',
        'accent-ink': '#0b0e02',
        danger: '#ff5470',
        'danger-dim': '#c93a52',
        warn: '#ffb648',
        info: '#5ad1ff',
      },
      fontFamily: {
        display: ['"Chakra Petch"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(205,250,80,0.35), 0 0 24px -6px rgba(205,250,80,0.45)',
        'glow-soft': '0 0 30px -10px rgba(205,250,80,0.25)',
        card: '0 18px 40px -24px rgba(0,0,0,0.9)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-glow': {
          '0%,100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.4s ease both',
        'scale-in': 'scale-in 0.22s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
