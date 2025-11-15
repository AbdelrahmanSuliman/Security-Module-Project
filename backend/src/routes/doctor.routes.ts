import { Router } from "express";
import * as doctorContoller from "../controllers/doctor.controller";
import { protect } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { createPatientSchema } from "../types/createPatient.type";
const router = Router();

router.get('/patients', protect, authorizeRoles('DOCTOR'), doctorContoller.getDoctorPatientsController);
router.post('/patients', protect, authorizeRoles('DOCTOR'), validate(createPatientSchema), doctorContoller.createPatientController);

export default router;
