import express from 'express';
import * as CronJob from '../controllers/cron-jobs.controller.js';

const router = express.Router();

router.route("/").get(CronJob.runCronJob); // Run cron jobs

export default router;