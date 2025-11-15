import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { AppError } from "../utils/errors";
import { generateToken } from "../middleware/generateToken.middleware";
import { logger } from "../utils/logger";


export const requestPasswordResetController = async (req: Request, res: Response) => {
  try {
    await authService.requestPasswordResetService(
      req.body.email,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      message: "Password reset code generated (check console for code)",
    });
  } catch (err: any) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    logger.error(err, "Unexpected password reset request error");
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;

    const result = await authService.resetPasswordService(
      email,
      code,
      newPassword,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json(result);
  } catch (err: any) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    logger.error(err, "Unexpected password reset error");
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const user = await authService.loginService(req.body.email, req.body.password);

    return res.status(200).json({
      message: "Login successful",
      role: user.role,
      token: generateToken(user),
    });
  } catch (err: any) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    logger.error(err, "Unexpected login error");
    return res.status(500).json({ message: "Internal server error" });
  }
};
