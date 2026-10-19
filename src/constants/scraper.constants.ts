export const SCRAPER_TYPE = {
  AUTO: "AUTO",
  STATIC: "STATIC",
  BROWSER: "BROWSER",
} as const;

export type ScraperType = (typeof SCRAPER_TYPE)[keyof typeof SCRAPER_TYPE];
