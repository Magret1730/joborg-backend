import express from 'express';
import * as changeLogsController from '../controllers/change-logs.controller.js';
import { authorization } from '../middlewares/authorization.js';

const router = express.Router();

router.route("/").get(authorization, changeLogsController.changes);
router.route("/tracker/:trackerId/changes-by-tracker").get(authorization, changeLogsController.getChangesByTracker);
router.route("/tracker/:trackerId").get(authorization, changeLogsController.changeById);

export default router;