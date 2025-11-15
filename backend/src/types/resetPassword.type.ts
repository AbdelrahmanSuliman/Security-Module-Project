import * as z from "zod";

export const passwordResetSchema = z.object({
  email: z.email(),
  code: z.string().min(6).max(6),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must be at most 128 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character"
    )
    .regex(/^\S+$/, "Password must not contain spaces"),
});

export type signUpType = z.infer<typeof passwordResetSchema>;
