import nodemailer from "nodemailer";
import { sendMailDto } from "../dtos/auth.dto.js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const gmailUser = process.env.GMAIL_USER;
const gmailPassword = process.env.GMAIL_PASSWORD;
const emailUser = process.env.EMAIL_USER;
const nodeEnv = process.env.NODE_ENV;

const isSmtpReady = Boolean(gmailUser && gmailPassword);

// configuration for nodemailer
const transporter = isSmtpReady
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    })
  : null;

export const sendMail = async ({ to, subject, html }: sendMailDto) => {
  try {
    // Development fallback if SMTP is not ready
    if (!transporter) {
      console.log("SMTP is not configured. Simulating email send:");
      console.log({
        to,
        subject,
        html,
      });

      return {
        simulated: true,
        message: "Email simulated because SMTP is not configured.",
      };
    }

    const info = await transporter.sendMail({
      from: `"Joborg" <${emailUser}>`,
      to,
      subject,
      html,
    });

    return info;
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
};
