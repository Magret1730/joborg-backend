import { SCRAPER_TYPE } from "../../constants/scraper.constants.js";

export type PageFetchResult = {
    success: boolean;
    html?: string;
    statusCode?: number;
    error?: string;
    scraperUsed?: typeof SCRAPER_TYPE[keyof typeof SCRAPER_TYPE];
  };

// Fetches the STATIC HTML content of a page given its URL.
// It is good for pages where the HTML already contains the jobs.
// It includes error handling for various scenarios such as timeouts,
// non-HTML content, and empty responses. The function returns a structured
// result indicating success or failure along with relevant details.
export async function fetchStaticPageHtml(url: string): Promise<PageFetchResult> {
  // Sets up an abort controller to handle timeouts
	// because some websites may hang or take too long to respond.
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000); // 10 seconds

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-CA,en-US;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        error: `Failed to fetch page. Status code: ${response.status}`,
        scraperUsed: SCRAPER_TYPE.STATIC,
      };
    }

		// Checks the content type to ensure it's an HTML page.
		// Some URLs might redirect to non-HTML content (like PDFs or images),
		// which we want to avoid processing.
    const contentType = response.headers.get("content-type");

    if (contentType && !contentType.includes("text/html")) {
      return {
        success: false,
        statusCode: response.status,
        error: "URL did not return an HTML page.",
        scraperUsed: SCRAPER_TYPE.STATIC,
      };
    }

		// Convert response to text and check if it's empty or only whitespace,
		// which would indicate an invalid page.
    const html = await response.text();

    if (!html || html.trim().length === 0) {
      return {
        success: false,
        statusCode: response.status,
        error: "Page returned empty HTML content.",
        scraperUsed: SCRAPER_TYPE.STATIC,
      };
    }

    return {
      success: true,
      html,
      statusCode: response.status,
      scraperUsed: SCRAPER_TYPE.STATIC,
    };
  } catch (error: any) {
    clearTimeout(timeout);

    if (error.name === "AbortError") {
      return {
        success: false,
        error: "Request timed out while trying to fetch the page.",
        scraperUsed: SCRAPER_TYPE.STATIC,
      };
    }

    return {
      success: false,
      error: "Unable to fetch page. Please check that the URL is reachable.",
      scraperUsed: SCRAPER_TYPE.STATIC,
    };
  }
}
