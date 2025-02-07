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
        "secondary-bg":"#1F2122",
        "primary-cta":"#04B075",
        "primary-danger":"#FC4938",
      },
    },
  },
  plugins: [],
}
