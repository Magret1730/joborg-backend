import { sendMail } from "../utils/mailer.js";
import { ContactEmailTemplate } from "../utils/email-templates/contact-email-template.js";
import type { ContactRequestDto } from "../dtos/contact.dto.js";

export const contactMail = async (payload: ContactRequestDto) => {
  try {
    const { first_name, last_name, email, subject, message } = payload;
    
    const data = await sendMail({
      to: process.env.EMAIL_FROM_EMAIL || "",
      subject: `Contact Form Submission: ${subject}`,
      html: await ContactEmailTemplate(payload),
    });

    console.log(
      `Contact email sent to ${process.env.EMAIL_FROM_EMAIL} with subject "${subject}"`
    );

    return data;
  } catch (err) {
    console.error("Error sending contact email:", err);
    throw err;
  }
};
