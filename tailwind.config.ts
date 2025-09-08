import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        // Eco-specific color variables
        "eco-background": "var(--eco-background)",
        "eco-foreground": "var(--eco-foreground)",
        "eco-card": "var(--eco-card)",
        "eco-card-foreground": "var(--eco-card-foreground)",
        "eco-popover": "var(--eco-popover)",
        "eco-popover-foreground": "var(--eco-popover-foreground)",
        "eco-primary": "var(--eco-primary)",
        "eco-primary-foreground": "var(--eco-primary-foreground)",
        "eco-secondary": "var(--eco-secondary)",
        "eco-secondary-foreground": "var(--eco-secondary-foreground)",
        "eco-muted": "var(--eco-muted)",
        "eco-muted-foreground": "var(--eco-muted-foreground)",
        "eco-accent": "var(--eco-accent)",
        "eco-accent-foreground": "var(--eco-accent-foreground)",
        "eco-destructive": "var(--eco-destructive)",
        "eco-destructive-foreground": "var(--eco-destructive-foreground)",
        "eco-border": "var(--eco-border)",
        "eco-input": "var(--eco-input)",
        "eco-ring": "var(--eco-ring)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideInUp: {
          from: { 
            transform: "translateY(100%)",
            opacity: "0"
          },
          to: { 
            transform: "translateY(0)",
            opacity: "1"
          },
        },
        slideInDown: {
          from: { 
            transform: "translateY(-100%)",
            opacity: "0"
          },
          to: { 
            transform: "translateY(0)",
            opacity: "1"
          },
        },
        scaleIn: {
          from: { 
            transform: "scale(0.95)",
            opacity: "0"
          },
          to: { 
            transform: "scale(1)",
            opacity: "1"
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: "fadeIn 0.5s ease-out",
        slideInUp: "slideInUp 0.3s ease-out",
        slideInDown: "slideInDown 0.3s ease-out",
        scaleIn: "scaleIn 0.2s ease-out",
      },
      boxShadow: {
        "2xs": "var(--shadow-2xs)",
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
