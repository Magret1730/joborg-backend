import { Request } from "express";
import type { TrackerRequestDto } from "../../dtos/tracker.dto.js";

export const trackerChangeEmailTemplate = async (tracker: TrackerRequestDto, req: Request) => {
  return `
    <p>Hi ${req.user.first_name},</p>
    <p>We detected a change on the career page you are tracking:</p>
    <p>Company Name: <strong>${tracker.company_name}</strong></p>
    <p>Company Label: <strong>${tracker.label}</strong></p>
    <p>This may mean a new role was added or the page was updated.</p>
    <p>Check it here: <a href="${tracker.url}" target="_blank">${tracker.url}</a></p>
    <p>Please visit the tracker dashboard to see the details of the change.</p>
    <p>Best regards,<br/>Joborg Team</p>
  `;
}