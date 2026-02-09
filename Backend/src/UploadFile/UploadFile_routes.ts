import { Router } from "express";
import {uploadFile, uploadFilesMultiple, downloadFile, deleteFile} from "../controller";
import authenticateToken from "../authMiddleware";
import verifyToken from "../authMiddleware";

const router = Router();

router.post("/api/file/upload", authenticateToken, uploadFile);
router.post("/api/file/uploads", authenticateToken, uploadFilesMultiple);
router.get("/api/file/:id",verifyToken,downloadFile);
router.delete("/api/file/:id",verifyToken,deleteFile);

export default router;