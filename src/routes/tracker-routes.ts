import express from 'express';
import * as trackerController from '../controllers/tracker.controller.js';
import { authorization } from '../middlewares/authorization.js';

const router = express.Router();

router.route("/").post(authorization, trackerController.postTracker);
router.route("/").get(authorization, trackerController.getTrackers);
router.route("/:id").get(authorization, trackerController.getTracker);
router.route("/:id").put(authorization, trackerController.updateTracker);
router.route("/").delete(authorization, trackerController.deleteTracker);
router.route("/:id/pause").post(authorization, trackerController.pauseTracker);

export default router;