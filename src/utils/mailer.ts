import { Resend } from "resend";
import { sendMailDto } from "../dtos/auth.dto.js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const sendMail = async ({ to, subject, html }: sendMailDto) => {
  try {
    if (!resend || !emailFrom) {
      console.log("Email API is not configured. Simulating email send:");
      // console.log({ to, subject, html });

      return {
        simulated: true,
        message: "Email simulated because email API is not configured.",
      };
    }

    const result = await resend.emails.send({
      from: emailFrom,
      to,
      subject,
      html,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data;
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
};




// import nodemailer from "nodemailer";
// import { sendMailDto } from "../dtos/auth.dto.js";
// import dotenv from "dotenv";
// import path from "path";
// // import { setDefaultResultOrder } from "node:dns";

// dotenv.config({
//   path: path.resolve(process.cwd(), ".env"),
// });

// // Prefer IPv4 because Render may fail when Gmail resolves to IPv6
// // setDefaultResultOrder("ipv4first");

// const gmailUser = process.env.GMAIL_USER;
// const gmailPassword = process.env.GMAIL_PASSWORD;
// const emailUser = process.env.EMAIL_USER || gmailUser;

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   // port: 587,
//   port: 465,
//   secure: true,
//   // requireTLS: true,
//   auth: {
//     user: gmailUser,
//     pass: gmailPassword,
//   },
// });

// export const sendMail = async ({ to, subject, html }: sendMailDto) => {
//   try {
//     if (!transporter) {
//       console.log("SMTP is not configured. Simulating email send:");
//       console.log({
//         to,
//         subject,
//         html,
//       });

//       return {
//         simulated: true,
//         message: "Email simulated because SMTP is not configured.",
//       };
//     }

//     const info = await transporter.sendMail({
//       from: `"Joborg" <${emailUser}>`,
//       to,
//       subject,
//       html,
//     });

//     return info;
//   } catch (err) {
//     console.error("Error sending email:", err);
//     throw err;
//   }
// };

// // import nodemailer from "nodemailer";
// // import { sendMailDto } from "../dtos/auth.dto.js";
// // import dotenv from "dotenv";
// // import path from "path";
// // import { setDefaultResultOrder } from "node:dns";

// // dotenv.config({
// //   path: path.resolve(process.cwd(), ".env"),
// // });

// // // Prefer IPv4 because Render may fail when Gmail resolves to IPv6
// // setDefaultResultOrder("ipv4first");

// // const gmailUser = process.env.GMAIL_USER;
// // const gmailPassword = process.env.GMAIL_PASSWORD;
// // const emailUser = process.env.EMAIL_USER;
// // // const nodeEnv = process.env.NODE_ENV;

// // const isSmtpReady = Boolean(gmailUser && gmailPassword);

// // // configuration for nodemailer
// // const transporter = isSmtpReady
// //   ? nodemailer.createTransport({
// //       service: "gmail",
// //       auth: {
// //         user: gmailUser,
// //         pass: gmailPassword,
// //       },
// //     })
// //   : null;

// // export const sendMail = async ({ to, subject, html }: sendMailDto) => {
// //   try {
// //     // Development fallback if SMTP is not ready
// //     if (!transporter) {
// //       console.log("SMTP is not configured. Simulating email send:");
// //       console.log({
// //         to,
// //         subject,
// //         html,
// //       });

// //       return {
// //         simulated: true,
// //         message: "Email simulated because SMTP is not configured.",
// //       };
// //     }

// //     const info = await transporter.sendMail({
// //       from: `"Joborg" <${emailUser}>`,
// //       to,
// //       subject,
// //       html,
// //     });

// //     return info;
// //   } catch (err) {
// //     console.error("Error sending email:", err);
// //     throw err;
// //   }
// // };
