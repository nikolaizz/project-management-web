import { Router } from "express";
import {
  getProjects,
  checkProjectCode,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  updateStages
} from "../controllers/project.controller.js";
import { uploadDocuments, listDocuments } from "../controllers/document.controller.js";
import { validate } from "../middlewares/validate.js";
import { ensureProject } from "../middlewares/ensureProject.js";
import { uploadFiles } from "../middlewares/upload.js";
import { createProjectSchema, updateProjectSchema, updateStagesSchema} from "../validators/project.validator.js";
import { authorizeProject, requireRole } from "../middlewares/auth.js";

const router = Router();

router.get("/", getProjects);
router.get("/check-code", checkProjectCode); // di atas "/:id"
router.post("/", requireRole("ADMIN", "PROJECT_MANAGER", "BUSINESS_PARTNER"), validate(createProjectSchema), createProject);

router.get("/:id", getProjectById);
router.put("/:id", authorizeProject, (req, res, next) => {
  const profile = req.user.role === "PROJECT_MANAGER" ? "pmId" : req.user.role === "BUSINESS_PARTNER" ? "bpId" : null;
  if (profile && profile in req.body && req.body[profile] !== req.project[profile]) return res.status(403).json({ success: false, message: "Penugasan PM/BP hanya dapat diubah Admin" });
  next();
}, validate(updateProjectSchema), updateProject);
router.put("/:id/stages", authorizeProject, validate(updateStagesSchema), updateStages);
router.delete("/:id", requireRole("ADMIN"), deleteProject);

// Dokumen: cek project ada dulu, baru terima file
router.get("/:id/documents", ensureProject, listDocuments);
router.post("/:id/documents", authorizeProject, uploadFiles, uploadDocuments);

export default router;
