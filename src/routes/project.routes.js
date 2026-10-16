import { Router } from "express";
import {
  getProjects,
  checkProjectCode,
  getProjectById,
  createProject,
} from "../controllers/project.controller.js";
import { validate } from "../middlewares/validate.js";
import { createProjectSchema } from "../validators/project.validator.js";

const router = Router();

// Daftar project dan pemeriksaan kode ditempatkan sebelum route parameter /:id.
router.get("/", getProjects);
router.get("/check-code", checkProjectCode); // HARUS di atas "/:id"
// Route /:id menangkap satu segmen URL sebagai ID project.
router.get("/:id", getProjectById);
// Validasi body request dijalankan sebelum controller menyimpan project.
router.post("/", validate(createProjectSchema), createProject);

export default router;