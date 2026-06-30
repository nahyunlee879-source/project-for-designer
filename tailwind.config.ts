import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#f7f1e8",
        paper: "#fbf8f1",
        ink: "#262522",
        graphite: "#5f5c55",
        fog: "#e6e4de",
        mist: "#f1f2f0",
        silver: "#b9bcc2",
        blue: "#aebfd4",
        powder: "#dfe8f1",
        cherry: "#a9232d",
      },
      boxShadow: {
        editorial: "0 22px 70px rgba(47, 45, 39, 0.08)",
        insetline: "inset 0 1px 0 rgba(255, 255, 255, 0.75)",
        surface:
          "inset 0 1px 0 rgba(255, 255, 255, 0.75), 0 22px 70px rgba(47, 45, 39, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
