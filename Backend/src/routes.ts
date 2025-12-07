import { Router } from "express";
import { registerUser,loginUser,changePassword, getUserById} from "./controller";
import authenticateToken from "./authMiddleware";

const router = Router();

router.post("/api/auth/register", registerUser);
router.post("/api/auth/login",loginUser);
router.put("/api/auth/password-change",authenticateToken,changePassword);
//Ez valamiért még nem teljesen működik
router.get("/api/users/:id", authenticateToken, getUserById);


export default router;
