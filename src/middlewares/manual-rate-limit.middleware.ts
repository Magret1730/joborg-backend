import rateLimit from "express-rate-limit";

// Rate limiter for manual tracker checks to prevent abuse and excessive load on the server.
// This limiter allows a maximum of 2 manual tracker check requests per IP address within a 1 hour window.
export const manualTrackerCheckLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour // 60 seconds × 60 minutes × 1000 milliseconds // 2 * 60 * 60 * 1000 - 2 hours
  max: 2, // max 2 requests per IP within 1 hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many tracker check requests. Please try again later.",
  },
});