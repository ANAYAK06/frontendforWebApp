/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        "blue":"#3f51b5",
        "light-white":"#fff"
      }
    },
  },
  plugins: [],
}

