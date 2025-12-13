import prisma from "../prisma";
import { logger } from "../utils/logger";
import { NotFoundError, UnauthorizedError } from "../utils/errors";
import { writeAuditLog } from "../utils/audit";
import { decrypt } from "../utils/encryptor";

export const getAssignedPatientsService = async (
  nurseId: string,
  ip?: string,
  userAgent?: string
) => {
  logger.info({ nurseId, event: "FETCH_ASSIGNED_PATIENTS_ATTEMPT" });

  const nurse = await prisma.user.findUnique({
    where: { id: nurseId },
    select: { id: true, role: true, name: true },
  });

  if (!nurse) {
    await writeAuditLog({
      actorId: nurseId,
      actorRole: "UNKNOWN",
      action: "FETCH_ASSIGNED_PATIENTS",
      targetType: "PATIENT",
      success: false,
      ip,
      userAgent,
      metadata: { reason: "NURSE_NOT_FOUND" },
    });
    throw new NotFoundError("Nurse not found");
  }

  if (nurse.role !== "NURSE") {
    await writeAuditLog({
      actorId: nurseId,
      actorRole: nurse.role,
      action: "FETCH_ASSIGNED_PATIENTS",
      targetType: "PATIENT",
      success: false,
      ip,
      userAgent,
      metadata: { reason: "USER_NOT_NURSE" },
    });
    throw new UnauthorizedError("Only nurses can access assigned patients");
  }

  const assignedDoctors = await prisma.nurseAssignment.findMany({
    where: { nurseId },
    select: { doctorId: true },
  });

  const doctorIds = assignedDoctors.map((a) => a.doctorId);

  const patients = await prisma.patientRecord.findMany({
    where: { doctorId: { in: doctorIds } },
    include: {
      patient: {
        select: { id: true, name: true, email: true, diagnosis: true },
      },
      doctor: { select: { id: true, name: true } },
      medications: {
        include: { nurseChecks: { where: { nurseId }, select: { id: true } } },
      },
    },
  });

  const formattedPatients = patients.map((p) => ({
    recordId: p.id,
    patientId: p.patient.id,
    patientName: decrypt(p.patient.name),
    patientEmail: decrypt(p.patient.email),
    diagnosis: p.patient.diagnosis ? decrypt(p.patient.diagnosis) : null,
    doctorId: p.doctor.id,
    doctorName: decrypt(p.doctor.name),
    medications: p.medications.map((m) => ({
      id: m.id,
      name: decrypt(m.name),
      dosage: decrypt(m.dosage),
      schedule: decrypt(m.schedule),
      checked: m.nurseChecks.length > 0,
    })),
  }));

  logger.info({
    nurseId,
    event: "FETCH_ASSIGNED_PATIENTS_SUCCESS",
    count: formattedPatients.length,
  });

  await writeAuditLog({
    actorId: nurseId,
    actorRole: "NURSE",
    action: "FETCH_ASSIGNED_PATIENTS",
    targetType: "PATIENT",
    success: true,
    ip,
    userAgent,
    metadata: { count: formattedPatients.length },
  });

  return formattedPatients;
};
