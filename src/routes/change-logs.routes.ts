import express from 'express';
import * as changeLogsController from '../controllers/change-logs.controller.js';
import { authorization } from '../middlewares/authorization.js';

const router = express.Router();

router.route("/changes").get(authorization, changeLogsController.changes);
router.route("/changes/:id").get(authorization, changeLogsController.changeById);

export default router;