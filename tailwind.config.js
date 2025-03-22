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
        "primary-bg": "#12131A",
        
        "secondary-bg": "#161a1f",
        "primary-cta": "#0b63fb",
        "secondary-cta": "#10B981",
        
        "primary-danger": "#8B5CF6",
        "secondary-danger": "#DC143C",
      },
    },
  },
  plugins: [daisyui], // ✅ Use imported module
};
