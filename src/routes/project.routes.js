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

router.get("/", getProjects);
router.get("/check-code", checkProjectCode); // HARUS di atas "/:id"
router.get("/:id", getProjectById);
router.post("/", validate(createProjectSchema), createProject);

export default router;