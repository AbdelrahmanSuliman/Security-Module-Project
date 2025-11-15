import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { logger } from "../utils/logger";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formattedErrors = result.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      logger.warn({
        event: "VALIDATION_FAILED",
        errors: formattedErrors,
      });

      return res.status(400).json({
        message: "Invalid input",
        errors: formattedErrors,
      });
    }

    req.body = result.data;
    next();
  };
