import db from "../db/connection.js";
import type { Request, Response } from "express";

// const index = async (_req: Request, res: Response) => {
//     try {
//         // queries users database
//         const data = await db('users').select('*');

//         // Removes the password field from the responsee
//         // delete data.password;

//         // Remove the password field from each user object
//         const sanitizedData = data.map(user => {
//             const { password, ...userWithoutPassword } = user; // Destructures to remove password
//             return userWithoutPassword;
//         });

//         // sends a response with the appropriate status code
//         res.status(200).json({ success: true, data: sanitizedData });
//     } catch (err) {
//         // Logs the error for debugging
//         console.error(err);

//         // Sends appropriate response to frontend
//         res.status(500).send({ success: false, message: "Internal server error" });
//     }
// };

// Finds a user by their ID and returns their information, excluding the password field
const me = async (req: Request, res: Response) => {
    try {
        // gets id to make the request
        const { id } = req.params;

        // checks for invalid id
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        // queries database
        const user = await db("users")
            .where({ id })
            .first();

        // Checks if user is found
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Removes the password field from the responsee
        const { password, ...userData } = user;

         // sends a response with the appropriate status code
        res.json({ success: true, data: userData });
    } catch (error) {
        // Logs the error for debugging
        console.error(error);

        // Sends appropriate response to frontend
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export { me };