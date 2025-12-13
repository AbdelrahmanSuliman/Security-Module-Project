import prisma from "../prisma";
import { UnauthorizedError, NotFoundError } from "../utils/errors";
import { logger } from "../utils/logger";
import { writeAuditLog } from "../utils/audit";
import { decrypt } from "../utils/encryptor";

export const getPatientRecordsService = async (
  patientId: string,
  ip?: string,
  userAgent?: string
) => {
  logger.info({
    event: "GET_PATIENT_RECORDS_SERVICE_ATTEMPT",
    patientId,
  });

  const patient = await prisma.user.findUnique({
    where: { id: patientId },
    select: { id: true, name: true, role: true },
  });

  if (!patient) throw new NotFoundError("Patient not found");
  if (patient.role !== "PATIENT") throw new UnauthorizedError("Forbidden");

  const records = await prisma.patientRecord.findMany({
    where: { patientId },
    select: {
      id: true,
      createdAt: true,
      patient: {
        select: { id: true, name: true, diagnosis: true },
      },
      doctor: {
        select: { id: true, name: true, email: true },
      },
      doctorNotes: {
        orderBy: { createdAt: "desc" },
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
            orderBy: { checkedAt: "desc" },
            select: {
              id: true,
              checkedAt: true,
              nurse: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });
  const decryptedRecords = records.map((r) => ({
    ...r,
    patient: {
      ...r.patient,
      name: decrypt(r.patient.name),
      diagnosis: decrypt(r.patient.diagnosis),
    },
    doctor: {
      ...r.doctor,
      name: decrypt(r.doctor.name),
      email: r.doctor.email, 
    },
    doctorNotes: r.doctorNotes.map((n) => ({
      ...n,
      note: decrypt(n.note),
      doctor: { ...n.doctor, name: decrypt(n.doctor.name) },
    })),
    medications: r.medications.map((m) => ({
      ...m,
      name: decrypt(m.name),
      dosage: decrypt(m.dosage),
      schedule: decrypt(m.schedule),
      nurseChecks: m.nurseChecks.map((c) => ({
        ...c,
        nurse: { ...c.nurse, name: decrypt(c.nurse.name) },
      })),
    })),
  }));

  await writeAuditLog({
    actorId: patientId,
    actorRole: "PATIENT",
    action: "GET_PATIENT_RECORDS",
    targetType: "PATIENT",
    targetId: patientId,
    success: true,
    ip,
    userAgent,
    metadata: { recordCount: records.length },
  });

  return decryptedRecords;
};
