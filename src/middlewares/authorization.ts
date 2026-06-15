import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { AuthPayload, AuthRequest } from "../dtos/auth-dto.js";

export const authorization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const [bearer, token] = authHeader.split(" ");

    if (bearer !== "Bearer" || !token) {
      return res.status(401).json({ message: "Invalid authorization format" });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, jwtSecret) as AuthPayload;

    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: "Token has expired. Please log in again.",
      });
    }

    console.error("Authentication error:", error);

    return res.status(401).json({
      error: "Invalid token",
    });
  }
};