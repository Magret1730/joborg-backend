import { ALERT_STATUS } from "../constants/alert/alertStatus.js";
import { ALERT_CHANNEL } from "../constants/alert/alertChannel.js"; 

export type SaveAlertHistoryInput = {
  userId: string;
  trackerId: string;
  changeLogId: string;
  recipient: string;
  message: string;
  channel?: typeof ALERT_CHANNEL[keyof typeof ALERT_CHANNEL];
  // channel?: "email";
  status: typeof ALERT_STATUS[keyof typeof ALERT_STATUS];
  // status: ALERT_STATUS.SENT | "failed";
  // status: "sent" | "failed";
  // errorMessage?: string;
};
