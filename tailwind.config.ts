import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-spectral)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        canvas: "#06080d",
        surface: "#0d1119",
        raised: "#131b26",
        edge: "#1c2838",
        "edge-light": "#263345",
        gold: "#b8975a",
        "gold-muted": "rgba(184,151,90,0.12)",
        "gold-border": "rgba(184,151,90,0.22)",
        vermillion: "#c94a2e",
        "data-teal": "#3eb89a",
        ink: "#e4dfd6",
        "ink-dim": "#7a8ba8",
        "ink-muted": "#3b4d66",
        // legacy compatibility
        base: "#06080d",
        card: "#0d1119",
        border: "#1c2838",
        "border-light": "#263345",
        accent: "#b8975a",
        "accent-hover": "#c9a96b",
        success: "#2d9e74",
        warning: "#c08b2a",
        danger: "#c94a2e",
        "text-primary": "#e4dfd6",
        "text-secondary": "#7a8ba8",
        "text-muted": "#3b4d66",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out both",
        "slide-up": "slideUp 0.4s ease-out both",
        "slide-in": "slideIn 0.3s ease-out both",
        "scan": "scan 8s linear infinite",
        "blink": "blink 1.2s step-end infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-8px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
}

export default config
