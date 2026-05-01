/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./context/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#16A34A",
        "primary-light": "#DCFCE7",
        "primary-dark": "#15803D",
        danger: "#DC2626",
        "danger-light": "#FEE2E2",
        warning: "#D97706",
        "warning-light": "#FEF3C7",
      },
    },
  },
  plugins: [],
};
