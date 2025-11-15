import prisma from "../prisma";
import { logger } from "../utils/logger";
import bcrypt from "bcrypt";
import {
  changePasswordError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors";
import { writeAuditLog } from "../utils/audit";
import { encrypt, decrypt } from "../utils/encryptor";
import crypto from "crypto";
const maskEmail = (email: string) => {
  const [user, domain] = email.split("@");
  return `${user[0]}***@${domain}`;
};

export const requestPasswordResetService = async (
  email: string,
  ip?: string,
  userAgent?: string
) => {
  logger.info({ event: "PASSWORD_RESET_REQUEST", email: maskEmail(email) });

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    logger.warn({
      event: "PASSWORD_RESET_USER_NOT_FOUND",
      email: maskEmail(email),
    });

    await writeAuditLog({
      actorId: undefined,
      actorRole: "UNKNOWN",
      action: "PASSWORD_RESET_REQUEST",
      targetType: "USER",
      success: false,
      ip,
      userAgent,
      metadata: { reason: "EMAIL_NOT_FOUND", email: encrypt(email) },
    });

    throw new NotFoundError("User not found");
  }

  const resetCode = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.passwordResetCode.upsert({
    where: { userId: user.id },
    update: { code: resetCode, expiresAt },
    create: { userId: user.id, code: resetCode, expiresAt },
  });

  console.log(`Password reset code for ${email}: ${resetCode}`);

  await writeAuditLog({
    actorId: user.id,
    actorRole: "USER",
    action: "PASSWORD_RESET_REQUEST",
    targetType: "USER",
    targetId: user.id,
    success: true,
    ip,
    userAgent,
    metadata: { email: encrypt(email) },
  });

  logger.info({ event: "PASSWORD_RESET_CODE_GENERATED", userId: user.id });
};

export const resetPasswordService = async (
  email: string,
  code: string,
  newPassword: string,
  ip?: string,
  userAgent?: string
) => {
  logger.info({ event: "PASSWORD_RESET_ATTEMPT", email: maskEmail(email) });

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    logger.warn({
      event: "PASSWORD_RESET_USER_NOT_FOUND",
      email: maskEmail(email),
    });
    throw new NotFoundError("User not found");
  }

  const resetEntry = await prisma.passwordResetCode.findUnique({
    where: { userId: user.id },
  });

  if (!resetEntry || resetEntry.code !== code) {
    logger.warn({ event: "PASSWORD_RESET_INVALID_CODE", userId: user.id });

    await writeAuditLog({
      actorId: user.id,
      actorRole: "USER",
      action: "PASSWORD_RESET",
      targetType: "USER",
      targetId: user.id,
      success: false,
      ip,
      userAgent,
      metadata: { reason: "INVALID_CODE", email: encrypt(email) },
    });

    throw new UnauthorizedError("Invalid or expired reset code");
  }

  if (resetEntry.expiresAt < new Date()) {
    logger.warn({ event: "PASSWORD_RESET_CODE_EXPIRED", userId: user.id });
    throw new UnauthorizedError("Reset code expired");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  await prisma.passwordResetCode.delete({ where: { userId: user.id } });

  logger.info({ event: "PASSWORD_RESET_SUCCESS", userId: user.id });

  await writeAuditLog({
    actorId: user.id,
    actorRole: "USER",
    action: "PASSWORD_RESET",
    targetType: "USER",
    targetId: user.id,
    success: true,
    ip,
    userAgent,
    metadata: { email: encrypt(email) },
  });

  return { message: "Password reset successfully" };
};
export const loginService = async (
  email: string,
  password: string,
  ip?: string,
  userAgent?: string
) => {
  logger.info({ event: "LOGIN_ATTEMPT", email: maskEmail(email) });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const now = new Date();
    

    if (!user) {
      logger.warn({ event: "LOGIN_FAILED_NOT_FOUND", email: maskEmail(email) });

      await writeAuditLog({
        actorId: undefined,
        actorRole: "UNKNOWN",
        action: "LOGIN",
        targetType: "USER",
        success: false,
        ip,
        userAgent,
        metadata: { reason: "EMAIL_NOT_FOUND", email: encrypt(email) },
      });

      throw new UnauthorizedError("Invalid email or password");
    }

    if (
      !user.passwordUpdatedAt ||
      now.getTime() - user.passwordUpdatedAt.getTime() > THIRTY_DAYS_MS
    ) {
      throw new changePasswordError(
        "Password change required. Please update your password."
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      logger.warn({
        event: "LOGIN_FAILED_INVALID_PASSWORD",
        email: maskEmail(email),
      });

      await writeAuditLog({
        actorId: user.id,
        actorRole: "USER",
        action: "LOGIN",
        targetType: "USER",
        targetId: user.id,
        success: false,
        ip,
        userAgent,
        metadata: { reason: "INVALID_PASSWORD", email: encrypt(email) },
      });

      throw new UnauthorizedError("Invalid email or password");
    }

    logger.info({ event: "LOGIN_SUCCESS", userId: user.id });

    await writeAuditLog({
      actorId: user.id,
      actorRole: "USER",
      action: "LOGIN",
      targetType: "USER",
      targetId: user.id,
      success: true,
      ip,
      userAgent,
      metadata: { email: encrypt(email) },
    });

    return user;
  } catch (err: any) {
    logger.error({ event: "LOGIN_ERROR", error: err });

    await writeAuditLog({
      actorId: undefined,
      actorRole: "UNKNOWN",
      action: "LOGIN",
      targetType: "USER",
      success: false,
      ip,
      userAgent,
      metadata: { error: err.message, email: encrypt(email) },
    });

    throw err;
  }
};
