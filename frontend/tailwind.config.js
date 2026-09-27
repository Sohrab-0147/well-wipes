/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        logo: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      colors: {
        paper: '#ffffff',
        slate: { tint: '#f8fafc', soft: '#f1f5f9' },
        line: '#e2e8f0',
        'line-strong': '#cbd5e1',
        ink: { DEFAULT: '#0a1628', soft: '#475569', mute: '#94a3b8' },
        sky: { DEFAULT: '#0284c7', dark: '#0369a1', deep: '#075985', light: '#38bdf8', soft: '#bae6fd', tint: '#e0f2fe' },
        mint: { DEFAULT: '#5eead4', dark: '#14b8a6', tint: '#f0fdfa' },
        clay: { DEFAULT: '#c96f4a', dark: '#a85532', tint: '#fbf0ea' },
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],
      },
      letterSpacing: { tightest: '-0.035em' },
      boxShadow: {
        whisper: '0 1px 2px rgba(10,22,40,0.03)',
        soft: '0 1px 2px rgba(10,22,40,0.04), 0 4px 16px rgba(10,22,40,0.05)',
        lift: '0 2px 4px rgba(10,22,40,0.05), 0 16px 40px rgba(10,22,40,0.08)',
        'glow-sm': '0 1px 2px rgba(2,132,199,0.15), 0 4px 12px rgba(2,132,199,0.20), 0 10px 32px rgba(2,132,199,0.12)',
        glow: '0 1px 2px rgba(2,132,199,0.18), 0 6px 20px rgba(2,132,199,0.28), 0 16px 48px rgba(2,132,199,0.18)',
        'glow-lg': '0 2px 4px rgba(2,132,199,0.20), 0 10px 30px rgba(2,132,199,0.38), 0 24px 64px rgba(2,132,199,0.22)',
        'glow-clay': '0 1px 2px rgba(201,111,74,0.15), 0 6px 20px rgba(201,111,74,0.25), 0 16px 48px rgba(201,111,74,0.15)',
      },
      borderRadius: { '4xl': '2rem', '5xl': '2.5rem' },
      maxWidth: { page: '1240px' },
      transitionTimingFunction: { smooth: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    },
  },
  plugins: [],
};
