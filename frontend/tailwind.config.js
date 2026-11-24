/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif-title': ['Playfair Display', 'Georgia', 'serif'],
        'mono-tech': ['Space Grotesk', 'monospace', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
