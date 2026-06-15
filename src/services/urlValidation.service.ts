import { UrlValidationResult } from "../dtos/validation-dto.js";

export function validateUrl(url: string): UrlValidationResult {
    // Checks if the URL is empty or only contains whitespace
    if (!url || url.trim() === "") {
      return {
        isValid: false,
        message: "URL is required.",
      };
    }
  
    // Trims the URL to remove leading and trailing whitespace
    const trimmedUrl = url.trim();
  
    // Checks if the URL starts with http:// or https://
    if (
      !trimmedUrl.startsWith("http://") &&
      !trimmedUrl.startsWith("https://")
    ) {
      return {
        isValid: false,
        message: "URL must start with http:// or https://.",
      };
    }
  
    // Attempts to parse the URL and checks if it has a valid hostname
    try {
      const parsedUrl = new URL(trimmedUrl);
  
      if (!parsedUrl.hostname) {
        return {
          isValid: false,
          message: "Please enter a valid URL.",
        };
      }
  
      return {
        isValid: true,
        normalizedUrl: parsedUrl.toString(),
      };
    } catch {
      return {
        isValid: false,
        message: "Please enter a valid URL.",
      };
    }
  }