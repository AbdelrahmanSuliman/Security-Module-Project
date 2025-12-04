import { initiateLoginController, verifyLoginCodeController} from './../controllers/auth.controller';
import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { passwordResetSchema } from "../types/resetPassword.type";

const router = Router();

router.post("/login", initiateLoginController);
router.post("/login/verify", verifyLoginCodeController);


router.post("/request-password-reset", authController.requestPasswordResetController);
router.post("/reset-password", validate(passwordResetSchema), authController.resetPasswordController);

export default router;
