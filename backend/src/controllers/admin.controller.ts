import { Request, Response } from "express";
import * as adminService from "../services/admin.service";
import { AppError } from "../utils/errors";
import { logger } from "../utils/logger";

export const createDoctorController = async (req: Request, res: Response) => {
  try {
    const actorId = req.user!.id;
    const ip = req.ip;
    const userAgent = req.headers["user-agent"];

    const { name, email, password } = req.body;

    const newDoctor = await adminService.createDoctorService(
      actorId,
      name,
      email,
      password,
      ip,
      userAgent
    );

    return res.status(201).json({
      message: "Doctor created successfully",
      data: newDoctor,
    });
  } catch (err: any) {
    logger.error({ event: "CREATE_DOCTOR_CONTROLLER_ERROR", error: err.message });

    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createNurseController = async (req: Request, res: Response) => {
  try {
    const actorId = req.user!.id;
    const ip = req.ip;
    const userAgent = req.headers["user-agent"];

    const { name, email, password, doctorId } = req.body;

    const newNurse = await adminService.createNurseService(
      actorId,
      name,
      email,
      password,
      doctorId,
      ip,
      userAgent
    );

    return res.status(201).json({
      message: "Nurse created and assigned successfully",
      data: newNurse,
    });
  } catch (err: any) {
    logger.error({ event: "CREATE_NURSE_CONTROLLER_ERROR", error: err.message });

    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllDoctorsController = async (req: Request, res: Response) => {
  try {
    const actorId = req.user!.id;
    const ip = req.ip;
    const userAgent = req.headers["user-agent"];

    const doctors = await adminService.getAllDoctorsService(actorId, ip, userAgent);

    return res.status(200).json({
      message: "Doctors retrieved successfully",
      data: doctors,
    });
  } catch (err: any) {
    logger.error({ event: "GET_DOCTORS_CONTROLLER_ERROR", error: err.message });
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllNursesController = async (req: Request, res: Response) => {
  try {
    const actorId = req.user!.id;
    const ip = req.ip;
    const userAgent = req.headers["user-agent"];

    const nurses = await adminService.getAllNursesService(actorId, ip, userAgent);

    return res.status(200).json({
      message: "Nurses retrieved successfully",
      data: nurses,
    });
  } catch (err: any) {
    logger.error({ event: "GET_NURSES_CONTROLLER_ERROR", error: err.message });
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteDoctorController = async (req: Request, res: Response) => {
  try {
    const { id: doctorId } = req.params;
    const actorId = req.user!.id;
    const ip = req.ip;
    const userAgent = req.headers["user-agent"];

    const result = await adminService.deleteDoctorService(
      actorId,
      doctorId,
      ip,
      userAgent
    );

    return res.status(200).json(result);
  } catch (err: any) {
    logger.error({ event: "DELETE_DOCTOR_CONTROLLER_ERROR", error: err.message });

    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllAuditLogsController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const { logs, total } = await adminService.getAllAuditLogsService(page, limit);

    return res.status(200).json({
      message: "Audit logs retrieved successfully",
      data: logs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    logger.error({ event: "GET_AUDIT_LOGS_CONTROLLER_ERROR", error: err.message });
    return res.status(500).json({ message: "Internal server error" });
  }
};
