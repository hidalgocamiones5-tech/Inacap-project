/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gob: {
          blue: {
            light: '#e6f0fa',
            DEFAULT: '#003399', // Institucional chileno / gubernamental
            dark: '#002266',
          },
          gray: {
            light: '#f5f5f5',
            DEFAULT: '#4d4d4d',
            dark: '#333333',
          }
        }
      }
    },
  },
  plugins: [],
}
