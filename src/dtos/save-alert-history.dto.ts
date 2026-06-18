export type SaveAlertHistoryInput = {
  userId: string;
  trackerId: string;
  changeLogId: string;
  recipient: string;
  message: string;
  channel?: "email";
  status: "sent" | "failed";
  // errorMessage?: string;
};
