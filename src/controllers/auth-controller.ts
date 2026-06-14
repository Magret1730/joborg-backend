// import createDbConnection from "knex";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { validateRegisterRequest } from "../utils/validations/validate-register-request.js";
// import { sendMail } from "../utils/mailer.js";
import db from "../db/connection.js";

const register = async (req: Request, res: Response) => {
    try {
        // gets the body request
        const { first_name, last_name, email, password } = req.body;

        // Basic checks for empty fields
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: 'All fields are compulsory' });
        }

        // Validate the request body
        const validationError = validateRegisterRequest(req.body);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        // validates existing email
        const existingUser = await db("users").where({ email }).first();
        if (existingUser) {
            return res.status(401).json({ message: 'User already exists with this email' });
        }

        // encrypt password
        const salt = await bcrypt.genSalt(10);
        const encryptedPwd = await bcrypt.hash(password, salt);
        if (!encryptedPwd) {
            return res.status(500).json({ message: 'Could not encrypt password' });
        }

        // Insert the new user into the database
        const [newUser] = await db("users")
            .insert({
                first_name: first_name.toLowerCase(),
                last_name: last_name.toLowerCase(),
                email: email.toLowerCase(),
                password: encryptedPwd,
                is_admin: false,
            })
            .returning(["id", "first_name", "last_name", "email", "is_admin"]);
        
        if (!newUser) {
            return res.status(500).json({ error: "User registration failed" });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }

        // Create token for the user
        const token = jwt.sign(
            { id: newUser.id, 
                email: newUser.email,
                // first_name: newUser.first_name,
                // last_name: newUser.last_name,
                is_admin: newUser.is_admin },
            jwtSecret,
            { expiresIn: '15m' }
        );

        // Updates user record with the token
        await db("users").where({ id: newUser.id }).update({ token });

        // Removes the password field from the response
        delete newUser.password;

        // Returns data and status to frontend
        res.status(201).json({ success: true, data: { token,
                                                        id: newUser.id,
                                                        first_name: newUser.first_name,
                                                        last_name: newUser.last_name,
                                                        email: newUser.email,
                                                        is_admin: newUser.is_admin }
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Registration error, something went wrong" });
    }
};

export { register };