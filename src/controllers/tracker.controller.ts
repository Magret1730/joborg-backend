import db from "../db/connection.js";
import type { Request, Response } from "express";
import { detectCareerPage } from "../services/career-page-detection.service.js";
import { createHash } from "../services/create-hash.service.js";
import { cleanHtml } from "../services/clean-html.service.js";
import { fetchStaticPageHtml } from "../services/scraper/fetch-static-page-html.service.js";
import { validateUrl } from "../services/url-validation.service.js";
import type { TrackerRequestDto } from "../dtos/tracker.dto.js";
import { checkTrackerForChanges } from "../services/check-tracker-for-changes.service.js";
import { sendMail } from "../utils/mailer.js";
import { trackerChangeEmailTemplate } from "../utils/email-templates/tracker-email-template.js";
import { checkAllActiveTrackers } from "../services/check-all-active-trackers.js";
import { TRACKER_STATUS } from "../constants/tracker/trackerStatus.js";
import { fetchPageHtml } from "../services/scraper/fetch-page-html.js";
import {
  SCRAPER_TYPE,
  type ScraperType,
} from "../constants/scraper.constants.js";

export const postTracker = async (req: Request, res: Response) => {
  try {
    const { url, label, company_name, scraper_type } = req.body;
    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    // Validate the URL
    const validationResult = validateUrl(url);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: validationResult.message,
      });
    }

    // Default to AUTO unless the frontend sends STATIC or BROWSER
    const requestedScraperType: ScraperType =
      scraper_type && Object.values(SCRAPER_TYPE).includes(scraper_type)
        ? scraper_type
        : SCRAPER_TYPE.AUTO;

    // Fetch the page HTML
    const fetchResult = await fetchPageHtml(url, requestedScraperType);
    // const fetchResult = await fetchStaticPageHtml(url);
    if (!fetchResult.success) {
      return res.status(400).json({
        success: false,
        message: fetchResult.error,
      });
    }

    // Clean the HTML
    const cleanedHtml = fetchResult.html ? cleanHtml(fetchResult.html) : "";
    if (!cleanedHtml) {
      return res.status(400).json({
        success: false,
        message: "Failed to clean HTML content.",
      });
    }

    // Check if it's a career page
    const careerPageResult = detectCareerPage(url, cleanedHtml);
    console.log(`Career page detection result for ${url}:`, careerPageResult);
    if (!careerPageResult.isCareerPage) {
      return res.status(400).json({
        success: false,
        message: "The provided URL does not appear to be a career page.",
      });
    }

    // Create a hash of the cleaned HTML content to track changes over time
    const htmlHash = createHash(cleanedHtml);
    if (!htmlHash) {
      return res.status(500).json({
        success: false,
        message: "Failed to create hash of HTML content.",
      });
    }

    const result = await db("trackers")
      .insert({
        user_id: req.user.id,
        company_name: company_name,
        label: label,
        url,
        last_hash: htmlHash,
        last_checked_at: new Date(),
        last_changed_at: new Date(),
        scraper_type: SCRAPER_TYPE.AUTO,
      })
      .returning([
        "id",
        "company_name",
        "label",
        "url",
        "status",
        "last_hash",
        "last_checked_at",
        "last_changed_at",
        "scraper_type",
      ]);
    if (!result || result.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to create tracker.",
      });
    }

    res.status(201).json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error("Error posting tracker:", error);
    res.status(500).json({
      success: false,
      message: "Server error while posting tracker",
    });
  }
};

export const getTrackers = async (req: Request, res: Response) => {
  try {
    const trackers = await db("trackers")
      .where({ user_id: req.user.id })
      .select(
        "id",
        "company_name",
        "label",
        "url",
        "status",
        "last_hash",
        "last_checked_at",
        "last_changed_at",
        "scraper_type"
      );

    if (!trackers) {
      return res.status(404).json({
        success: false,
        message: "No trackers found for this user.",
      });
    }

    res.json({
      success: true,
      data: trackers,
    });
  } catch (error) {
    console.error("Error fetching trackers:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching trackers",
    });
  }
};

export const getTracker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Tracker ID is required.",
      });
    }

    // Ensure the tracker belongs to the authenticated user
    const tracker = await db("trackers")
      .where({ id, user_id: req.user.id })
      .first(
        "id",
        "company_name",
        "label",
        "url",
        "status",
        "last_hash",
        "last_checked_at",
        "last_changed_at",
        "scraper_type"
      );

    if (!tracker) {
      return res.status(404).json({
        success: false,
        message: "Tracker not found for this user.",
      });
    }

    res.json({
      success: true,
      data: tracker,
    });
  } catch (error) {
    console.error("Error fetching tracker:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching tracker",
    });
  }
};

export const deleteTracker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Tracker ID is required.",
      });
    }

    const deleted = await db("trackers")
      .where({ id, user_id: req.user.id })
      .del();

    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: "Tracker not found or not owned by user.",
      });
    }

    res.json({
      success: true,
      message: "Tracker deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting tracker:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting tracker",
    });
  }
};

