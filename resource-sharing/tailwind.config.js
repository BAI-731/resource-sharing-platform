/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2ECC71",
          dark: "#27AE60",
          light: "#1ABC9C",
        },
        background: {
          DEFAULT: "#F8FAF9",
          card: "#FFFFFF",
        },
        text: {
          primary: "#2C3E50",
          secondary: "#5D6D7E",
          muted: "#7F8C8D",
        },
        functional: {
          success: "#27AE60",
          danger: "#E74C3C",
          warning: "#F39C12",
          info: "#3498DB",
        }
      },
      fontFamily: {
        sans: ["PingFang SC", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
