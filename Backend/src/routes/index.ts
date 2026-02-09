import { Router } from "express";

import analyticsRoutes from "../Analytics/Analytics_routes";
import ordersRoutes from "../Orders/Orders_routes";
import productsRoutes from "../Products/Products_routes";
import ratingsRoutes from "../Ratings/Ratings_routes";
import systemLogRoutes from "../SystemLog/SystemLog_routes";
import uploadFileRoutes from "../UploadFile/UploadFile_routes";
import userRoutes from "../User/User_routes";

const router = Router();

router.use(analyticsRoutes);
router.use(ordersRoutes);
router.use(productsRoutes);
router.use(ratingsRoutes);
router.use(systemLogRoutes);
router.use(uploadFileRoutes);
router.use(userRoutes);

export default router;
