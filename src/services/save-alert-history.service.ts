import db from "../db/connection.js";
import { SaveAlertHistoryInput } from "../dtos/save-alert-history.dto.js";
import { ALERT_CHANNEL } from "../constants/alert/alertChannel.js";

export const saveAlertHistory = async ({
  userId,
  trackerId,
  changeLogId,
  recipient,
  message,
  channel = ALERT_CHANNEL.EMAIL,
  status,
  // errorMessage,
}: SaveAlertHistoryInput) => {
  const [alertHistory] = await db("alert_history")
    .insert({
      user_id: userId,
      tracker_id: trackerId,
      change_log_id: changeLogId,
      recipient: recipient,
      sent_at: new Date(), // when joborg sent the alert
      // recipient_email: recipient,
      message,
      channel,
      status,
      // error_message: errorMessage || null,
    })
    .returning("*");

  return alertHistory;
};
