import rateLimit from "express-rate-limit";

// Rate limiter for tracker creation: limits to 2 attempts per 1 hour per IP address
export const createTrackerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // Every 1 hour
  max: 2, // max of 10 trackers
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many tracker creation attempts. Please try again later.",
  },
});