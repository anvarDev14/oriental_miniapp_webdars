/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        telegram: {
          bg: '#FFFFFF',
          text: '#000000',
          hint: '#999999',
          link: '#2AABEE',
          button: '#2AABEE',
          'button-text': '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
}
