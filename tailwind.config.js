function createGlitchBlinkKeyframes(passive) {
  return {
    "0%, 30%, 34%, 40%, 44%, 65%": { opacity: 0 },
    "70%, 95%": { opacity: passive ? 0.05 : 0.1 },
    "33%, 43%, 100%": {
      opacity: 1,
      ...(passive
        ? {}
        : {
            textShadow: "0px 1px 20px rgb(255 255 255 / 69%)",
          }),
    },
  };
}

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
        background: "#000",
        foreground: "#fff",
        border: "rgba(255, 255, 255, 0.15)",
        "reveal-highlight": "#fff",
        caret: "#1ccdff",
      },
      animation: {
        "smooth-blink": "smoothBlink 1s linear infinite",
        "glitch-blink": "glitchBlink 2s linear both",
        "glitch-blink-passive": "glitchBlinkPassive 2s linear both",
      },
      keyframes: {
        smoothBlink: {
          "0%, 40%, 100%": { opacity: 1 },
          "55%, 90%": { opacity: 0 },
        },
        glitchBlink: createGlitchBlinkKeyframes(false),
        glitchBlinkPassive: createGlitchBlinkKeyframes(true),
      },
    },
  },
  plugins: [],
};
