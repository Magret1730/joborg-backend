import { Request, Response } from "express";
import db from "../db/connection.js";

type SaveAlertHistoryInput = { // REDO
  trackerId: string;
  changeLogId: string;
  recipientEmail: string;
  message: string;
  channel?: "email";
  status: "sent" | "failed";
  errorMessage?: string;
};

export const alerts = async (req: Request, res: Response) => {
  try {
    const { userId, trackerId, changeLogId, channel, recipient, message } = req.body;

    
  } catch (error) {
    console.error("Error sending alert:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send alert",
    });
  }
}