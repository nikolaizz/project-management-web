import { Router } from "express";
import { getDashboard, createAiSummary } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/", getDashboard);
router.post("/ai-summary", createAiSummary);

export default router;
