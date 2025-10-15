/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // scanne tout ton projet React/Vite
  ],
  theme: {
    extend: {
      // 🎨 Palette optionnelle pour garder une cohérence graphique
      colors: {
        niche: {
          pink: "#FF0054",
          blue: "#0096FF",
          green: "#00C49A",
          yellow: "#FFB800",
          purple: "#C83CB9",
          dark: "#0a0a0a",
        },
      },

      // ✨ Animations personnalisées
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-scale": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "fade-loop": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },

      // 🌀 Animations utilisables dans tes classes Tailwind
      animation: {
        "fade-in": "fade-in 1.2s ease-out forwards",
        "fade-in-up": "fade-in-up 1.4s ease-out forwards",
        "fade-in-scale": "fade-in-scale 1.3s ease-out forwards",
        "fade-loop": "fade-loop 3s ease-in-out infinite",
      },

      // 📐 Fonts personnalisées (optionnel mais utile pour l’identité visuelle)
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Oswald", "sans-serif"],
      },
    },
  },
  plugins: [],
};
