import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-bg": "#16181A",
        "secondary-bg": "#1F2122",
        "primary-cta": "#04B075",
        "secondary-cta": "#207DFA",
        "primary-danger": "#FC4938",
      },
    },
  },
  plugins: [daisyui], // ✅ Use imported module
};
