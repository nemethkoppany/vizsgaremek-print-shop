import { Router } from "express";
import { registerUser,loginUser,changePassword, getUserById, updateUser, deleteUser, getProducts, getProductById,createProduct, updateProduct,deleteProduct, getOrderAnalytics, getLoginAnalytics, uploadFile, uploadFilesMultiple, createOrder, downloadFile, deleteFile, getOrder, updateOrderStatus, getUserOrders, createSystemLog, getAuditLogs} from "./controller";
import authenticateToken, { checkAdmin } from "./authMiddleware";
import verifyToken from "./authMiddleware";

const router = Router();

router.post("/api/auth/register", registerUser);
router.post("/api/auth/login",loginUser);
router.put("/api/auth/password-change",authenticateToken,changePassword);

router.get("/api/users/:id", authenticateToken, getUserById);
router.put("/api/users/:id", authenticateToken, updateUser);
router.delete("/api/users/:id", deleteUser);

router.get("/api/products", getProducts);
router.get("/api/products/:id",getProductById);
router.post("/api/admin/products",authenticateToken,checkAdmin,createProduct);
router.put("/api/admin/products/:id",authenticateToken,checkAdmin,updateProduct);
router.delete("/api/admin/products/:id", authenticateToken, checkAdmin, deleteProduct);


router.get("/api/admin/analytics/orders",authenticateToken,checkAdmin,getOrderAnalytics);
router.get("/api/admin/analytics/logins/:id",verifyToken,checkAdmin,getLoginAnalytics);

router.post("/api/file/upload", authenticateToken, uploadFile);
router.post("/api/file/uploads", authenticateToken, uploadFilesMultiple);
router.get("/api/file/:id",verifyToken,downloadFile);
router.delete("/api/file/:id",verifyToken,deleteFile);

router.post("/api/order", authenticateToken, createOrder);
router.get("/api/order/:id", getOrder);
router.put("/api/admin/order/:id",authenticateToken,checkAdmin,updateOrderStatus);
router.get("/api/users/:id/orders",verifyToken,getUserOrders);


router.post("/api/system/logs",verifyToken,createSystemLog);
router.get("/api/admin/logs/:id",verifyToken,checkAdmin,getAuditLogs);
export default router;
