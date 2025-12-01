/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "calc(var(--radius) - 4px)",
        lg: "calc(var(--radius) + 4px)",
        xl: "calc(var(--radius) + 8px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",

        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",

        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",

        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",

        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",

        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",

        destructive: "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",

        border: "var(--border)",
        ring: "var(--ring)",

        // Chart
        "chart-1": "var(--chart-1)",
        "chart-2": "var(--chart-2)",
        "chart-3": "var(--chart-3)",
        "chart-4": "var(--chart-4)",
        "chart-5": "var(--chart-5)",

        // Sidebar
        sidebar: "var(--sidebar)",
        "sidebar-foreground": "var(--sidebar-foreground)",
        "sidebar-primary": "var(--sidebar-primary)",
        "sidebar-primary-foreground": "var(--sidebar-primary-foreground)",
        "sidebar-accent": "var(--sidebar-accent)",
        "sidebar-accent-foreground": "var(--sidebar-accent-foreground)",
        "sidebar-border": "var(--sidebar-border)",
        "sidebar-ring": "var(--sidebar-ring)",

        // Neon Theme Colors
        "neon-cyan": "var(--neon-cyan)",
        "neon-magenta": "var(--neon-magenta)",
        "neon-purple": "var(--neon-purple)",
        "neon-green": "var(--neon-green)",
        "neon-pink": "var(--neon-pink)",
      },

      boxShadow: {
        neon: "0 0 10px var(--neon-cyan), 0 0 40px var(--neon-cyan)",
        "neon-magenta": "0 0 10px var(--neon-magenta), 0 0 40px var(--neon-magenta)",
        "neon-purple": "0 0 10px var(--neon-purple), 0 0 40px var(--neon-purple)",
        "neon-green": "0 0 10px var(--neon-green), 0 0 40px var(--neon-green)",
        "neon-pink": "0 0 10px var(--neon-pink), 0 0 40px var(--neon-pink)",
      },

      fontWeight: {
        normal: "var(--font-weight-normal)",
        medium: "var(--font-weight-medium)",
      },
    },
  },
  plugins: [],
};
