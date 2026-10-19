import { chromium } from "playwright";
import type { PageFetchResult } from "./fetch-static-page-html.service.js";

// It opens the page like a real browser:
// Then it visits the page:
// Then it waits a bit for JavaScript content to load:
export async function fetchRenderedPageHtml(
  url: string
): Promise<PageFetchResult> {
  let browser;

  try {
    // Launch a headless browser instance. Playwright will automatically
    // download the necessary browser binaries on first run.
    browser = await chromium.launch({
      headless: true,
    });

    // Create a new browser context with a custom user agent to identify our scraper.
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (compatible; joborg-bot/1.0; +https://joborg.app)",
      javaScriptEnabled: true,
    });

    // Open a new page in the browser context.
    const page = await context.newPage();

    // Speed up rendering by blocking heavy assets.
    await page.route("**/*", async (route) => {
      const resourceType = route.request().resourceType();

      if (["image", "media", "font"].includes(resourceType)) {
        return route.abort();
      }

      return route.continue();
    });

    // Navigate to the target URL and wait for the initial HTML to load.
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    const statusCode = response?.status();

    if (!response || !response.ok()) {
      return {
        success: false,
        statusCode,
        error: `Failed to render page. Status code: ${statusCode}`,
        scraperUsed: "BROWSER",
      };
    }

    // Some job boards load listings after the initial document loads.
    await page.waitForLoadState("networkidle", {
      timeout: 10000,
    }).catch(() => {
      // Do not fail completely if networkidle times out.
      // Some sites keep background requests open.
    });

    await page.waitForTimeout(2000);

    // Extract the rendered HTML content of the page.
    // We also check if the content is empty or only whitespace,
    const html = await page.content();

    if (!html || html.trim().length === 0) {
      return {
        success: false,
        statusCode,
        error: "Rendered page returned empty HTML content.",
        scraperUsed: "BROWSER",
      };
    }

    return {
      success: true,
      html,
      statusCode,
      scraperUsed: "BROWSER",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Unable to render page with Playwright.",
      scraperUsed: "BROWSER",
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}