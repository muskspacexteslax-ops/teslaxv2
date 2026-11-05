/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#000000",
        "ink-2": "#07080a",
        surface: "#0c0d0f",
        "surface-2": "#121316",
        line: "rgba(255, 255, 255, 0.09)",
        "line-strong": "rgba(255, 255, 255, 0.18)",
        accent: "#e82127",
        "accent-soft": "rgba(232, 33, 39, 0.12)",
        ok: "#34d399",
        warn: "#fbbf24",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-mono)", "SF Mono", "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
