import { Request, Response } from "express";
import { validateContactRequest } from "../utils/validations/validate-contact-request.js";
import { contactMail } from "../services/contact.service.js";

export const contactEmail = async (req: Request, res: Response) => {
  try {
    // gets the body request
    const { first_name, last_name, email, subject, message } = req.body;

    // Basic checks for empty fields
    if (!email || !first_name || !last_name || !subject || !message) {
      return res.status(400).json({ error: "All fields are compulsory" });
    }

    // Validate the request body
    const validationError = validateContactRequest(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Send the contact email
    const data = await contactMail({
      first_name,
      last_name,
      email,
      subject,
      message,
    });

    return res.status(200).json({
      message: "Contact email sent successfully",
      data,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login error, something went wrong" });
  }
};
