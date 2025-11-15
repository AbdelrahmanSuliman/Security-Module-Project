import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import { protect } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

router.post(
  "/doctor",
  protect,
  authorizeRoles("ADMIN"),
  adminController.createDoctorController
);

router.delete(
  "/doctor/:id",
  protect,
  authorizeRoles("ADMIN"),
  adminController.deleteDoctorController
);

router.get(
  "/doctors",
  protect,
  authorizeRoles("ADMIN"),
  adminController.getAllDoctorsController
);

router.post(
  "/nurse",
  protect,
  authorizeRoles("ADMIN"),
  adminController.createNurseController
);

router.get(
  "/nurses",
  protect,
  authorizeRoles("ADMIN"),
  adminController.getAllNursesController
);

router.get(
  "/audit-logs",
  protect,
  authorizeRoles("ADMIN"),
  adminController.getAllAuditLogsController
);

export default router;
