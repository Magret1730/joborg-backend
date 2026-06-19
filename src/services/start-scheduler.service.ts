import cron from "node-cron";
import { checkAllActiveTrackers } from "./check-all-active-trackers.js";

const TRACKER_CHECK_SCHEDULE = "0 10,14,19 * * *"; // At hour 10am, 2pm and 7pm // minute hour day-of-month month day-of-week
const TRACKER_CHECK_SCHEDULE_EVENING = "33 22 * * *"; // At 10:01pm

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

  cron.schedule(TRACKER_CHECK_SCHEDULE_EVENING, async () => {
    await checkAllActiveTrackers();
  });

  console.log("Active trackers cron job registered.");
};