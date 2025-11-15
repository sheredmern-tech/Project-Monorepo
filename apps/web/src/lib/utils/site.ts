// ============================================================================
// FILE: lib/config/site.ts
// ============================================================================
export const siteConfig = {
  name: "Law Firm Management",
  description: "Sistem manajemen firma hukum yang profesional dan terintegrasi",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  links: {
    github: "https://github.com",
    docs: "/docs",
  },
};