import express from 'express';
import * as trackerController from '../controllers/tracker.controller.js';
import { authorization } from '../middlewares/authorization.js';
import { manualTrackerCheckLimiter } from '../middlewares/rate-limit.middleware.js';

const router = express.Router();

router.route("/").post(authorization, trackerController.postTracker);
router.route("/").get(authorization, trackerController.getTrackers);
router.route("/:id").get(authorization, trackerController.getTracker);
router.route("/:id").put(authorization, trackerController.updateTracker);
router.route("/").delete(authorization, trackerController.deleteTracker);
router.route("/:id/pause").patch(authorization, trackerController.pauseTracker);
router.route("/:id/resume").patch(authorization, trackerController.resumeTracker);
router.route("/:id/check-now").post(authorization, manualTrackerCheckLimiter, trackerController.checkNowTracker);

export default router;