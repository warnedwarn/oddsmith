import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#081020',
          950: '#060b16',
          900: '#081020',
          800: '#0c1626',
          700: '#122036',
          600: '#1b2c46',
        },
        ink: '#cdd9ec',
        slatey: '#7f93b0',
        faint: '#54657f',
        cyan: {
          DEFAULT: '#39d3ff',
          bright: '#7fe6ff',
          deep: '#1796c4',
        },
        yes: '#37e0a6',
        no: '#ff5d73',
        invalid: '#f5b53d',
      },
      fontFamily: {
        display: ['var(--font-chakra)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      backgroundImage: {
        blueprint:
          'linear-gradient(rgba(57,211,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(57,211,255,0.07) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '28px 28px',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        dash: {
          to: { strokeDashoffset: '-100' },
        },
        riseup: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulsechip: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        flashframe: {
          '0%': { borderColor: '#37e0a6', boxShadow: '0 0 0 0 rgba(55,224,166,0.5)' },
          '100%': { borderColor: '#1b2c46', boxShadow: '0 0 0 14px rgba(55,224,166,0)' },
        },
      },
      animation: {
        sweep: 'sweep 6s linear infinite',
        dash: 'dash 1.2s linear infinite',
        riseup: 'riseup 0.5s ease-out forwards',
        pulsechip: 'pulsechip 1.5s ease-in-out infinite',
        flashframe: 'flashframe 1.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
