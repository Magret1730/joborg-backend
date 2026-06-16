import rateLimit from "express-rate-limit";

// Rate limiter for tracker creation: limits to 10 attempts per 15 minutes per IP address
export const createTrackerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many tracker creation attempts. Please try again later.",
  },
});