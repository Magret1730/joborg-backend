import { fetchPageHtml } from "./fetch-page-html.service.js";
import { cleanHtml } from "./clean-html.service.js";
import { createHash } from "./create-hash.service.js";
import db from "../db/connection.js";

type TrackerCheckResult = {
  success: boolean;
  changed?: boolean;
  message: string;
  trackerId?: string;
  oldHash?: string;
  newHash?: string;
  changeLog?: unknown;
};

// To prevent excessive checks and reduce load on the target websites, we can implement a cooldown mechanism.
const CHECK_COOLDOWN_MINUTES = 5;

export const checkTrackerForChanges = async (
  trackerId: string
): Promise<TrackerCheckResult> => {
  // Fetch the tracker from the database using the provided trackerId.
  const tracker = await db("trackers")
    .where({ id: trackerId })
    .first();

  if (!tracker) {
    return {
      success: false,
      message: "Tracker not found.",
    };
  }

  // Rate limit: prevent checking the same tracker too frequently
  // if (tracker.last_checked_at) {
  //   const lastCheckedAt = new Date(tracker.last_checked_at);
  //   const now = new Date();

  //   const minutesSinceLastCheck =
  //     (now.getTime() - lastCheckedAt.getTime()) / (1000 * 60);

  //   // If the last check was performed within the cooldown period,
  //   // we return a message indicating that the user should wait before checking again.
  //   if (minutesSinceLastCheck < CHECK_COOLDOWN_MINUTES) {
  //     const minutesRemaining = Math.ceil(
  //       CHECK_COOLDOWN_MINUTES - minutesSinceLastCheck
  //     );

  //     return {
  //       success: false,
  //       changed: false,
  //       trackerId: tracker.id,
  //       message: `This tracker was checked recently. Please try again in ${minutesRemaining} minute(s).`,
  //     };
  //   }
  // }

  // Fetch the current HTML content of the tracker's URL.
  const fetchResult = await fetchPageHtml(tracker.url);

  if (!fetchResult.success || !fetchResult.html) {
    return {
      success: false,
      message: fetchResult.error || "Failed to fetch page HTML.",
    };
  }

  // Clean the fetched HTML content to remove dynamic elements and focus on meaningful changes.
  const cleanedHtml = cleanHtml(fetchResult.html);

  if (!cleanedHtml) {
    return {
      success: false,
      message: "Failed to clean HTML content.",
    };
  }

  // Create a hash of the cleaned HTML content to compare with the last known hash stored in the tracker.
  const newHash = createHash(cleanedHtml);

  if (!newHash) {
    return {
      success: false,
      message: "Failed to create hash of HTML content.",
    };
  }

  const now = new Date();

  // If the new hash matches the last hash stored in the tracker, it means no changes have been detected.
  if (newHash === tracker.last_hash) {
    await db("trackers")
      .where({ id: tracker.id })
      .update({
        last_checked_at: now,
      });

    return {
      success: true,
      changed: false,
      message: "No changes detected.",
      trackerId: tracker.id,
      oldHash: tracker.last_hash,
      newHash,
    };
  }

  // If the new hash is different from the last hash, it means changes have been detected.
  // We need to log this change in the change_logs table and update the tracker with the new hash and timestamps.
  const [changeLog] = await db("change_logs")
    .insert({
      tracker_id: tracker.id,
      old_hash: tracker.last_hash,
      new_hash: newHash,
      detected_at: now,
    })
    .returning("*");

  // Update the tracker with the new hash and timestamps for last checked and last changed.
  await db("trackers")
    .where({ id: tracker.id })
    .update({
      last_hash: newHash,
      last_checked_at: now,
      last_changed_at: now,
    });

  return {
    success: true,
    changed: true,
    message: "Changes detected.",
    trackerId: tracker.id,
    oldHash: tracker.last_hash,
    newHash,
    changeLog,
  };
};