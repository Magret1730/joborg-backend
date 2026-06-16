import type { Request, Response } from "express";
import db from "../db/connection.js";

export const alerts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const alerts = await db("alert_history")
      .join("trackers", "alert_history.tracker_id", "trackers.id")
      .leftJoin("change_logs", "alert_history.change_log_id", "change_logs.id")
      .where("trackers.user_id", userId)
      .select(
        "alert_history.id",
        "alert_history.tracker_id",
        "alert_history.change_log_id",
        "alert_history.recipient_email",
        "alert_history.message",
        "alert_history.channel",
        "alert_history.status",
        "alert_history.error_message",
        "alert_history.created_at",

        "trackers.company_name",
        "trackers.label",
        "trackers.url",

        "change_logs.detected_at"
      )
      .orderBy("alert_history.created_at", "desc");

    return res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch alert history.",
    });
  }
};