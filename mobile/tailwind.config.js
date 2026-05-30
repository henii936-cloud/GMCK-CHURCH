/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#002c53",
        "primary-light": "#1a4a7a",
        accent: "#e8a020",
        surface: "#f8f9fa",
        "surface-card": "#ffffff",
        "on-primary": "#ffffff",
        "on-surface": "#1a1a2e",
        "on-surface-variant": "#6b7280",
        emerald: {
          500: "#10b981",
          600: "#059669",
        },
        amber: {
          500: "#f59e0b",
          600: "#d97706",
        },
        red: {
          500: "#ef4444",
          600: "#dc2626",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
