/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        rpg: {
          dark: "#0A0A0A", // Fondo principal (Negro profundo)
          card: "#171717", // Fondo de tarjetas (Gris muy oscuro)
          "card-hover": "#262626", // Hover de tarjetas
          light: "#E5E5E5", // Texto principal (Casi blanco)
          muted: "#A3A3A3", // Texto secundario (Gris claro)
          accent: "#10B981", // Verde Esmeralda Brillante (Primary)
          "accent-hover": "#059669",
          secondary: "#6366F1", // Indigo/Morado (Secondary)
          "secondary-hover": "#4F46E5",
          danger: "#EF4444",
          warning: "#F59E0B",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Cinzel Decorative', 'cursive'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}