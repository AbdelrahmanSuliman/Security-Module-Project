import prisma from "../prisma";
import { logger } from "../utils/logger";
import { writeAuditLog } from "../utils/audit";
import bcrypt from "bcrypt";
import { encrypt, decrypt } from "../utils/encryptor";
import { NotFoundError, AppError } from "../utils/errors";

export const createDoctorService = async (
  actorId: string,
  name: string,
  email: string,
  password: string,
  ip?: string,
  userAgent?: string
) => {
  try {
    logger.info({ event: "CREATE_DOCTOR_ATTEMPT", email });

    const emailExists = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });


    if (emailExists) throw new AppError("Email already in use", 400);

    const hashed = await bcrypt.hash(password, 10);

    const doctor = await prisma.user.create({
      data: {
        name: encrypt(name),
        email: email,
        password: hashed,
        role: "DOCTOR",
        passwordUpdatedAt: new Date(),
      },
    });

    await writeAuditLog({
      actorId,
      actorRole: "ADMIN",
      action: "CREATE_DOCTOR",
      targetType: "USER",
      targetId: doctor.id,
      success: true,
      ip,
      userAgent,
    });

    logger.info({ event: "CREATE_DOCTOR_SUCCESS", doctorId: doctor.id });
    return doctor;
  } catch (err: any) {
    logger.error({ event: "CREATE_DOCTOR_ERROR", error: err.message });
    await writeAuditLog({
      actorId,
      actorRole: "ADMIN",
      action: "CREATE_DOCTOR",
      targetType: "USER",
      success: false,
      ip,
      userAgent,
      metadata: { error: err.message },
    });
    throw err;
  }
};

export const createNurseService = async (
  actorId: string,
  name: string,
  email: string,
  password: string,
  doctorId: string,
  ip?: string,
  userAgent?: string
) => {
  try {
    logger.info({ event: "CREATE_NURSE_ATTEMPT", email, doctorId });

    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { id: true, role: true },
    });

    if (!doctor || doctor.role !== "DOCTOR")
      throw new NotFoundError("Doctor not found");

    const emailExists = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (emailExists) throw new AppError("Email already in use", 400);

    const hashed = await bcrypt.hash(password, 10);

    const nurse = await prisma.user.create({
      data: {
        name: encrypt(name),
        email: email,
        password: hashed,
        role: "NURSE",
        passwordUpdatedAt: new Date(),
      },
    });

    await prisma.nurseAssignment.create({
      data: {
        nurseId: nurse.id,
        doctorId: doctor.id,
      },
    });

    await writeAuditLog({
      actorId,
      actorRole: "ADMIN",
      action: "CREATE_NURSE_AND_ASSIGN",
      targetType: "USER",
      targetId: nurse.id,
      success: true,
      ip,
      userAgent,
      metadata: { doctorId },
    });

    logger.info({
      event: "CREATE_NURSE_SUCCESS",
      nurseId: nurse.id,
      doctorId,
    });

    return nurse;
  } catch (err: any) {
    logger.error({ event: "CREATE_NURSE_ERROR", error: err.message });
    await writeAuditLog({
      actorId,
      actorRole: "ADMIN",
      action: "CREATE_NURSE_AND_ASSIGN",
      targetType: "USER",
      success: false,
      ip,
      userAgent,
      metadata: { error: err.message },
    });
    throw err;
  }
};

