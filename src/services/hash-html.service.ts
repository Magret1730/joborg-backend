import crypto from "crypto";

// This function creates a SHA-256 hash of the given content
// and returns it as a hexadecimal string.
export function createHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}