import { Router } from "express";
import {
  getProjectManagers,
  getBusinessPartners,
  getUnits,
  getEnums,
} from "../controllers/master.controller.js";

const router = Router();

// Endpoint untuk data referensi yang biasanya digunakan sebagai pilihan form.
router.get("/pm", getProjectManagers);
router.get("/bp", getBusinessPartners);
router.get("/units", getUnits);
router.get("/enums", getEnums);

export default router;