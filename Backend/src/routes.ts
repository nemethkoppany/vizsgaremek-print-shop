import { Router } from "express";
import { registerUser,loginUser } from "./controller";

const router = Router();

router.post("/api/auth/register", registerUser);
router.post("/api/auth/login",loginUser)

export default router;