export const getAllDoctorsService = async (
  actorId: string,
  ip?: string,
  userAgent?: string
) => {
  try {
    logger.info({ event: "FETCH_DOCTORS_ATTEMPT" });

    const doctors = await prisma.user.findMany({
      where: { role: "DOCTOR" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        doctorAssignments: {
          include: {
            nurse: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        doctorPatients: {
          select: {
            id: true,
          },
        },
      },
    });

    const decryptedDoctors = doctors.map((d) => ({
      ...d,
      name: decrypt(d.name),
      email: d.email,
      doctorAssignments: d.doctorAssignments.map((a) => ({
        ...a,
        nurse: {
          ...a.nurse,
          name: decrypt(a.nurse.name),
          email: decrypt(a.nurse.email),
        },
      })),
    }));

    await writeAuditLog({
      actorId,
      actorRole: "ADMIN",
      action: "FETCH_DOCTORS",
      targetType: "USER",
      success: true,
      ip,
      userAgent,
    });

    logger.info({
      event: "FETCH_DOCTORS_SUCCESS",
      count: decryptedDoctors.length,
    });

    return decryptedDoctors;
  } catch (err: any) {
    logger.error({ event: "FETCH_DOCTORS_ERROR", error: err.message });
    await writeAuditLog({
      actorId,
      actorRole: "ADMIN",
      action: "FETCH_DOCTORS",
      targetType: "USER",
      success: false,
      ip,
      userAgent,
      metadata: { error: err.message },
    });
    throw err;
  }
};

export const getAllNursesService = async (
  actorId: string,
  ip?: string,
  userAgent?: string
) => {
  try {
    logger.info({ event: "FETCH_NURSES_ATTEMPT" });

    const nurses = await prisma.user.findMany({
      where: { role: "NURSE" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,

        nurseAssignments: {
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const result = nurses.map((nurse) => {
      const safeDecrypt = (value: string | null | undefined): string => {
        if (!value) return "";
        if (value.includes(":") && value.split(":").length === 3) {
          try {
            return decrypt(value);
          } catch {
            return value;
          }
        }
        return value;
      };

      return {
        ...nurse,
        name: safeDecrypt(nurse.name),
        email: safeDecrypt(nurse.email),
        assignedDoctors: nurse.nurseAssignments
          .filter((a) => a.doctor !== null && a.doctor !== undefined)
          .map((a) => ({
            id: a.doctor.id,
            name: safeDecrypt(a.doctor.name),
            email: safeDecrypt(a.doctor.email),
          })),
      };
    });

    await writeAuditLog({
      actorId,
      actorRole: "ADMIN",
      action: "FETCH_NURSES",
      targetType: "USER",
      success: true,
      ip,
      userAgent,
    });

    logger.info({
      event: "FETCH_NURSES_SUCCESS",
      count: nurses.length,
    });

    return result;
  } catch (err: any) {
    logger.error({ event: "FETCH_NURSES_ERROR", error: err.message });
    await writeAuditLog({
      actorId,
      actorRole: "ADMIN",
      action: "FETCH_NURSES",
      targetType: "USER",
      success: false,
      ip,
      userAgent,
      metadata: { error: err.message },
    });
    throw err;
  }
};

export const deleteDoctorService = async (
  actorId: string,
  doctorId: string,
  ip?: string,
  userAgent?: string
) => {
  try {
    logger.info({ event: "DELETE_DOCTOR_ATTEMPT", doctorId });

    const doctor = await prisma.user.findUnique({ where: { id: doctorId } });
    if (!doctor || doctor.role !== "DOCTOR")
      throw new NotFoundError("Doctor not found");

    await prisma.nurseAssignment.deleteMany({ where: { doctorId } });
    await prisma.patientRecord.deleteMany({ where: { doctorId } });
    await prisma.user.delete({ where: { id: doctorId } });

    await writeAuditLog({
      actorId,
      actorRole: "ADMIN",
      action: "DELETE_DOCTOR",
      targetType: "USER",
      targetId: doctorId,
      success: true,
      ip,
      userAgent,
    });

    logger.info({ event: "DELETE_DOCTOR_SUCCESS", doctorId });
    return { message: "Doctor deleted successfully" };
  } catch (err: any) {
    logger.error({ event: "DELETE_DOCTOR_ERROR", error: err.message });
    await writeAuditLog({
      actorId,
      actorRole: "ADMIN",
      action: "DELETE_DOCTOR",
      targetType: "USER",
      success: false,
      ip,
      userAgent,
      metadata: { error: err.message },
    });
    throw err;
  }
};

export const getAllAuditLogsService = async (page = 1, limit = 50) => {
  const skip = (page - 1) * limit;

  const [logs, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count(),
  ]);

  return { logs, total, page, limit };
};
