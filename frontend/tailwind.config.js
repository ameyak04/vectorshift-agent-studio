/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Blueprint ink surfaces (darkest -> lightest)
        ink: '#0a0e14',
        surface: '#0c121c',
        panel: '#0e1724',
        elevated: '#122033',
        hover: '#16263b',
        // Cyan-tinted hairline borders
        line: '#1b2a3d',
        linebright: '#284157',
        // Text
        paper: '#dbe7f2',
        muted: '#7e8ca3',
        faint: '#516074',
        // Primary = blueprint cyan, Action = amber
        cyan: {
          DEFAULT: '#22d3ee',
          deep: '#0e7490',
          dim: '#155e6b',
        },
        amber: {
          DEFAULT: '#f5a524',
          deep: '#b45309',
        },
        // Category accents (colored signal wires)
        node: {
          input: '#34d399',
          output: '#f472b6',
          llm: '#a78bfa',
          text: '#22d3ee',
          math: '#fbbf24',
          api: '#38bdf8',
          filter: '#fb923c',
          note: '#facc15',
          timer: '#f87171',
        },
        ok: '#34d399',
        warn: '#f5a524',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        display: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.04em' }],
        xs: ['0.75rem', { lineHeight: '1.1rem', letterSpacing: '0.02em' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
        base: ['0.875rem', { lineHeight: '1.4rem' }],
        lg: ['1rem', { lineHeight: '1.5rem' }],
        xl: ['1.25rem', { lineHeight: '1.6rem', letterSpacing: '0.01em' }],
      },
      boxShadow: {
        node: '0 6px 20px -8px rgba(0, 0, 0, 0.7)',
        nodeHover: '0 10px 28px -8px rgba(0, 0, 0, 0.8)',
        glow: '0 0 0 1px rgba(34,211,238,0.5), 0 0 22px -4px rgba(34,211,238,0.45)',
        action: '0 2px 14px -2px rgba(245,165,36,0.5)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.3s ease-out both',
        floaty: 'floaty 4s ease-in-out infinite',
        blink: 'blink 1.1s step-end infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
