import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#132238",
        cloud: "#f5f7fb",
        mint: "#1e9b82",
      },
    },
  },
  plugins: [],
};

export default config;
