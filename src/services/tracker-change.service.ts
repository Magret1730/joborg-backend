import { fetchPageHtml } from "./page-fetch.service.js";
import { cleanHtml } from "./html-cleaning.service.js";
import { createHash } from "./hash-html.service.js";
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
      changed_at: now,
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