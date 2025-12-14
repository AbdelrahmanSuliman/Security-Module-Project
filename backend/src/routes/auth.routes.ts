import { initiateLoginController, verifyLoginCodeController} from './../controllers/auth.controller';
import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { passwordResetSchema } from "../types/resetPassword.type";
import { loginRateLimiter, mfaRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.post("/login", loginRateLimiter, initiateLoginController);
router.post("/login/verify", mfaRateLimiter, verifyLoginCodeController);
router.post("/logout", authController.logoutController);


router.post("/request-password-reset", loginRateLimiter,authController.requestPasswordResetController);
router.post("/reset-password", validate(passwordResetSchema), authController.resetPasswordController);

export default router;
