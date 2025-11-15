import * as z from "zod";

export const createPatientSchema = z.object({
  name: z.string().min(3).max(30),
  email: z.email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must be at most 128 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
    .regex(/^\S+$/, "Password must not contain spaces"),
  diagnosis: z.string().min(3).optional(),

  notes: z
    .array(
      z.object({
        note: z.string().min(1, "Note cannot be empty"),
      })
    )
    .optional(),

  medications: z
    .array(
      z.object({
        name: z.string().min(1, "Medication name is required"),
        dosage: z.string().min(1, "Dosage is required"),
        schedule: z.string().min(1, "Schedule is required"),
      })
    )
    .optional(),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
