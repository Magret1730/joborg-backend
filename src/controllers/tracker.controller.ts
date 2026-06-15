import db from "../db/connection.js";
import type { Request, Response } from "express";
import { detectCareerPage } from "../services/career-page-detection.service.js";
import { createHash } from "../services/hash-html.service.js";
import { cleanHtml } from "../services/html-cleaning.service.js";
import { fetchPageHtml } from "../services/page-fetch.service.js";
import { validateUrl } from "../services/url-validation.service.js";
import type { TrackerRequestDto } from "../dtos/tracker-dto.js";

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


