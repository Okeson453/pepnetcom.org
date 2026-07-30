import type { Config } from "tailwindcss";

/**
 * Tailwind v4 is CSS-first: the brand color palette, font families, and the
 * default border radius are declared in `styles/globals.css` via `@theme`
 * (sourced from the CSS custom properties in `styles/tokens.css`), not here.
 * This file is kept only for the explicit `content` globs — v4's automatic
 * content detection is reliable for a standard Next.js layout, but the globs
 * are left in place in case any future non-standard source directory is
 * added outside `app/`, `components/`, or `features/`.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
