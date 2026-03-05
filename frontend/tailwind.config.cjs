/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#22c55e",
          soft: "#4ade80",
        },
      },
      boxShadow: {
        "soft-card": "0 18px 45px rgba(15,23,42,0.6)",
      },
    },
  },
  plugins: [],
};

