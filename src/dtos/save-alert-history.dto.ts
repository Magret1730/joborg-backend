export type SaveAlertHistoryInput = {
  trackerId: string;
  changeLogId: string;
  recipient: string;
  message: string;
  channel?: "email";
  status: "sent" | "failed";
  // errorMessage?: string;
};
