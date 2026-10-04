import type { Config } from "tailwindcss";

/**
 * Eusoff jersey bidding design tokens: the hall's original login colourway (sunflower > apricot > coral,
 * green primary, crest maroon and gold), light by default with a warm dark alternate.
 * White cards on a warm canvas with a soft card shadow (CSS var). "lavender" is the big-stat accent
 * (maroon/gold); "brand-green" is the single primary action per view.
 */
/** Theme-aware colour from an RGB-triplet CSS variable, with Tailwind alpha support. */
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

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
        // Every colour resolves through a theme variable (see globals.css), so one class works in both themes.
        canvas: v("canvas"),
        recessed: v("recessed"),
        raised: v("raised"),
        field: v("field"),
        low: v("low"),
        ink: v("ink"),
        hairline: "rgb(var(--ink) / 0.1)",
        heading: v("heading"),
        silver: v("silver"),
        mist: v("mist"),
        faint: v("faint"),
        lavender: { DEFAULT: v("lavender"), fill: v("lavender-fill") },
        "on-accent": v("on-accent"),
        aqua: v("aqua"),
        "brand-green": v("primary"),
        "on-primary": v("on-primary"),
        gold: v("gold"),
        "band-ink": v("band-ink"),
        warn: v("warn"),
        danger: v("danger"),
        viz: { 1: v("viz-1"), 2: v("viz-2"), 3: v("viz-3") },
        "seq-on-lo": v("seq-on-lo"),
        "seq-on-hi": v("seq-on-hi"),
        scrim: "rgb(var(--scrim))",

        // shadcn semantic names, mapped onto the system
        border: "rgb(var(--ink) / 0.1)",
        input: "rgb(var(--ink) / 0.14)",
        ring: v("aqua"),
        background: v("canvas"),
        foreground: v("silver"),
        primary: { DEFAULT: v("mist"), foreground: v("canvas") },
        secondary: { DEFAULT: v("raised"), foreground: v("mist") },
        destructive: { DEFAULT: v("danger"), foreground: v("canvas") },
        muted: { DEFAULT: v("recessed"), foreground: v("faint") },
        accent: { DEFAULT: "rgb(var(--ink) / 0.06)", foreground: v("heading") },
        popover: { DEFAULT: v("raised"), foreground: v("silver") },
        card: { DEFAULT: v("raised"), foreground: v("silver") },
      },
      backgroundImage: {
        aurora: "var(--aurora)",
        brand: "var(--brand)",
        biolum: "var(--biolum)",
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
      // Tailwind shadow utilities are disabled; elevation comes from the themed --card-shadow / --pop-shadow vars.
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
