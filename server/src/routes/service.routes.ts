import { Router } from "express";
import {
  getAllServices,
  getServiceBySlug,
  getAdminServices,
  getServiceById,
  createService,
  updateService,
  toggleServiceStatus,
  reorderServices,
  deleteService,
} from "../controllers/service.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createServiceSchema, updateServiceSchema } from "../validators/service.schema";

const router = Router();

// ── Public routes ─────────────────────────────────────────────────────────
router.get("/", getAllServices);
router.get("/slug/:slug", getServiceBySlug);

// ── Admin routes (protected) ──────────────────────────────────────────────
router.use(protect, restrictTo("admin", "superadmin"));

router.get("/admin/all", getAdminServices);
router.get("/admin/:id", getServiceById);
router.post("/", validate(createServiceSchema), createService);
router.put("/:id", validate(updateServiceSchema), updateService);
router.patch("/:id/toggle", toggleServiceStatus);
router.patch("/reorder", reorderServices);
router.delete("/:id", deleteService);

export default router;