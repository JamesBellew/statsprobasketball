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
        "card-bg": "#1a1f2d",
        "secondary-bg": "#161a1f",
        "primary-cta": "#6366F1 ",
        "secondary-cta": "#10B981",
        "primary-danger": "#9333EA",
        "primary-danger-light": "#A78BFA",
        "secondary-danger": "#DC143C",
      },
    },
  },

  // ✅ Put daisyui config OUTSIDE `theme`
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#0d6efd",
          secondary: "#6c757d",
          accent: "#661ae6",
          neutral: "#3d4451",
          "base-100": "#1e1e1e",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
    ],
  },

  plugins: [daisyui],
};
