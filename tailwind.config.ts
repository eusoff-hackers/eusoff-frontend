import type { Config } from "tailwindcss";

/**
 * Eusoff jersey bidding — "abyssal teal" design tokens (Auros-inspired).
 * Depth comes from surface steps, never from shadows: canvas → recessed (inset wells) → raised (cards).
 * Lavender is reserved for big statistics; the aurora gradient for the single primary CTA per view.
 */
const config = {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // Surfaces
        canvas: "#012624",
        recessed: "#011d1c",
        raised: "#003734",
        low: "#707777",
        hairline: "rgba(255, 255, 255, 0.09)",
        // Text
        silver: "#bbc7c6",
        mist: "#edfffe",
        // Accent (big numbers only)
        lavender: "#fde9ff",
        // Status (legible on every surface, AA)
        aqua: "#5eead4",
        warn: "#e8c48a",
        danger: "#f5a3b5",
        // Chart series (validated categorical set on #003734)
        viz: { 1: "#1aa596", 2: "#b06fcf", 3: "#c08232" },

        // shadcn semantic names, mapped onto the system
        border: "rgba(255, 255, 255, 0.09)",
        input: "rgba(255, 255, 255, 0.14)",
        ring: "#5eead4",
        background: "#012624",
        foreground: "#bbc7c6",
        primary: { DEFAULT: "#edfffe", foreground: "#012624" },
        secondary: { DEFAULT: "#003734", foreground: "#edfffe" },
        destructive: { DEFAULT: "#f5a3b5", foreground: "#012624" },
        muted: { DEFAULT: "#011d1c", foreground: "#93a19f" },
        accent: { DEFAULT: "rgba(255, 255, 255, 0.06)", foreground: "#ffffff" },
        popover: { DEFAULT: "#003734", foreground: "#bbc7c6" },
        card: { DEFAULT: "#003734", foreground: "#bbc7c6" },
      },
      backgroundImage: {
        aurora: "linear-gradient(90deg, #cbfffc 0%, #edfffe 26%, #fffdfa 48%, #fad1ff 89%)",
        biolum: "linear-gradient(90deg, #00827c, #cbfffc)",
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
      // No elevation shadows anywhere in the system: depth is expressed with surface steps.
      boxShadow: {
        sm: "none",
        DEFAULT: "none",
        md: "none",
        lg: "none",
        xl: "none",
        "2xl": "none",
      },
      letterSpacing: {
        display: "-0.035em",
        heading: "-0.02em",
        eyebrow: "0.14em",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.2, 0, 0, 1)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 220ms cubic-bezier(0.2, 0, 0, 1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
