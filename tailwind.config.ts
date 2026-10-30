import type { Config } from "tailwindcss";

export default {
  content: ["./index-react.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "green-deep": "#101A17",
        "green-secondary": "#263D33",
        gold: "#D8B76E",
        "gold-light": "#F0CC7C",
        ivory: "#F5F1E8",
      },
      fontFamily: {
        title: ['"Manrope"', "system-ui", "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-grad": "linear-gradient(135deg, #F0CC7C 0%, #D8B76E 55%, #b9975a 100%)",
      },
      boxShadow: {
        gold: "0 8px 26px rgba(216,183,110,0.28)",
        soft: "0 10px 30px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
} satisfies Config;
