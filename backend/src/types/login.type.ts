import * as zod from "zod";

export const loginSchema = zod.object({
    email: zod.email(),
    password: zod.string().min(8).max(128),
});

export type loginType = zod.infer<typeof loginSchema>;