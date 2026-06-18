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

      const checkResult = await checkTrackerForChanges(tracker.id);

      if (!checkResult.success) {
        console.log({
          trackerId: tracker.id,
          success: false,
          message: checkResult.message,
        });

        continue;
      }

      if (!checkResult.changed) {
        console.log({
          trackerId: tracker.id,
          changed: false,
          message: "No changes detected.",
        });

        continue;
      }

      changedCount++;

      if (!checkResult.changeLog) {
        console.log({
          trackerId: tracker.id,
          changed: true,
          message: "Change detected, but no change log was returned.",
        });

        continue;
      }

      const changeLog = checkResult.changeLog as { id: string };

      try {
        await sendMail({
          to: tracker.user_email,
          subject: `Change detected on ${tracker.company_name} careers page`,
          html: await trackerChangeEmailTemplate(tracker),
        });

        await saveAlertHistory({
          trackerId: tracker.id,
          changeLogId: changeLog.id,
          recipient: tracker.user_email,
          message: `Change detected on ${tracker.company_name} careers page.`,
          channel: "email",
          status: "sent",
        });

        console.log({
          trackerId: tracker.id,
          email: tracker.user_email,
          alertStatus: "sent",
        });
      } catch (emailError) {
        await saveAlertHistory({
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
        trackerError
      );

      // Important: do not throw here.
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