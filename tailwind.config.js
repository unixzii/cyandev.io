/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "reveal-highlight": "#fff",
        caret: "#1ccdff",
      },
      animation: {
        "smooth-blink": "smoothBlink 1s linear infinite",
      },
      keyframes: {
        smoothBlink: {
          "0%, 40%, 100%": { opacity: 1 },
          "55%, 90%": { opacity: 0 },
        },
      },
    },
  },
  plugins: [],
};
