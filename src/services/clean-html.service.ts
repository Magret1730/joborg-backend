import * as cheerio from "cheerio";

// This function takes an HTML string and returns normalized visible text.
// The goal is not to keep the full page exactly as-is.
// The goal is to keep meaningful career/job content and reduce website noise.
export function cleanHtml(html: string): string {
  const $ = cheerio.load(html);

  /**
   * 1. Remove elements that are usually not meaningful page content.
   * These often create noise, especially on JavaScript-rendered pages.
   */
  $(
    [
      "script",
      "style",
      "noscript",
      "iframe",
      "svg",
      "canvas",
      "meta",
      "link",
      "picture",
      "source",
      "video",
      "audio",
    ].join(",")
  ).remove();

  /**
   * 2. Remove common layout sections.
   * These can change even when the job listings did not change.
   */
  $(
    [
      "header",
      "footer",
      "nav",
      "aside",
      "[role='navigation']",
      "[role='banner']",
      "[role='contentinfo']",
    ].join(",")
  ).remove();

  /**
   * 3. Remove common popups, cookie banners, newsletter boxes, ads, etc.
   * The i flag makes the match case-insensitive.
   */
  $(
    [
      "[id*='cookie' i]",
      "[class*='cookie' i]",
      "[id*='consent' i]",
      "[class*='consent' i]",
      "[id*='popup' i]",
      "[class*='popup' i]",
      "[id*='modal' i]",
      "[class*='modal' i]",
      "[id*='newsletter' i]",
      "[class*='newsletter' i]",
      "[id*='subscribe' i]",
      "[class*='subscribe' i]",
      "[id*='advert' i]",
      "[class*='advert' i]",
      "[id*='ads' i]",
      "[class*='ads' i]",
      "[aria-label*='cookie' i]",
    ].join(",")
  ).remove();

  /**
   * 4. Remove attributes that often change.
   * This is extra safety in case you later decide to hash selected HTML,
   * but for text hashing it is not the most important part.
   */
  $("*").each((_, element) => {
    if (element.type === "tag") {
      const attribs = element.attribs || {};

      Object.keys(attribs).forEach((attr) => {
        if (
          attr.startsWith("data-") ||
          attr.startsWith("aria-") ||
          attr.startsWith("on") ||
          attr === "id" ||
          attr === "class" ||
          attr === "style" ||
          attr === "onclick"
        ) {
          $(element).removeAttr(attr);
        }
      });
    }
  });

  /**
   * 5. Extract visible text from the body.
   */
  const bodyText = $("body").text();

  return normalizeText(bodyText);
}

function normalizeText(text: string): string {
  let cleanedText = text
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  /**
   * 6. Normalize dynamic phrases that commonly change without a real job change.
   */
  cleanedText = cleanedText
    // posted 3 days ago, posted 1 hour ago
    .replace(
      /\bposted\s+\d+\s+(second|minute|hour|day|week|month|year)s?\s+ago\b/gi,
      "posted recently"
    )

    // 3 days ago, 1 hour ago
    .replace(
      /\b\d+\s+(second|minute|hour|day|week|month|year)s?\s+ago\b/gi,
      "recently"
    )

    // updated 2 minutes ago
    .replace(
      /\bupdated\s+\d+\s+(second|minute|hour|day|week|month|year)s?\s+ago\b/gi,
      "updated recently"
    )

    // showing 1-10 of 45 jobs
    .replace(
      /\bshowing\s+\d+\s*[-–]\s*\d+\s+of\s+\d+\s+(jobs|results|positions|openings)?\b/gi,
      "showing results"
    )

    // page 1 of 5
    .replace(/\bpage\s+\d+\s+of\s+\d+\b/gi, "page")

    // exact times like 10:42 AM
    .replace(/\b\d{1,2}:\d{2}\s?(am|pm)?\b/gi, "time")

    // UUIDs
    .replace(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
      "uuid"
    )

    // long hashes/tokens
    .replace(/\b[a-f0-9]{32,}\b/gi, "hash");

  /**
   * 7. Remove some common noise phrases.
   * Be careful not to remove too much.
   */
  const noisePhrases = [
    "skip to content",
    "accept cookies",
    "privacy policy",
    "terms of use",
    "all rights reserved",
  ];

  for (const phrase of noisePhrases) {
    cleanedText = cleanedText.replace(
      new RegExp(escapeRegExp(phrase), "gi"),
      ""
    );
  }
  return cleanedText.replace(/\s+/g, " ").trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// import * as cheerio from "cheerio";

// // This function takes an HTML string as input and returns a cleaned version of the text content.
// export function cleanHtml(html: string): string {
//   // Loads the HTML into Cheerio, which allows us to manipulate and extract content using jQuery-like syntax.
//   const $ = cheerio.load(html);

//   // Removes all script, style, noscript, iframe, and svg elements from the HTM
//   //  to ensure that we only extract meaningful text content.
//   $("script").remove();
//   $("style").remove();
//   $("noscript").remove();
//   $("iframe").remove();
//   $("svg").remove();
//   $("canvas").remove();

//   // Remove common noisy sections
//   $("header").remove();
//   $("footer").remove();
//   $("nav").remove();
//   $("aside").remove();

//   // Remove cookie banners / popups / ads if present
//   $("[id*='cookie']").remove();
//   $("[class*='cookie']").remove();
//   $("[id*='consent']").remove();
//   $("[class*='consent']").remove();
//   $("[id*='popup']").remove();
//   $("[class*='popup']").remove();
//   $("[id*='modal']").remove();
//   $("[class*='modal']").remove();

//   // Remove attributes that often change
//   $("*").each((_, element) => {
//     if (element.type === "tag") {
//       const attribs = element.attribs || {};

//       Object.keys(attribs).forEach((attr) => {
//         if (
//           attr.startsWith("data-") ||
//           attr === "id" ||
//           attr === "class" ||
//           attr === "style" ||
//           attr === "onclick" ||
//           attr === "aria-describedby"
//         ) {
//           $(element).removeAttr(attr);
//         }
//       });
//     }
//   });

//   // Extracts the text content from the body of the HTML document.
//   // This will give us all the visible text that users would see on the page.
//   const bodyText = $("body").text();

//   // Cleans the extracted text by replacing multiple whitespace characters with a
//   // single space and trimming leading and trailing whitespace.
//   const cleanedText = bodyText
//     .replace(/\s+/g, " ")
//     .replace(/\bposted\s+\d+\s+(second|minute|hour|day|week|month)s?\s+ago\b/gi, "posted ago")
//     .replace(/\b\d+\s+(second|minute|hour|day|week|month)s?\s+ago\b/gi, "time ago")
//     .trim()
//     .toLowerCase();

//   return cleanedText;
// }