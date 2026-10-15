import type { ContactRequestDto } from "../../dtos/contact.dto.js";

export const ContactEmailTemplate = async (payload: ContactRequestDto) => {
  return `
    <p><strong>First Name:</strong> ${payload.first_name}</p>
    <p><strong>Last Name:</strong> ${payload.last_name}</p>
    <p><strong>Email:</strong> ${payload.email}</p>
    <p><strong>Subject:</strong></p>
    <p>${payload.subject}</p>
    <p><strong>Message:</strong></p>
    <p>${payload.message}</p>
  `;
};

// html: `
//             <p><strong>First Name:</strong> ${first_name}</p>
//             <p><strong>Last Name:</strong> ${last_name}</p>
//             <p><strong>Email:</strong> ${email}</p>
//             <p><strong>Message:</strong></p>
//             <p>${message}</p>
//         `,
