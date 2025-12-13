import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function seed() {
  const password = await bcrypt.hash("Password@123", 10);
  const now = new Date();

  // ADMIN
  const admin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@demo.com",
      password,
      role: UserRole.ADMIN,
      passwordUpdatedAt: now,
    },
  });

  // DOCTOR
  const doctor = await prisma.user.create({
    data: {
      name: "Dr. John Smith",
      email: "doctor@demo.com",
      password,
      role: UserRole.DOCTOR,
      passwordUpdatedAt: now,
    },
  });

  // NURSE
  const nurse = await prisma.user.create({
    data: {
      name: "Nurse Amy",
      email: "nurse@demo.com",
      password,
      role: UserRole.NURSE,
      passwordUpdatedAt: now,
    },
  });

  // PATIENT
  const patient = await prisma.user.create({
    data: {
      name: "Patient Alex",
      email: "patient@demo.com",
      password,
      role: UserRole.PATIENT,
      diagnosis: "Hypertension",
      passwordUpdatedAt: now,
    },
  });

  // NURSE → DOCTOR ASSIGNMENT
  await prisma.nurseAssignment.create({
    data: {
      nurseId: nurse.id,
      doctorId: doctor.id,
    },
  });

  // PATIENT RECORD
  const record = await prisma.patientRecord.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
    },
  });

  // DOCTOR NOTE
  await prisma.doctorNote.create({
    data: {
      doctorId: doctor.id,
      recordId: record.id,
      note: "Patient shows stable vitals. Continue monitoring blood pressure.",
    },
  });

  // MEDICATION
  const medication = await prisma.medication.create({
    data: {
      name: "Amlodipine",
      dosage: "5mg",
      schedule: "Once daily",
      recordId: record.id,
    },
  });

  // MEDICATION CHECK (BY NURSE)
  await prisma.medicationCheck.create({
    data: {
      medicationId: medication.id,
      nurseId: nurse.id,
    },
  });

  console.log("✅ Demo database seeded successfully");
  console.log("");
  console.log("🔑 Login Credentials:");
  console.log("Admin:   admin@demo.com / Password@123");
  console.log("Doctor:  doctor@demo.com / Password@123");
  console.log("Nurse:   nurse@demo.com / Password@123");
  console.log("Patient: patient@demo.com / Password@123");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
