import { Router } from "express";
import {getProducts, getProductById,createProduct, updateProduct,deleteProduct} from "../controller";
import authenticateToken, { checkAdmin } from "../authMiddleware";

const router = Router();

router.get("/api/products", getProducts);
router.get("/api/products/:id",getProductById);
router.post("/api/admin/products",authenticateToken,checkAdmin,createProduct);
router.put("/api/admin/products/:id",authenticateToken,checkAdmin,updateProduct);
router.delete("/api/admin/products/:id", authenticateToken, checkAdmin, deleteProduct);

export default router;