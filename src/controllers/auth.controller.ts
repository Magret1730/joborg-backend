import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { validateRegisterRequest } from "../utils/validations/validate-register-request.js";
import { validateLoginRequest } from "../utils/validations/validate-login-request.js";
import { sendMail } from "../utils/mailer.js";
import db from "../db/connection.js";
import { validateEmail } from "../utils/validations/validate-email.js";

const register = async (req: Request, res: Response) => {
  try {
    // gets the body request
    const { first_name, last_name, email, password } = req.body;

    // Basic checks for empty fields
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: "All fields are compulsory" });
    }

    // Validate the request body
    const validationError = validateRegisterRequest(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // validates existing email
    const existingUser = await db("users").where({ email }).first();
    if (existingUser) {
      return res
        .status(401)
        .json({ message: "User already exists with this email" });
    }

    // encrypt password
    const salt = await bcrypt.genSalt(10);
    const encryptedPwd = await bcrypt.hash(password, salt);
    if (!encryptedPwd) {
      return res.status(500).json({ message: "Could not encrypt password" });
    }

    // Insert the new user into the database
    const [newUser] = await db("users")
      .insert({
        first_name: first_name.toLowerCase(),
        last_name: last_name.toLowerCase(),
        email: email.toLowerCase(),
        password_hash: encryptedPwd,
        is_admin: false,
        is_verified: false,
      })
      .returning([
        "id",
        "first_name",
        "last_name",
        "email",
        "is_admin",
        "is_verified",
      ]);

    if (!newUser) {
      return res.status(500).json({ error: "User registration failed" });
    }

    // Generate a JWT token for the new user
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    // Create token for the user
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
      },
      jwtSecret,
      { expiresIn: "15m" }
    );

    const frontend_url = process.env.FRONTEND_URL;
    if (!frontend_url) {
      throw new Error("FRONTEND_URL is not defined in environment variables");
    }

    const verificationLink = `${frontend_url}/auth/verify-email?token=${token}`;

    // Send the verify email
    try {
      await sendMail({
        to: email,
        subject: "Joborg Registration",
        html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
                    <h2 style="color: #111827;">Welcome to Joborg!</h2>

                    <p>Dear ${first_name},</p>

                    <p>
                    Thank you for registering with Joborg. Please verify your email address
                    to activate your account.
                    </p>

                    <p style="margin: 24px 0;">
                    <a
                        href="${verificationLink}"
                        style="
                        display: inline-block;
                        background-color: #2563eb;
                        color: #ffffff;
                        padding: 12px 20px;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 14px;
                        "
                    >
                        Verify Email
                    </a>
                    </p>

                    <p>This link expires in 15 minutes.</p>

                    <p>If you did not create this account, you can ignore this email.</p>

                    <p>Thank you,<br />Joborg Team</p>
                </div>
                `,
      });
    } catch (error) {
      console.error("Error sending registration email:", error);
    }

    // Returns data and status to frontend
    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email to verify your account.",
      data: {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        is_admin: newUser.is_admin,
        is_verified: newUser.is_verified,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration error, something went wrong" });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    // gets the body request
    const { email, password } = req.body;

    // Basic checks for empty fields
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are compulsory" });
    }

    // Validate the request body
    const validationError = validateLoginRequest(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // validates existing email
    const existingUser = await db("users").where({ email }).first();
    if (!existingUser) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // responds if email is not verified
    if (!existingUser.is_verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.", // Used in frontend to show resend verification option - DON'T CHANGE THIS MESSAGE
      });
    }

    // compares the password with the encrypted password in the database
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password_hash
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    // Create token for the user
    const token = jwt.sign(
      {
        id: existingUser.id,
        first_name: existingUser.first_name,
        last_name: existingUser.last_name,
        email: existingUser.email,
        is_admin: existingUser.is_admin,
      },
      jwtSecret,
      { expiresIn: "30d" }
    );

    // Updates user record with the token
    // await db("users").where({ id: existingUser.id }).update({ token });

    // Removes the password field from the response
    delete existingUser.password_hash;

    // Returns data and status to frontend
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: existingUser.id,
          first_name: existingUser.first_name,
          last_name: existingUser.last_name,
          email: existingUser.email,
          is_admin: existingUser.is_admin,
        }
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login error, something went wrong" });
  }
};

const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== "string") {
      return res
        .status(400)
        .json({ message: "Token expired. Please register again." });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      email: string;
    };

    const updatedUser = await db("users")
      .where({ id: decoded.id, email: decoded.email })
      .update({ is_verified: true })
      .returning(["id", "email", "is_verified"]);

    if (!updatedUser.length) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        id: updatedUser[0].id,
        email: updatedUser[0].email,
        is_verified: updatedUser[0].is_verified,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired verification link",
    });
  }
};

// Function to get link in email
const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Validate the request body
    const validationError = validateEmail(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // find user in db
    const existingUser = await db("users").where({ email }).first();

    // respond if no existing user
    if (!existingUser) {
      return res.status(400).json({ error: "User not found" });
    }

    const forgotPasswordKey = process.env.FORGOT_PASSWORD_KEY;
    if (!forgotPasswordKey) {
      throw new Error(
        "FORGOT_PASSWORD_KEY is not defined in environment variables"
      );
    }

    // Generate a new token
    const token = jwt.sign({ id: existingUser.id }, forgotPasswordKey, {
      expiresIn: "15m",
    });

    // Update the user's token in the database
    // await db("users").where({ id: existingUser.id }).update({ token: "" });

    // Send the email
    const sendEmail = await sendMail({
      to: email,
      subject: "Joborg Password Reset",
      html: `
                    <h2>Click the following link to reset your password:</h2>
                    <h2>The link expires in 15 minutes</h2>
                    <p>${process.env.NEXT_PUBLIC_FRONTEND_URL}/resetPassword/${token}</p>

                    <p>If you did not request this, please ignore this email.</p>
                    <p>Thank you!</p>
                    <p>Joborg Team</p>
                `,
    });

    if (sendEmail) {
      return res.status(200).json({
        message: "Email has been sent, kindly follow the instructions",
      });
    } else {
      return res.status(500).json({ error: "Failed to send email" });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in forgotPassword:", error.message);
    } else {
      console.error("Error in forgotPassword:", error);
    }
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

// Function to resetPassword
const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const resetPasswordKey = process.env.FORGOT_PASSWORD_KEY;
    if (!resetPasswordKey) {
      throw new Error(
        "RESET_PASSWORD_KEY is not defined in environment variables"
      );
    }

    // verifies token
    const decoded = jwt.verify(token, resetPasswordKey) as jwt.JwtPayload;

    // find user in db
    const user = await db("users").where({ id: decoded.id }).first();

    // respond if no user
    if (!user) {
      return res.status(400).json({ error: "User does not exist" });
    }

    // Validate password
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{4,}$/;
    if (!passwordRegex.test(newPassword)) {
      return "Password should contain at least one letter and one number, and be at least 4 characters long";
    } else if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Encrypt the new password
    const salt = await bcrypt.genSalt(10);
    const encryptedPwd = await bcrypt.hash(newPassword, salt);
    if (!encryptedPwd) {
      return res.status(500).json({ message: "Could not encrypt password" });
    }

    // Update the user's token in the database
    await db("users").where({ id: user.id }).update({
      password_hash: encryptedPwd,
      // token: ''
    });

    return res.status(200).json({
      message:
        "Your password has been changed. Please log in with your new password.",
    });
  } catch (error) {
    res
      .status(401)
      .json({ error: "Incorrect or expired token. Please request a new one." });
  }
};

// Function to resend verification email when user verification link after registration expires
const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await db("users").where({ email: normalizedEmail }).first();

    // Keep response generic if user does not exist
    if (!user) {
      return res.status(200).json({
        message: "If an account exists, a verification email has been sent.",
      });
    }

    if (user.is_verified) {
      return res.status(200).json({
        message: "This account is already verified. You can log in.",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is not defined in environment variables");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      jwtSecret,
      { expiresIn: "15m" }
    );

    const verificationLink = `${frontendUrl}/auth/verify-email?token=${token}`;

    await sendMail({
      to: user.email,
      subject: "Verify your Joborg account",
      html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
            <h2>Verify your Joborg account</h2>
  
            <p>Hello ${user.first_name},</p>
  
            <p>Your previous verification link may have expired. Please use the button below to verify your Joborg account.</p>
  
            <p style="margin: 24px 0;">
              <a
                href="${verificationLink}"
                style="
                  display: inline-block;
                  background-color: #2563eb;
                  color: #ffffff;
                  padding: 12px 20px;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: 600;
                  font-size: 14px;
                "
              >
                Verify Email
              </a>
            </p>
  
            <p>This link expires in 15 minutes.</p>
  
            <p>If you did not request this, you can ignore this email.</p>
  
            <p>Thank you,<br />Joborg Team</p>
          </div>
        `,
    });

    return res.status(200).json({
      message: "If an account exists, a verification email has been sent.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);

    return res.status(500).json({
      message: "Something went wrong while sending verification email",
    });
  }
};

export {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
};
