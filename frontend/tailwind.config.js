/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // VectorShift-inspired dark palette
        canvas: '#0b1120',
        surface: '#0f1729',
        panel: '#1c2536',
        panelHover: '#243049',
        border: '#2b3650',
        muted: '#8a95ad',
        // Primary brand accent
        accent: {
          DEFAULT: '#6366f1',
          hover: '#818cf8',
        },
        // Per-category node accents
        node: {
          input: '#34d399',   // emerald
          output: '#f472b6',  // pink
          llm: '#a78bfa',     // violet
          text: '#38bdf8',    // sky
          math: '#fbbf24',    // amber
          api: '#22d3ee',     // cyan
          filter: '#fb923c',  // orange
          note: '#facc15',    // yellow
          timer: '#f87171',   // red
        },
      },
      boxShadow: {
        node: '0 4px 16px rgba(0, 0, 0, 0.45)',
        nodeHover: '0 8px 28px rgba(0, 0, 0, 0.55)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
