/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      width: {
        15: "3.75rem",
      },
      height: {
        21: "5.25rem",
      },
      borderWidth: {
        3: "3px",
      },
    },
  },
  plugins: [],
}
