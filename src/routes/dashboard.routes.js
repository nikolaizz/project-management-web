import { Router } from "express";
import { getDashboard, getAiSummary, createAiSummary } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/", getDashboard);
router.get("/ai-summary", getAiSummary);
router.post("/ai-summary", createAiSummary);

export default router;
