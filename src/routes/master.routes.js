import { Router } from "express";
import { getEnums } from "../controllers/master.controller.js";
import { projectManagers, businessPartners, units } from "../controllers/masterData.controller.js";
import { validate } from "../middlewares/validate.js";
import { masterSchema } from "../validators/master.validator.js";

const router = Router();
const resources = { pm: projectManagers, bp: businessPartners, units };

router.get("/enums", getEnums);

for (const [path, c] of Object.entries(resources)) {
  router.get(`/${path}`, c.list);
  router.post(`/${path}`, validate(masterSchema), c.create);
  router.put(`/${path}/:id`, validate(masterSchema), c.update);
  router.delete(`/${path}/:id`, c.remove);
}

export default router;