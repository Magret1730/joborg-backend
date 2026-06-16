// A middleware function that checks if the authenticated user is an admin.
import { AuthPayload, AuthRequest } from "../dtos/auth.dto.js";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export const adminCheck = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }

        // splits the token to extract only the token needed
        const token = authHeader.split(" ")[1];

        const jwtSecret = process.env.JWTSECRET;
        if (!jwtSecret) {
            throw new Error("JWTSECRET is not defined");
        }

        const decoded = jwt.verify(token, jwtSecret) as AuthPayload;

        // checks  for admin
        if (req.user && (decoded.is_admin === true)) {
            return next();
        }

        res.status(403).json({ error: 'Access denied. Admins only.' });
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};