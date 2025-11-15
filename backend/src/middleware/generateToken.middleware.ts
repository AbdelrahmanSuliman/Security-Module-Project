import jwt from "jsonwebtoken";
import { User } from "@prisma/client";

export const generateToken = (user: User) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
};
