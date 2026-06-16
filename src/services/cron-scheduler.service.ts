import cron from "node-cron";
import { checkAllActiveTrackers } from "./check-all-active-trackers.js";

const TRACKER_CHECK_SCHEDULE = "0 */6 * * *";

export const startScheduler = () => {
  const schedulerEnabled = process.env.ENABLE_SCHEDULER === "true";

  if (!schedulerEnabled) {
    console.log("Scheduler is disabled.");
    return;
  }

  console.log("Scheduler is enabled.");

  cron.schedule(TRACKER_CHECK_SCHEDULE, async () => {
    await checkAllActiveTrackers();
  });

  console.log("Active tracker cron job registered.");
};