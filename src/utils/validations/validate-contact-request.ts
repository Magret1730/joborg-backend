import type { ContactRequestDto } from "../../dtos/contact.dto.js";

export const validateContactRequest = (
  body: ContactRequestDto
): string | null => {
  const { first_name, last_name, email, subject, message } = body;

  const firstLastNameRegex = /^[a-zA-Z\s\-'.]+$/;

  if (!firstLastNameRegex.test(first_name)) {
    return "Invalid First Name. Allowed: A-Z, a-z, spaces, hyphens (-), apostrophes ('), periods (.)";
  }

  if (!firstLastNameRegex.test(last_name)) {
    return "Invalid Last Name. Allowed: A-Z, a-z, spaces, hyphens (-), apostrophes ('), periods (.)";
  }

  const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (!emailRegex.test(email)) {
    return "Invalid Email Format. Example of valid format: user@example.com";
  }

  if (!subject || subject.trim() === "") {
    return "Subject is required";
  } else if (subject.length < 5 || subject.length > 100) {
    return "Subject must be between 5 and 100 characters";
  }

  if (!message || message.trim() === "") {
    return "Message is required";
  } else if (message.length < 10 || message.length > 10000) {
    return "Message must be between 10 and 10000 characters";
  }

  return null;
};