import prisma from "../prisma";

export const writeAuditLog = async (log: {
  actorId?: string;
  actorRole?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  success: boolean;
  ip?: string;
  userAgent?: string;
  metadata?: any;
}) => {
  try {
    await prisma.auditLog.create({ data: log });
  } catch (err) {
    console.error("FAILED TO WRITE AUDIT LOG", err);
  }
};
