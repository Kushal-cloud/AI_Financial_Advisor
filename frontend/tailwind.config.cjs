/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#22c55e",
          soft: "#4ade80",
          glow: "rgba(52, 211, 153, 0.4)",
        },
      },
      boxShadow: {
        "soft-card": "0 18px 45px rgba(15,23,42,0.6)",
        "glass": "0 8px 32px rgba(0,0,0,0.24)",
        "glow-sm": "0 0 20px rgba(52, 211, 153, 0.15)",
        "glow": "0 0 40px rgba(52, 211, 153, 0.2)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.35s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

