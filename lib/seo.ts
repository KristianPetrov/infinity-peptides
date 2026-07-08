// Shared SEO constants for infinity-peptides.com.

export const SITE_URL = "https://infinity-peptides.com";
export const SITE_NAME = "Infinity Peptides";

export const SITE_TITLE = "Infinity Peptides | Research Peptide Catalog";

export const SITE_DESCRIPTION =
  "Premium Research Use Only peptide catalog for qualified laboratory research teams. HPLC/MS-verified reference compounds, clear USD pricing, and compliance-first design.";

export const OG_SIZE = { width: 1200, height: 630 } as const;

export const BRAND = {
  background: "#04060c",
  foreground: "#f4f7fc",
  muted: "#aab4c4",
  magenta: "#f450b9",
  violet: "#8b65ff",
  cyan: "#4ee7f2",
} as const;

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}
