import { Router } from "express";
import { downloadDocument, deleteDocument } from "../controllers/document.controller.js";

const router = Router();

router.get("/:id/download", downloadDocument);
router.delete("/:id", deleteDocument);

export default router;