import db from "../db/connection.js";
import type { Request, Response } from "express";
import { detectCareerPage } from "../services/career-page-detection.service.js";
import { createHash } from "../services/hash-html.service.js";
import { cleanHtml } from "../services/html-cleaning.service.js";
import { fetchPageHtml } from "../services/page-fetch.service.js";
import { validateUrl } from "../services/url-validation.service.js";
import type { TrackerRequestDto } from "../dtos/tracker.dto.js";
import { checkTrackerForChanges } from "../services/tracker-change.service.js";
import { sendMail } from "../utils/mailer.js";

export const postTracker = async (req: Request, res: Response) => {
  try {
    const { url, label, company_name } = req.body;
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

    // Fetch the page HTML
    const fetchResult = await fetchPageHtml(url);
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
        "last_changed_at"
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
        "last_changed_at"
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
      .update({ status: "PAUSED" });

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
      .update({ status: "ACTIVE" });

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

export const checkNowTracker = async (req: Request, res: Response) => {
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
        "last_changed_at"
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
        subject: `Change detected for ${tracker.label || tracker.url}`,
        html: `
          <p>Dear ${req.user.first_name},</p>
          <p>A change has been detected on the page you are tracking:</p>
          <p>Company Name: <strong>${tracker.company_name}</strong></p>
          <p>Company Label: <strong>${tracker.label}</strong></p>
          <p>Company URL: <a href="${tracker.url}" target="_blank">${tracker.url}</a></p>
          <p>Please visit the tracker dashboard to see the details of the change.</p>
          <p>Best regards,<br/>Joborg Team</p>
        `,
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
