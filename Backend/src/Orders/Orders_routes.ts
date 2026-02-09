import { Router } from "express";
import {createOrder, getOrder, updateOrderStatus, getUserOrders} from "../controller";
import authenticateToken, { checkAdmin } from "../authMiddleware";
import verifyToken from "../authMiddleware";

const router = Router();

router.post("/api/order", authenticateToken, createOrder);
router.get("/api/order/:id", getOrder);
router.put("/api/admin/order/:id",authenticateToken,checkAdmin,updateOrderStatus);
router.get("/api/users/:id/orders",verifyToken,getUserOrders);

export default router;