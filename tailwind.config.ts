import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-bg)",
        surface: "var(--color-surface)",
        elevated: "var(--color-elevated)",
        primary: {
          DEFAULT: "#E040A0",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#29B6F6",
          foreground: "#FFFFFF",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
        },
        border: "var(--color-border)",
        success: "#4CAF50",
        error: "#F44336",
      },
      fontFamily: {
        poppins: ["var(--font-poppins)"],
        inter: ["var(--font-inter)"],
        lora: ["var(--font-lora)"],
      },
      boxShadow: {
        card: "0 4px 20px rgba(0,0,0,0.4)",
        "glow-pink": "0 0 20px rgba(224,64,160,0.4)",
        "glow-pink-lg": "0 0 40px rgba(224,64,160,0.3), 0 0 80px rgba(224,64,160,0.1)",
        "glow-blue": "0 0 20px rgba(41,182,246,0.2)",
      },
      borderRadius: {
        lg: "16px",
        md: "10px",
        sm: "8px",
        pill: "999px",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        wispMove: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -20px) scale(1.05)" },
          "66%": { transform: "translate(-20px, 15px) scale(0.98)" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s infinite linear",
        "fade-up": "fadeUp 0.6s ease forwards",
        "wisp-1": "wispMove 12s ease-in-out infinite",
        "wisp-2": "wispMove 16s ease-in-out infinite reverse",
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(ellipse at 50% 100%, rgba(224,64,160,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(41,182,246,0.05) 0%, transparent 50%)",
      },
    },
  },
  plugins: [],
};
export default config;
