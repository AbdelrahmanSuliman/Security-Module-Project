import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function wipe() {
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.medicationCheck.deleteMany(),
    prisma.medication.deleteMany(),
    prisma.doctorNote.deleteMany(),
    prisma.patientRecord.deleteMany(),
    prisma.nurseAssignment.deleteMany(),
    prisma.passwordResetCode.deleteMany(),
    prisma.loginCode.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

wipe()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
