import { Request, Response } from "express";
import { AppError } from "../utils/errors";
import { logger } from "../utils/logger";
import * as nurseService from "../services/nurse.service";

export const getAssignedPatientsController = async (req: Request, res: Response) => {
  const nurseId = req.user!.id;

  try {
    logger.info({
      event: "FETCH_ASSIGNED_PATIENTS_ATTEMPT",
      nurseId,
    });

    const patients = await nurseService.getAssignedPatientsService(
      nurseId,
      req.ip,
      req.headers["user-agent"]
    );

    logger.info({
      event: "FETCH_ASSIGNED_PATIENTS_SUCCESS",
      nurseId,
      count: patients.length,
    });

    return res.status(200).json({
      message: "Assigned patients retrieved successfully",
      data: patients,
    });
  } catch (err: any) {
    if (err instanceof AppError) {
      logger.warn({
        event: "FETCH_ASSIGNED_PATIENTS_FAILED",
        nurseId,
        reason: err.message,
      });
      return res.status(err.statusCode).json({ message: err.message });
    }

    logger.error({
      event: "FETCH_ASSIGNED_PATIENTS_ERROR",
      nurseId,
      error: err,
    });

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
