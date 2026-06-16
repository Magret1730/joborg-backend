import cron from "node-cron";
import db from "../db/connection.js";
import { checkTrackerForChanges } from "./tracker-change.service.js";

const TRACKER_CHECK_SCHEDULE = "0 */6 * * *"; // every 6 hours

export const startScheduler = () => {
  const schedulerEnabled = process.env.ENABLE_SCHEDULER;
  if (schedulerEnabled === undefined) {
    console.warn("ENABLE_SCHEDULER environment variable is not set. Scheduler will be disabled by default.");
  }

  if (!schedulerEnabled) {
    console.log("Scheduler is disabled.");
    return;
  }

  console.log("Scheduler is enabled.");
  console.log("Registering tracker check job...");

  cron.schedule(TRACKER_CHECK_SCHEDULE, async () => {
    console.log(`[${new Date().toISOString()}] Tracker check job started.`);

    try {
      const activeTrackers = await db("trackers")
        .where({ status: "ACTIVE" })
        .select("id");

      console.log(`Found ${activeTrackers.length} active tracker(s).`);

      for (const tracker of activeTrackers) {
        const result = await checkTrackerForChanges(tracker.id);

        console.log({
          trackerId: tracker.id,
          success: result.success,
          changed: result.changed,
          message: result.message,
        });
      }

      console.log(`[${new Date().toISOString()}] Tracker check job completed.`);
    } catch (error) {
      console.error("Tracker check job failed:", error);
    }
  });

  console.log("Tracker check job registered successfully.");
};