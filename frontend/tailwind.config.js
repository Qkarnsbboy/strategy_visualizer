/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Trading-desk dark surfaces
        bg: "#0a0a0b", // app background (near-black)
        panel: "#141417", // panel surface
        "panel-soft": "#1c1c21", // nested rows / inputs
        line: "#2a2a31", // borders / grid
        // Bloomberg amber accent
        accent: {
          DEFAULT: "#ffae00",
          soft: "#ffce5c",
          dim: "#7a5400",
        },
        // P&L semantics
        profit: "#22c55e",
        loss: "#f43f5e",
        // Text
        ink: "#e7e7ea", // primary text
        "ink-dim": "#9a9aa3", // secondary text
        "ink-faint": "#62626b", // labels / hints
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
