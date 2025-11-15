import { Router } from "express";
import * as patientController from "../controllers/patient.controller"
import { protect } from "../middleware/auth.middleware";
const router = Router();

router.get('/records', protect, patientController.getPatientRecordsController);


export default router;
