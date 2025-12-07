import { Router } from "express";
import { registerUser,loginUser,changePassword } from "./controller";
import authenticateToken from "./authMiddleware";

const router = Router();

router.post("/api/auth/register", registerUser);
router.post("/api/auth/login",loginUser)
router.put("/api/auth/password-change",authenticateToken,changePassword)

export default router;
