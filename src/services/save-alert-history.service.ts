import db from "../db/connection.js";
import { SaveAlertHistoryInput } from "../dtos/save-alert-history.dto.js";

export const saveAlertHistory = async ({
  trackerId,
  changeLogId,
  recipientEmail,
  message,
  channel = "email",
  status,
  errorMessage,
}: SaveAlertHistoryInput) => {
  const [alertHistory] = await db("alert_history")
    .insert({
      tracker_id: trackerId,
      change_log_id: changeLogId,
      recipient_email: recipientEmail,
      message,
      channel,
      status,
      error_message: errorMessage || null,
    })
    .returning("*");

  return alertHistory;
};
