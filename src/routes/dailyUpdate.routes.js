import { Router } from "express";
import { createDailyUpdates, listDailyUpdates } from "../controllers/dailyUpdate.controller.js";
import { validate } from "../middlewares/validate.js";
import { createDailyUpdatesSchema } from "../validators/dailyUpdate.validator.js";

const router = Router();

router.get("/", listDailyUpdates);
router.post("/", validate(createDailyUpdatesSchema), createDailyUpdates);

export default router;