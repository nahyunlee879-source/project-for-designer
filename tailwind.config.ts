import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#f7f1e8",
        ink: "#262522",
        fog: "#e6e4de",
        mist: "#f1f2f0",
        silver: "#b9bcc2",
        blue: "#aebfd4",
        cherry: "#a9232d",
      },
      boxShadow: {
        editorial: "0 18px 50px rgba(42, 41, 37, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
