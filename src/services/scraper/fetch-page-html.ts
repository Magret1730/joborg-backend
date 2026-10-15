import {
  SCRAPER_TYPE,
  type ScraperType,
} from "../../constants/scraper.constants.js";
import {
  fetchStaticPageHtml,
  type PageFetchResult,
} from "./fetch-static-page-html.service.js";
import { fetchRenderedPageHtml } from "./fetch-rendered-page-html.js";
import { shouldUseBrowserRendering } from "./should-use-browser-rendering.js";

export async function fetchPageHtml(
  url: string,
  scraperType: ScraperType = SCRAPER_TYPE.AUTO
): Promise<PageFetchResult> {
  if (scraperType === SCRAPER_TYPE.STATIC) {
    return fetchStaticPageHtml(url);
  }

  if (scraperType === SCRAPER_TYPE.BROWSER) {
    return fetchRenderedPageHtml(url);
  }

  // AUTO mode:
  // Try normal fetch first.
  const staticResult = await fetchStaticPageHtml(url);

  // If static fetch is blocked, try Playwright.
  // Some sites block server-side fetch() but allow real browser rendering.
  const shouldRetryWithBrowserBecauseBlocked =
    !staticResult.success &&
    [401, 403, 429].includes(staticResult.statusCode || 0);

  if (shouldRetryWithBrowserBecauseBlocked) {
    console.log(
      `[SCRAPER] Static fetch blocked with ${staticResult.statusCode}. Retrying with Playwright: ${url}`
    );

    return fetchRenderedPageHtml(url);
  }

  if (!staticResult.success || !staticResult.html) {
    return staticResult;
  }

  const needsBrowser = shouldUseBrowserRendering(staticResult.html);

  if (!needsBrowser) {
    return staticResult;
  }

  console.log(
    `[SCRAPER] ${url} appears to need JavaScript rendering. Retrying with Playwright.`
  );

  return fetchRenderedPageHtml(url);
}


// Problems Encountered
// Some websites block server-side fetch() requests, returning 403 Forbidden or 429 Too Many Requests.
// In these cases, we should automatically retry with Playwright to see if we can get the content.

// But some job pages have problems:

// Problem	Example	Why your old fetch fails
// JavaScript-rendered page	https://technl.ca/job-seekers/	Jobs are loaded after JavaScript runs
// Server blocks bot request	https://jobs.techtalent.ca/	Site returns 403 Forbidden
// Static page	Normal career page	Your old fetch works fine

// So the goal of the change is:

// Try normal fetch first, but use Playwright when normal fetch is not enough.