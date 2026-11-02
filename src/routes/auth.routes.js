import { Router } from "express";
import { z } from "zod";
import { authenticate, requireRole } from "../middlewares/auth.js";
import { login, me, activateAccount, changePassword, listUsers, createUser, reissueActivation } from "../controllers/auth.controller.js";

const router = Router();
const loginSchema = z.object({ email: z.email(), password: z.string().min(1).max(72) });
const userSchema = z.object({
  nama: z.string().trim().min(1).max(100), email: z.email(),
  role: z.enum(["ADMIN", "PROJECT_MANAGER", "BUSINESS_PARTNER", "VIEWER"]),
  projectManagerId: z.string().optional(), businessPartnerId: z.string().optional(),
});
const activationSchema = z.object({ email: z.email(), token: z.string().length(64), password: z.string().min(8).max(72) });
const changePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8).max(72) });
const validate = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Data akun tidak valid", errors: parsed.error.issues.map((e) => ({ field: e.path.join("."), message: e.message })) });
  req.body = parsed.data;
  next();
};

router.post("/login", validate(loginSchema), login);
router.post("/activate", validate(activationSchema), activateAccount);
router.get("/me", authenticate, me);
router.put("/password", authenticate, validate(changePasswordSchema), changePassword);
router.get("/users", authenticate, requireRole("ADMIN"), listUsers);
router.post("/users", authenticate, requireRole("ADMIN"), validate(userSchema), createUser);
router.post("/users/:id/activation", authenticate, requireRole("ADMIN"), reissueActivation);
export default router;