export const updateTracker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { url, label, company_name } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Tracker ID is required.",
      });
    }

    const updateData: TrackerRequestDto = {};
    if (url) updateData.url = url;
    if (label) updateData.label = label;
    if (company_name) updateData.company_name = company_name;

    const updated = await db("trackers")
      .where({ id, user_id: req.user.id })
      .update(updateData);

    if (updated === 0) {
      return res.status(404).json({
        success: false,
        message: "Tracker not found or not owned by user.",
      });
    }

    res.json({
      success: true,
      data: {
        id,
        ...updateData,
      },
      message: "Tracker updated successfully.",
    });
  } catch (error) {
    console.error("Error updating tracker:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating tracker",
    });
  }
};

export const pauseTracker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Tracker ID is required.",
      });
    }

    const updated = await db("trackers")
      .where({ id, user_id: req.user.id })
      .update({ status: TRACKER_STATUS.PAUSED });

    if (updated === 0) {
      return res.status(404).json({
        success: false,
        message: "Tracker not found or not owned by user.",
      });
    }

    res.json({
      success: true,
      message: "Tracker paused successfully.",
    });
  } catch (error) {
    console.error("Error pausing tracker:", error);
    res.status(500).json({
      success: false,
      message: "Server error while pausing tracker",
    });
  }
};

export const resumeTracker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Tracker ID is required.",
      });
    }

    const updated = await db("trackers")
      .where({ id, user_id: req.user.id })
      .update({ status: TRACKER_STATUS.ACTIVE });

    if (updated === 0) {
      return res.status(404).json({
        success: false,
        message: "Tracker not found or not owned by user.",
      });
    }

    res.json({
      success: true,
      data: updated,
      message: "Tracker resumed successfully.",
    });
  } catch (error) {
    console.error("Error resuming tracker:", error);
    res.status(500).json({
      success: false,
      message: "Server error while resuming tracker",
    });
  }
};

export const checkNowTrackerByID = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Tracker ID is required.",
      });
    }

    // Ensure the tracker belongs to the authenticated user
    const tracker = await db("trackers")
      .where({ id, user_id: req.user.id })
      .first(
        "id",
        "company_name",
        "label",
        "url",
        "status",
        "last_hash",
        "last_checked_at",
        "last_changed_at",
        "scraper_type"
      );

    if (!tracker) {
      return res.status(404).json({
        success: false,
        message: "Tracker not found for this user.",
      });
    }

    // Tracker check service
    const checkResult = await checkTrackerForChanges(
      Array.isArray(id) ? id[0] : id
    );
    if (!checkResult.success) {
      return res.status(400).json({
        success: false,
        message: checkResult.message,
      });
    }

    // If changed, send email notification
    if (checkResult.changed) {
      await sendMail({
        to: req.user.email,
        subject: `Change detected on ${tracker.company_name} Careers page`,
        html: await trackerChangeEmailTemplate(tracker),
      });
    }

    res.json({
      success: true,
      message: "Tracker checked for changes successfully.",
      data: checkResult,
    });
  } catch (error) {
    console.error("Error checking tracker:", error);
    res.status(500).json({
      success: false,
      message: "Server error while checking tracker",
    });
  }
};

// Will not implement this in frontend
export const checkNowAllTrackers = async (req: Request, res: Response) => {
  const result = await checkAllActiveTrackers();

  return res.status(200).json(result);
  // try{
  //   // Get all active trackers
  //   const trackers = await db("trackers")
  //     .join("users", "trackers.user_id", "users.id")
  //     .where("trackers.status", "ACTIVE")
  //     .select(
  //       "trackers.id",
  //       "trackers.company_name",
  //       "trackers.label",
  //       "trackers.url",
  //       "trackers.status",
  //       "users.email as user_email"
  //     );

  //   if (trackers.length === 0) {
  //     res.status(200).json({
  //       success: true,
  //       message: "No active trackers",
  //     });
  //   }

  //   const results = [];

  //   for (const tracker of trackers ) {
  //     try {
  //       // Tracker check service
  //       const checkResult = await checkTrackerForChanges(tracker.id);
  //       if (!checkResult.success) {
  //         results.push({
  //           trackerId: tracker.id,
  //           companyName: tracker.company_name,
  //           success: false,
  //           changed: false,
  //           message: checkResult.message,
  //         });

  //         continue;
  //       }

  //       // If changed, send email notification
  //       if (checkResult.changed) {
  //         await sendMail({
  //           to: req.user.email,
  //           subject: `Change detected on ${tracker.company_name} Careers page`,
  //           html: await trackerChangeEmailTemplate(tracker),
  //         });
  //       }

  //       results.push({
  //         trackerId: tracker.id,
  //         companyName: tracker.company_name,
  //         success: true,
  //         changed: checkResult.changed,
  //         message: checkResult.message,
  //         data: checkResult,
  //       });
  //     } catch (trackerError) {
  //       console.error(`Error checking tracker ${tracker.id}:`, trackerError);

  //       results.push({
  //         trackerId: tracker.id,
  //         companyName: tracker.company_name,
  //         success: false,
  //         changed: false,
  //         message: "Failed to check this tracker.",
  //       });

  //       continue;
  //     }
  //   }

  //   return res.status(200).json({
  //     success: true,
  //     message: "All active trackers checked.",
  //     checked: results.length,
  //     data: results,
  //   });
  // } catch (error) {
  //   console.error("Error checking all trackers:", error);
  //   res.status(500).json({
  //     success: false,
  //     message: "Server error while checking all trackers",
  //   });
  // }
}
