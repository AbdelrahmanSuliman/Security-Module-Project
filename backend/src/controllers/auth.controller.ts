import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { AppError } from "../utils/errors";
import { generateToken } from "../middleware/generateToken.middleware";
import { logger } from "../utils/logger";

export const requestPasswordResetController = async (
  req: Request,
  res: Response
) => {
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

export const initiateLoginController = async (req: Request, res: Response) => {
  try {
    const result = await authService.initiateLoginService(
      req.body.email,
      req.body.password,
      req.ip,
      req.headers["user-agent"]
    );

    return res.status(200).json(result);
  } catch (err: any) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyLoginCodeController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await authService.verifyLoginCodeService(
      req.body.email,
      req.body.code,
      req.ip,
      req.headers["user-agent"]
    );

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: true, 
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      message: "Login successful",
      role: result.role,
    });
  } catch (err: any) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutController = (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  return res.status(200).json({ message: "Logged out successfully" });
};