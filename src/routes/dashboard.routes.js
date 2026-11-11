import { Router } from "express";
import { getDashboard, getAiSummary, createAiSummary } from "../controllers/dashboard.controller.js";
import { postDashboardChat } from "../controllers/dashboardChat.controller.js";
import { validate } from "../middlewares/validate.js";
import { dashboardChatMessageSchema } from "../validators/dashboardChat.validator.js";

const router = Router();

router.get("/", getDashboard);
router.get("/ai-summary", getAiSummary);
router.post("/ai-summary", createAiSummary);
router.post("/chat", validate(dashboardChatMessageSchema), postDashboardChat);

export default router;
