import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { loginSchema } from "../types/login.type";
import { loginRateLimiter } from "../middleware/rateLimit.middleware";
import { passwordResetSchema } from "../types/resetPassword.type";

const router = Router();

router.post("/login", validate(loginSchema), authController.loginController);

router.post("/request-password-reset", authController.requestPasswordResetController);
router.post("/reset-password", validate(passwordResetSchema), authController.resetPasswordController);

export default router;
