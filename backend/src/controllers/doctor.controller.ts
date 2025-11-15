import { Request, Response } from "express";
import * as doctorService from "../services/doctor.service";
import { AppError } from "../utils/errors";
import { logger } from "../utils/logger";
import { createPatientSchema } from "../types/createPatient.type"; 

export const getDoctorPatientsController = async (req: Request, res: Response) => {
  const doctorId = req.user!.id;
  try {
    const patients = await doctorService.getDoctorPatientsService(doctorId);
    return res.status(200).json({
      message: "Patients fetched successfully",
      data: patients,
    });
  } catch (err: any) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    logger.error(err, "Unexpected error fetching patients");
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createPatientController = async (req: Request, res: Response) => {
  const doctorId = req.user!.id;
  try {
    const patientData = createPatientSchema.parse(req.body);

    const newPatient = await doctorService.createPatientService(doctorId, patientData);
    return res.status(201).json({
      message: "Patient created successfully",
      data: newPatient,
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        message: "Invalid input",
        errors: err.errors.map((e: any) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    logger.error(err, "Unexpected error creating patient");
    return res.status(500).json({ message: "Internal server error" });
  }
};
