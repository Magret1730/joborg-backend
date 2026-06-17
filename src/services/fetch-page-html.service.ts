export type PageFetchResult = {
    success: boolean;
    html?: string;
    statusCode?: number;
    error?: string;
  };

// Fetches the HTML content of a page given its URL.
// It includes error handling for various scenarios such as timeouts,
// non-HTML content, and empty responses. The function returns a structured
// result indicating success or failure along with relevant details.
export async function fetchPageHtml(url: string): Promise<PageFetchResult> {
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
          "Mozilla/5.0 (compatible; joborg-bot/1.0; +https://joborg.app)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        error: `Failed to fetch page. Status code: ${response.status}`,
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
      };
    }

    return {
      success: true,
      html,
      statusCode: response.status,
    };
  } catch (error: any) {
    clearTimeout(timeout);

    if (error.name === "AbortError") {
      return {
        success: false,
        error: "Request timed out while trying to fetch the page.",
      };
    }

    return {
      success: false,
      error: "Unable to fetch page. Please check that the URL is reachable.",
    };
  }
}
