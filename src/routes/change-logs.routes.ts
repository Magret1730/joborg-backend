import express from 'express';
import * as changeLogsController from '../controllers/change-logs.controller.js';
import { authorization } from '../middlewares/authorization.js';

const router = express.Router();

router.route("/changes").get(authorization, changeLogsController.changes);

export default router;