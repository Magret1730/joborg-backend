import type { Request, Response } from "express";
import db from "../db/connection.js";

export const getAlerts = async (req: Request, res: Response) => {
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
        "alert_history.recipient",
        "alert_history.message",
        "alert_history.channel",
        "alert_history.status",
        // "alert_history.error_message",
        "alert_history.sent_at",

        "trackers.company_name",
        "trackers.label",
        "trackers.url",

        "change_logs.detected_at" // when Joborg found the change
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

export const getAlertsByTracker = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { trackerId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    if (!trackerId) {
      return res.status(400).json({
        success: false,
        message: "Tracker ID is required.",
      });
    }

    const alerts = await db("alert_history")
      .join("trackers", "alert_history.tracker_id", "trackers.id")
      .leftJoin("change_logs", "alert_history.change_log_id", "change_logs.id")
      .where("trackers.user_id", userId)
      .andWhere("alert_history.tracker_id", trackerId)
      .select(
        "alert_history.id",
        "alert_history.tracker_id",
        "alert_history.change_log_id",
        "alert_history.recipient",
        "alert_history.message",
        "alert_history.channel",
        "alert_history.status",
        "alert_history.sent_at",

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
    console.error("Error fetching tracker alerts:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tracker alert history.",
    });
  }
};