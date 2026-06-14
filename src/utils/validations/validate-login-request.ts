import type { LoginRequestDto } from "../../dtos/auth-dto.js";

export const validateLoginRequest = (
  body: LoginRequestDto
): string | null => {
  const { email, password } = body;

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