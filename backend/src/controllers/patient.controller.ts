import { Request, Response } from "express";
import * as patientService from "../services/patient.service";
import { logger } from "../utils/logger";

export const getPatientRecordsController = async (req: Request, res: Response) => {
  try {
    const patientId = req.user!.id; 

    logger.info({
      event: "GET_PATIENT_RECORDS_ATTEMPT",
      patientId,
    });

    const records = await patientService.getPatientRecordsService(patientId);

    return res.status(200).json({ data: records });
  } catch (err: any) {
    logger.error({
      event: "GET_PATIENT_RECORDS_ERROR",
      error: err,
      id: req.params.id,
    });

    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};
