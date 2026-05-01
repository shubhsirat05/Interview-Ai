/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'Nunito'", "sans-serif"],
        mono: ["'Fira Code'", "monospace"],
      },
      colors: {
        void: "#080b12",
        surface: "#0e1420",
        card: "#141b2d",
        border: "#1e2d4a",
        electric: "#00d4ff",
        neon: "#39ff8f",
        amber: "#ffb547",
        danger: "#ff4d6d",
        muted: "#4a5980",
        soft: "#8899bb",
      },
      animation: {
        "pulse-slow": "pulse 3s infinite",
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.5s ease forwards",
        wave: "wave 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        wave: {
          "0%, 100%": { transform: "scaleY(0.5)" },
          "50%": { transform: "scaleY(1.5)" },
        },
      },
    },
  },
  plugins: [],
};