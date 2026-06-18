import db from "../db/connection.js";
import { SaveAlertHistoryInput } from "../dtos/save-alert-history.dto.js";

export const saveAlertHistory = async ({
  userId,
  trackerId,
  changeLogId,
  recipient,
  message,
  channel = "email",
  status,
  // errorMessage,
}: SaveAlertHistoryInput) => {
  const [alertHistory] = await db("alert_history")
    .insert({
      user_id: userId,
      tracker_id: trackerId,
      change_log_id: changeLogId,
      recipient: recipient,
      // recipient_email: recipient,
      message,
      channel,
      status,
      // error_message: errorMessage || null,
    })
    .returning("*");

  return alertHistory;
};
