/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,svelte,ts}'],
  theme: {
    extend: {
      animation: {
        shimmer: 'shimmer 8s infinite',
  gradient: 'gradient 8s linear infinite',
  'aurora-border': 'aurora-border 6s ease-in-out infinite',
  'aurora-1': 'aurora-1 12s ease-in-out infinite alternate',
  'aurora-2': 'aurora-2 12s ease-in-out infinite alternate',
  'aurora-3': 'aurora-3 12s ease-in-out infinite alternate',
  'aurora-4': 'aurora-4 12s ease-in-out infinite alternate'
      },
      keyframes: {
        shimmer: {
          '0%, 90%, 100%': {
            'background-position': 'calc(-100% - var(--shimmer-width)) 0'
          },
          '30%, 60%': {
            'background-position': 'calc(100% + var(--shimmer-width)) 0'
          }
        },
        gradient: {
          to: { 'background-position': '200% center' }
        },
        'aurora-border': {
          '0%,100%': { borderRadius: '37% 29% 27% 27% / 28% 25% 41% 37%' },
          '25%': { borderRadius: '47% 29% 39% 49% / 61% 19% 66% 26%' },
            '50%': { borderRadius: '57% 23% 47% 72% / 63% 17% 66% 33%' },
            '75%': { borderRadius: '28% 49% 29% 100% / 93% 20% 64% 25%' }
        },
        'aurora-1': {
          '0%,100%': { top: '0', right: '0' },
          '50%': { top: '50%', right: '25%' },
          '75%': { top: '25%', right: '50%' }
        },
        'aurora-2': {
          '0%,100%': { top: '0', left: '0' },
          '60%': { top: '75%', left: '25%' },
          '85%': { top: '50%', left: '50%' }
        },
        'aurora-3': {
          '0%,100%': { bottom: '0', left: '0' },
          '40%': { bottom: '50%', left: '25%' },
          '65%': { bottom: '25%', left: '50%' }
        },
        'aurora-4': {
          '0%,100%': { bottom: '0', right: '0' },
          '50%': { bottom: '25%', right: '40%' },
          '90%': { bottom: '50%', right: '25%' }
        }
      }
    }
  },
  plugins: []
}
