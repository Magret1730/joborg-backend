import type { Request, Response } from "express";
import { checkAllActiveTrackers } from "../services/check-all-active-trackers.js";

let isCronRunning = false;

export const runCronJob = async (req: Request, res: Response) => {
  try {
    const cronSecret = req.headers["x-cron-secret"]; // This protects the route

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

    if (isCronRunning) { // This prevents duplicate runs
      return res.status(202).json({
        success: true,
        message: "Tracker check is already running.",
      });
    }

    isCronRunning = true; // This marks the job as running

    // This replies quickly to cron-job.org - Sends response first, then runs the tracker check in the background
    res.status(202).json({
      success: true,
      message: "Tracker check started.",
    });

    setImmediate(async () => { // This runs the trackers in the background
      try {
        console.log("External cron job started:", new Date().toISOString());

        await checkAllActiveTrackers(); // This runs the tracker check

        console.log("External cron job completed:", new Date().toISOString());
      } catch (error) {
        console.error("External cron job failed:", error);
      } finally {
        isCronRunning = false; // This resets the job after the job finishes
      }
    });

    // Did this because
    // 1. Send response first
    // 2. Then run tracker check after
    // So cron-job.org does not timeout.
  } catch (error) {
    console.error("Error running external cron job:", error);

    isCronRunning = false;

    return res.status(500).json({
      success: false,
      message: "Failed to run tracker check.",
    });
  }
};
