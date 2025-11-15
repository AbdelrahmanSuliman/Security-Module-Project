import { Router } from "express";
import * as  nurseController from "../controllers/nurse.controller"
import { protect } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
const router = Router();

router.get('/patients', protect, authorizeRoles('NURSE'),  nurseController.getAssignedPatientsController);


export default router;
