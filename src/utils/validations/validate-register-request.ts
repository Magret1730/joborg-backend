import type { RegisterRequestDto } from "../../dtos/auth-dto.js";

export const validateRegisterRequest = (
  body: RegisterRequestDto
): string | null => {
  const { first_name, last_name, email, password } = body;

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

  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{4,}$/;

  if (!passwordRegex.test(password)) {
    return "Password should contain at least one letter and one number, and be at least 4 characters long";
  }

  return null;
};