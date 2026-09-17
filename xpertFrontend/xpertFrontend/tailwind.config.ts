import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: "var(--color-sidebar)",
        primary: "var(--color-primary)",
        danger: "var(--color-danger)",
        "danger-10": "var(--color-danger-10)",
        "white-10": "var(--color-white-10)",
        "white-18": "var(--color-white-18)",
        "white-26": "var(--color-white-26)",
        "text-main": "var(--color-text-main)",
        "text-muted": "var(--color-text-muted)",
        "text-light": "var(--color-text-light)",
        "bg-main": "var(--color-bg-main)",
        "bg-card": "var(--color-bg-card)",
        "border-light": "var(--color-border-light)",
        "border-lighter": "var(--color-border-lighter)",
        "border-dark": "var(--color-border-dark)",
      },
    },
  },
  plugins: [],
};
export default config;
