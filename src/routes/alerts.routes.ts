import express from 'express';
import * as alertsController from '../controllers/alerts.controller.js';
import { authorization } from '../middlewares/authorization.js';

const router = express.Router();

router.route("/").get(authorization, alertsController.getAlerts);
// router.route("/:id").get(authorization, alertsController.alert);


export default router;