import { Router } from "express";
import {
  getProjectManagers,
  getBusinessPartners,
  getUnits,
  getEnums,
} from "../controllers/master.controller.js";

const router = Router();

router.get("/pm", getProjectManagers);
router.get("/bp", getBusinessPartners);
router.get("/units", getUnits);
router.get("/enums", getEnums);

export default router;