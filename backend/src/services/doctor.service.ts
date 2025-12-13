import prisma from "../prisma";
import { logger } from "../utils/logger";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors";
import { CreatePatientInput } from "../types/createPatient.type";
import bcrypt from "bcrypt";
import { writeAuditLog } from "../utils/audit";
import { encrypt, decrypt } from "../utils/encryptor";

const maskEmail = (email: string) => {
  const [user, domain] = email.split("@");
  return `${user[0]}***@${domain}`;
};

export const getDoctorPatientsService = async (
  doctorId: string,
  ip?: string,
  userAgent?: string
) => {
  logger.info({ doctorId, event: "FETCH_PATIENTS_ATTEMPT" });

  const doctor = await prisma.user.findUnique({
    where: { id: doctorId },
    select: { id: true, role: true, name: true },
  });

  if (!doctor) {
    await writeAuditLog({
      actorId: doctorId,
      actorRole: "UNKNOWN",
      action: "FETCH_PATIENTS",
      targetType: "PATIENT",
      success: false,
      ip,
      userAgent,
      metadata: { reason: "DOCTOR_NOT_FOUND" },
    });

    throw new NotFoundError("Doctor not found");
  }

  if (doctor.role !== "DOCTOR") {
    await writeAuditLog({
      actorId: doctorId,
      actorRole: doctor.role,
      action: "FETCH_PATIENTS",
      targetType: "PATIENT",
      success: false,
      ip,
      userAgent,
      metadata: { reason: "USER_NOT_DOCTOR" },
    });

    throw new UnauthorizedError("Only doctors can view patients");
  }

  const patients = await prisma.user.findMany({
    where: {
      role: "PATIENT",
      patientRecord: {
        is: {
          doctorId: doctorId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      diagnosis: true,
      patientRecord: {
        select: {
          id: true,
          createdAt: true,
          doctorNotes: {
            select: {
              id: true,
              note: true,
              createdAt: true,
              doctor: { select: { id: true, name: true } },
            },
          },
          medications: {
            select: {
              id: true,
              name: true,
              dosage: true,
              schedule: true,
              nurseChecks: {
                select: {
                  id: true,
                  checkedAt: true,
                  nurse: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  const decryptedPatients = patients.map((p) => ({
    ...p,
    name: decrypt(p.name),
    email: decrypt(p.email),
    diagnosis: p.diagnosis ? decrypt(p.diagnosis) : null,
    patientRecord: {
      ...p.patientRecord,
      doctorNotes: p.patientRecord?.doctorNotes?.map((n) => ({
        ...n,
        note: decrypt(n.note),
        doctor: { ...n.doctor, name: decrypt(n.doctor.name) },
      })),
      medications: p.patientRecord?.medications?.map((m) => ({
        ...m,
        name: decrypt(m.name),
        dosage: decrypt(m.dosage),
        schedule: decrypt(m.schedule),
        nurseChecks: m.nurseChecks.map((c) => ({
          ...c,
          nurse: { ...c.nurse, name: decrypt(c.nurse.name) },
        })),
      })),
    },
  }));

  logger.info({
    doctorId,
    event: "FETCH_PATIENTS_SUCCESS",
    count: decryptedPatients.length,
  });

  await writeAuditLog({
    actorId: doctorId,
    actorRole: "DOCTOR",
    action: "FETCH_PATIENTS",
    targetType: "PATIENT",
    success: true,
    ip,
    userAgent,
    metadata: { count: decryptedPatients.length },
  });

  return decryptedPatients;
};

export const createPatientService = async (
  doctorId: string,
  patientData: CreatePatientInput,
  ip?: string,
  userAgent?: string
) => {
  logger.info({ doctorId, event: "CREATE_PATIENT_ATTEMPT", patientData });

  const doctor = await prisma.user.findUnique({
    where: { id: doctorId },
    select: { id: true, role: true, name: true },
  });

  if (!doctor) throw new NotFoundError("Doctor not found");
  if (doctor.role !== "DOCTOR")
    throw new UnauthorizedError("Only doctors can create patients");

  try {
    const hashedPassword = await bcrypt.hash(patientData.password, 10);

    const newPatient = await prisma.user.create({
      data: {
        name: encrypt(patientData.name),
        email: patientData.email,
        diagnosis: encrypt(patientData.diagnosis ?? "Not provided"),
        password: hashedPassword,
        passwordUpdatedAt: new Date(),
        role: "PATIENT",
        patientRecord: {
          create: {
            doctorId,
            doctorNotes: {
              create:
                patientData.notes?.map((n) => ({
                  doctorId,
                  note: encrypt(n.note),
                })) || [],
            },
            medications: {
              create:
                patientData.medications?.map((m) => ({
                  name: encrypt(m.name),
                  dosage: encrypt(m.dosage),
                  schedule: encrypt(m.schedule),
                })) || [],
            },
          },
        },
      },
      include: {
        patientRecord: {
          include: {
            doctorNotes: true,
            medications: true,
          },
        },
      },
    });

    await writeAuditLog({
      actorId: doctorId,
      actorRole: "DOCTOR",
      action: "CREATE_PATIENT",
      targetType: "USER",
      targetId: newPatient.id,
      success: true,
      ip,
      userAgent,
      metadata: { email: encrypt(patientData.email) },
    });

    return {
      ...newPatient,
      name: decrypt(newPatient.name),
      email: decrypt(newPatient.email),
      diagnosis: decrypt(newPatient.diagnosis),
    };
  } catch (err: any) {
    if (err.code === "P2002" && err.meta?.target?.includes("email")) {
      throw new ConflictError("A patient with this email already exists");
    }
    logger.error({ err, event: "CREATE_PATIENT_UNEXPECTED_ERROR" });
    throw err;
  }
};
