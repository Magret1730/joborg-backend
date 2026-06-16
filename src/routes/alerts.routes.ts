import express from 'express';
import * as alertsController from '../controllers/alerts.controller.js';
import { authorization } from '../middlewares/authorization.js';

const router = express.Router();

router.route("/alerts").post(authorization, alertsController.alerts);

export default router;