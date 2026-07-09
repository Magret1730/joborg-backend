import type { Request, Response } from "express";
import { checkAllActiveTrackers } from "../services/check-all-active-trackers.js";

let isCronRunning = false;

export const runCronJob = async (req: Request, res: Response) => {
  try {
    const cronSecret = req.headers["x-cron-secret"];

    if (!process.env.CRON_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Cron secret is not configured.",
      });
    }

    if (cronSecret !== process.env.CRON_SECRET) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized cron request.",
      });
    }

    if (isCronRunning) {
      return res.status(409).json({
        success: false,
        message: "Cron job is already running.",
      });
    }

    isCronRunning = true;

    console.log("External cron job started:", new Date().toISOString());

    await checkAllActiveTrackers();

    console.log("External cron job completed:", new Date().toISOString());

    return res.status(200).json({
      success: true,
      message: "Tracker check completed successfully.",
    });
  } catch (error) {
    console.error("Error running external cron job:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to run tracker check.",
    });
  } finally {
    isCronRunning = false;
  }
};