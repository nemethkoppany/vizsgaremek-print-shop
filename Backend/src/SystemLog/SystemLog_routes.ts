import { Router } from "express";
import {createSystemLog, getAuditLogs} from "../controller";
import { checkAdmin } from "../authMiddleware";
import verifyToken from "../authMiddleware";

const router = Router();

router.post("/api/system/logs",verifyToken,createSystemLog);
router.get("/api/admin/logs/:id",verifyToken,checkAdmin,getAuditLogs);

export default router;