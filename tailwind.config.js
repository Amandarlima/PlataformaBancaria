/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bank: {
          50: "#ecf7ff",
          100: "#d3edff",
          500: "#0066b3",
          700: "#004a82",
          900: "#0b2437"
        }
      }
    }
  },
  plugins: []
};
