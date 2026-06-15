import nodemailer from "nodemailer";
import { sendMailDto } from "../dtos/auth-dto.js";
import dotenv from "dotenv";
import path from "path";


dotenv.config({
    path: path.resolve(process.cwd(), ".env"),
});

// configuration for nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    },
});


export const sendMail = async (
    { to, subject, html }: sendMailDto
) => {
    try {
        const info = await transporter.sendMail({
            from: `"Joborg" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        // console.log("Email: mailer.js", info);
        // console.log('Email sent: %s', info.messageId);
        return info;
    } catch (err) {
        console.error('Error sending email:', err);
        throw err;
    }
};