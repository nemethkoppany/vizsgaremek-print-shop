import { Router } from "express";
import {getOrderAnalytics, getLoginAnalytics} from "../controller";
import authenticateToken, { checkAdmin } from "../authMiddleware";
import verifyToken from "../authMiddleware";

const router = Router();


router.get("/api/admin/analytics/orders",authenticateToken,checkAdmin,getOrderAnalytics);
router.get("/api/admin/analytics/logins/:id",verifyToken,checkAdmin,getLoginAnalytics);

export default router;