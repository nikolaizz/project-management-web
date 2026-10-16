import { Router } from "express";
import {
  getProjects,
  checkProjectCode,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";
import { uploadDocuments, listDocuments } from "../controllers/document.controller.js";
import { validate } from "../middlewares/validate.js";
import { ensureProject } from "../middlewares/ensureProject.js";
import { uploadFiles } from "../middlewares/upload.js";
import { createProjectSchema, updateProjectSchema } from "../validators/project.validator.js";

const router = Router();

router.get("/", getProjects);
router.get("/check-code", checkProjectCode); // di atas "/:id"
router.post("/", validate(createProjectSchema), createProject);

router.get("/:id", getProjectById);
router.put("/:id", validate(updateProjectSchema), updateProject);
router.delete("/:id", deleteProject);

// Dokumen: cek project ada dulu, baru terima file
router.get("/:id/documents", ensureProject, listDocuments);
router.post("/:id/documents", ensureProject, uploadFiles, uploadDocuments);

export default router;