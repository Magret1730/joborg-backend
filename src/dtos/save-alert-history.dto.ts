export type SaveAlertHistoryInput = {
  trackerId: string;
  changeLogId: string;
  recipientEmail: string;
  message: string;
  channel?: "email";
  status: "sent" | "failed";
  errorMessage?: string;
};
