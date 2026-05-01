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
        primary: "#C8EF2F",
        "primary-light": "#F0FAC0",
        "primary-dark": "#A8CC1A",
        danger: "#E8513A",
        "danger-light": "#FDECEA",
        warning: "#F59E0B",
        "warning-light": "#FEF3C7",
      },
      fontFamily: {
        unbounded: ["Unbounded_700Bold"],
        "unbounded-medium": ["Unbounded_500Medium"],
        "unbounded-regular": ["Unbounded_400Regular"],
      },
    },
  },
  plugins: [],
};
