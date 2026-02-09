import { Router } from "express";
import {createRating, getRatingAverage, getAllratings} from "../controller";
import authenticateToken from "../authMiddleware";
import verifyToken from "../authMiddleware";

const router = Router();

router.post("/api/ratings",verifyToken,createRating);
router.get("/api/ratings/avg",getRatingAverage);
router.get("/api/ratings/all",authenticateToken,getAllratings);

export default router;