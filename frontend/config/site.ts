/** Site-wide constants used across metadata, footer, and marketing pages. */
export const siteConfig = {
  name: "PEPNETCOM",
  tagline: "The network for SIWES, academics, trading, and growth.",
  description:
    "PEPNETCOM is a multi-service platform for SIWES report writing, academic services, education consulting, trade strategies, PEPNETCOM Signals, and digital marketing.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/og-image.png",
  links: {
    twitter: "https://twitter.com/pepnetcom",
    instagram: "https://instagram.com/pepnetcom",
  },
  contactEmail: "support@pepnetcom.com",
} as const;
