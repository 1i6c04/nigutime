import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        temple: {
          bg: '#1a0e05',
          wood: '#3d1f0a',
          gold: '#c9a84c',
        },
      },
      keyframes: {
        'float-up': {
          '0%': { opacity: '1', transform: 'translate(-50%, -50%)' },
          '100%': { opacity: '0', transform: 'translate(-50%, -250%)' },
        },
        'screen-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-4px)' },
          '40%': { transform: 'translateX(4px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        'spin-bg': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'float-up': 'float-up 0.8s ease-out forwards',
        'screen-shake': 'screen-shake 0.4s ease-in-out infinite',
        'spin-bg': 'spin-bg var(--spin-duration, 20s) linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
