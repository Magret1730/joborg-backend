import express from 'express';
import * as trackerController from '../controllers/tracker.controller.js';
import { authorization } from '../middlewares/authorization.js';

const router = express.Router();

router.route("/").post(authorization, trackerController.postTracker);

export default router;