import rateLimit from "express-rate-limit";

// Rate limiter for manual tracker checks to prevent abuse and excessive load on the server.
// This limiter allows a maximum of 5 manual tracker check requests per IP address within a 15-minute window.
export const manualTrackerCheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 10 requests per IP within 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many tracker check requests. Please try again later.",
  },
});