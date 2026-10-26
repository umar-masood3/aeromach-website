import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aerospace: {
          950: "#07090E",
          900: "#0D111A",
          850: "#121824",
          800: "#1A2234",
          700: "#2A364F",
          600: "#3F5175",
          400: "#7E95BC",
          300: "#A9BAD5",
          200: "#D3DDEB",
          100: "#EDF2F8",
          50: "#F6F8FB",
        },
        titanium: {
          DEFAULT: "#8B95A5",
          dark: "#4B5563",
          light: "#E2E8F0",
        },
        afterburner: {
          DEFAULT: "#FF5E1E",
          hover: "#E0480C",
          glow: "#FFA07A",
        },
        avionics: {
          cyan: "#00E5FF",
          blue: "#0284C7",
          amber: "#FFB300",
          green: "#00E676",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      backgroundImage: {
        "grid-pattern": "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
        "grid-pattern-light": "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
      },
      letterSpacing: {
        widest: "0.2em",
        technical: "0.15em",
      },
    },
  },
  plugins: [],
};
export default config;
