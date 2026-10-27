import { Router } from "express";
import { createDailyUpdates, previewDailyUpdates, listDailyUpdates } from "../controllers/dailyUpdate.controller.js";
import { validate } from "../middlewares/validate.js";
import { createDailyUpdatesSchema, previewDailyUpdatesSchema } from "../validators/dailyUpdate.validator.js";

const router = Router();

router.get("/", listDailyUpdates);
router.post("/preview", validate(previewDailyUpdatesSchema), previewDailyUpdates);
router.post("/", validate(createDailyUpdatesSchema), createDailyUpdates);

export default router;