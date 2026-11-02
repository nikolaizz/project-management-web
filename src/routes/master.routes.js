import { Router } from "express";
import { getEnums } from "../controllers/master.controller.js";
import { projectManagers, businessPartners, units } from "../controllers/masterData.controller.js";
import { validate } from "../middlewares/validate.js";
import { masterSchema } from "../validators/master.validator.js";
import { requireRole } from "../middlewares/auth.js";

const router = Router();
const resources = { pm: projectManagers, bp: businessPartners, units };

router.get("/enums", getEnums);

for (const [path, c] of Object.entries(resources)) {
  router.get(`/${path}`, c.list);
  router.post(`/${path}`, requireRole("ADMIN"), validate(masterSchema), c.create);
  router.put(`/${path}/:id`, requireRole("ADMIN"), validate(masterSchema), c.update);
  router.delete(`/${path}/:id`, requireRole("ADMIN"), c.remove);
}

export default router;
