import express from 'express';
import * as alertsController from '../controllers/alerts.controller.js';
import { authorization } from '../middlewares/authorization.js';

const router = express.Router();

router.route("/").get(authorization, alertsController.getAlerts);
router.get("/tracker/:trackerId", authorization, alertsController.getAlertsByTracker);

export default router;