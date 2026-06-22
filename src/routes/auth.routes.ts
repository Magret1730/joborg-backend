import express from 'express';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.route("/register").post(authController.register);
router.route("/login").post(authController.login);
router.route("/forgot-password").post(authController.forgotPassword);
router.route("/reset-password").post(authController.resetPassword);
router.route("/verify-email").post(authController.verifyEmail);
router.route("/resend-verification").post(authController.resendVerificationEmail);

export default router;