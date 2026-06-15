import express from 'express';
import * as userController from '../controllers/user-controller.js';
import { authorization } from '../middlewares/authorization.js';

const router = express.Router();

router.route("/me/:id").get(authorization, userController.me);

export default router;