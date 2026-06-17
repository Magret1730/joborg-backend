import * as cheerio from "cheerio";

// This function takes an HTML string as input and returns a cleaned version of the text content.
export function cleanHtml(html: string): string {
  // Loads the HTML into Cheerio, which allows us to manipulate and extract content using jQuery-like syntax.
  const $ = cheerio.load(html);

  // Removes all script, style, noscript, iframe, and svg elements from the HTM
  //  to ensure that we only extract meaningful text content.
  $("script").remove();
  $("style").remove();
  $("noscript").remove();
  $("iframe").remove();
  $("svg").remove();

  // Extracts the text content from the body of the HTML document.
  // This will give us all the visible text that users would see on the page.
  const bodyText = $("body").text();

  // Cleans the extracted text by replacing multiple whitespace characters with a
  // single space and trimming leading and trailing whitespace.
  const cleanedText = bodyText
    .replace(/\s+/g, " ")
    .trim();

  return cleanedText;
}