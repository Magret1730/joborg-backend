import db from "../db/connection.js";
import { checkTrackerForChanges } from "./check-tracker-for-changes.service.js";
import { sendMail } from "../utils/mailer.js";
import { trackerChangeEmailTemplate } from "../utils/email-templates/tracker-email-template.js";
import { saveAlertHistory } from "./save-alert-history.service.js";

type ActiveTrackerRow = {
  id: string;
  user_id: string;
  company_name: string;
  label: string | null;
  url: string;
  status: string;
  user_email: string;
};

export const checkAllActiveTrackers = async () => {
  console.log(`[${new Date().toISOString()}] Active tracker cron started`);

  // Fetch all active trackers with user email in a
  // single query to minimize database calls
  const activeTrackers = await db("trackers")
    .join("users", "trackers.user_id", "users.id")
    .where("trackers.status", "ACTIVE")
    .select(
      "trackers.id",
      "trackers.user_id",
      "trackers.company_name",
      "trackers.label",
      "trackers.url",
      "trackers.status",
      "users.email as user_email"
    );

  // If there are no active trackers, we can exit early
  if (activeTrackers.length === 0) {
    console.log("No active trackers found.");
    return {
      success: true,
      checked: 0,
      changed: 0,
      failed: 0,
      message: "No active trackers found.",
    };
  }

  let checkedCount = 0;
  let changedCount = 0;
  let failedCount = 0;

  for (const tracker of activeTrackers as ActiveTrackerRow[]) {
    try {
      checkedCount++;

      // Important: we check each tracker sequentially to avoid
      // overwhelming the server or sending too many emails at once.
      const checkResult = await checkTrackerForChanges(tracker.id);

      // If the check itself failed (e.g. network error, parsing error),
      if (!checkResult.success) {
        console.log({
          trackerId: tracker.id,
          trackerLabel: tracker.label,
          success: false,
          message: checkResult.message,
        });

        continue;
      }

      // If the check succeeded but no changes were detected, we can log that and move on.
      if (!checkResult.changed) {
        console.log({
          trackerId: tracker.id,
          trackerLabel: tracker.label,
          changed: false,
          message: "No changes detected.",
        });

        continue;
      }

      changedCount++;

      // If changes were detected, we expect a change log to be returned.
      if (!checkResult.changeLog) {
        console.log({
          trackerId: tracker.id,
          trackerLabel: tracker.label,
          changed: true,
          message: "Change detected, but no change log was returned.",
        });

        continue;
      }

      // At this point, we have a successful check with changes
      // detected and a change log available.
      const changeLog = checkResult.changeLog as { id: string };

      try {
        await sendMail({
          to: tracker.user_email,
          subject: `Change detected on ${tracker.company_name} careers page`,
          html: await trackerChangeEmailTemplate(tracker),
        });

        await saveAlertHistory({
          userId: tracker.user_id,
          trackerId: tracker.id,
          changeLogId: changeLog.id,
          recipient: tracker.user_email,
          message: `Change detected on ${tracker.company_name} careers page.`,
          channel: "email",
          status: "sent",
        });

        console.log({
          trackerId: tracker.id,
          trackerLabel: tracker.label,
          email: tracker.user_email,
          alertStatus: "sent",
        });
      } catch (emailError) {
        await saveAlertHistory({
          userId: tracker.user_id,
          trackerId: tracker.id,
          changeLogId: changeLog.id,
          recipient: tracker.user_email,
          message: `Failed to send change alert for ${tracker.company_name}.`,
          channel: "email",
          status: "failed",
          // errorMessage:
          //   emailError instanceof Error ? emailError.message : "Unknown email error",
        });

        console.error("Email failed for tracker:", tracker.id, emailError);
      }
    } catch (trackerError) {
      failedCount++;

      console.error(
        `Tracker check failed for tracker ${tracker.id}:`,
        tracker.label,
        trackerError
      );

      // Important: Do not throw here.
      // This allows the cron job to continue checking other trackers.
      continue;
    }
  }

  console.log(`[${new Date().toISOString()}] Active tracker cron completed`);

  return {
    success: true,
    checked: checkedCount,
    changed: changedCount,
    failed: failedCount,
    message: "Active tracker cron completed.",
  };
};