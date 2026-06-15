import { UrlValidationResult } from "../dtos/validation-dto.js";

// This function checks whether a URL hostname is a private/internal IP address.
function isPrivateIp(hostname: string): boolean {
  const parts = hostname.split(".").map(Number);

  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [first, second] = parts;

  // 127.x.x.x
  if (first === 127) return true;

  // 0.x.x.x
  if (first === 0) return true;

  // 10.x.x.x
  if (first === 10) return true;

  // 192.168.x.x
  if (first === 192 && second === 168) return true;

  // 172.16.x.x - 172.31.x.x
  if (first === 172 && second >= 16 && second <= 31) return true;

  return false;
}

export function validateUrl(url: string): UrlValidationResult {
  // Checks if the URL is empty or only contains whitespace
  if (!url || url.trim() === "") {
    return {
      isValid: false,
      message: "URL is required.",
    };
  }

  const trimmedUrl = url.trim();

  // Checks if the URL starts with http:// or https://
  if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
    return {
      isValid: false,
      message: "URL must start with http:// or https://.",
    };
  }

  try {
    const parsedUrl = new URL(trimmedUrl);

    // Checks for disallowed protocols and validates the hostname
    const protocol = parsedUrl.protocol;
    const hostname = parsedUrl.hostname.toLowerCase();

    // Disallow file and FTP URLs to prevent potential security risks
    if (protocol === "file:" || protocol === "ftp:") {
      return {
        isValid: false,
        message: "File and FTP URLs are not allowed.",
      };
    }

    // Checks if the hostname is empty, localhost, or a private/internal IP address
    if (!hostname) {
      return {
        isValid: false,
        message: "Please enter a valid URL.",
      };
    }

    if (hostname === "localhost") {
      return {
        isValid: false,
        message: "Localhost URLs are not allowed.",
      };
    }

    if (isPrivateIp(hostname)) {
      return {
        isValid: false,
        message: "Private or internal IP addresses are not allowed.",
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
