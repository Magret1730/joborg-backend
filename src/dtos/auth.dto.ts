import type { Request, Response, NextFunction } from "express";

export type RegisterRequestDto = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

export type LoginRequestDto = {
  email: string;
  password: string;
};

export type EmailDto = {
  email: string;
};

export type sendMailDto = {
  to: string;
  subject: string;
  html: string;
};

export type AuthPayload = {
  id: string;
  email: string;
  is_admin?: boolean;
};

export type AuthRequest = Request & {
  user?: AuthPayload;
};
