import { Router } from "express";
import { downloadDocument, deleteDocument } from "../controllers/document.controller.js";
import { downloadUpdateDocument } from "../controllers/project-update.controller.js";

const router = Router();

router.get("/:id/download", downloadDocument);
router.delete("/:id", deleteDocument);

export default router;

export const updateDocumentRouter = Router();
updateDocumentRouter.get("/:id/download", downloadUpdateDocument);
