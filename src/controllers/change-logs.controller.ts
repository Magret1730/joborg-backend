import db from "../db/connection.js";
import type { Request, Response } from "express";

export const changes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const changeLogs = await db("change_logs")
      .join("trackers", "change_logs.tracker_id", "trackers.id")
      .where("trackers.user_id", userId)
      .select(
        "change_logs.id",
        "change_logs.tracker_id",
        "change_logs.old_hash",
        "change_logs.new_hash",
        "change_logs.detected_at",
        "change_logs.notification_sent",
        "change_logs.created_at",
        "change_logs.updated_at",

        "trackers.company_name",
        "trackers.label",
        "trackers.url",
        "trackers.status"
      )
      .orderBy("change_logs.created_at", "desc");

    if (changeLogs.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No change logs found for the user.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Change logs fetched successfully.",
      data: changeLogs,
    });
  } catch (error) {
    console.error("Error fetching change logs:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching change logs.",
      data: [],
    });
  }
};

// Get change log by tracker ID for the authenticated user
export const changeById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { trackerId } = req.params;

    console.log(`Fetching change log for tracker ID: ${trackerId} and user ID: ${userId}`);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
        data: [],
      });
    }

    if (!trackerId) {
      return res.status(400).json({
        success: false,
        message: "Tracker ID is required.",
        data: [],
      });
    }

    const changeLog = await db("change_logs")
      .join("trackers", "change_logs.tracker_id", "trackers.id")
      .where("change_logs.tracker_id", trackerId)
      .andWhere("trackers.user_id", userId)
      .select(
        "change_logs.id",
        "change_logs.tracker_id",
        "change_logs.old_hash",
        "change_logs.new_hash",
        "change_logs.detected_at",
        "change_logs.notification_sent",
        "change_logs.created_at",
        "change_logs.updated_at",

        "trackers.company_name",
        "trackers.label",
        "trackers.url",
        "trackers.status"
      )
      .orderBy("change_logs.detected_at", "desc")
      .first();

    if (!changeLog) {
      return res.status(404).json({
        success: false,
        message: "Change log not found.",
        data: [],
      });
    }

    console.log(`Fetched change log for tracker ID ${trackerId}:`, changeLog);

    return res.status(200).json({
      success: true,
      message: "Tracker changes fetched successfully.",
      data: changeLog,
    });
  } catch (error) {
    console.error("Error fetching change log:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the change log.",
      data: [],
    });
  }
};

// Get changes of a tracker by tracker ID for the authenticated user
export const getChangesByTracker = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { trackerId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
        data: [],
      });
    }

    if (!trackerId) {
      return res.status(400).json({
        success: false,
        message: "Tracker ID is required.",
        data: [],
      });
    }

    const changeLogs = await db("change_logs")
      .join("trackers", "change_logs.tracker_id", "trackers.id")
      .where("trackers.user_id", userId)
      .andWhere("change_logs.tracker_id", trackerId)
      .select(
        "change_logs.id",
        "change_logs.tracker_id",
        "change_logs.old_hash",
        "change_logs.new_hash",
        "change_logs.detected_at",
        "change_logs.notification_sent",
        "change_logs.created_at",
        "change_logs.updated_at",
        "trackers.company_name",
        "trackers.label",
        "trackers.url",
        "trackers.status"
      )
      .orderBy("change_logs.created_at", "desc");

    return res.status(200).json({
      success: true,
      message: "Tracker changes fetched successfully.",
      data: changeLogs,
    });
  } catch (error) {
    console.error("Error fetching tracker changes:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tracker changes.",
      data: [],
    });
  }
};