import { Router } from "express";
import { registerUser,loginUser,changePassword, getUserById, updateUser, deleteUser} from "./controller";
import authenticateToken from "./authMiddleware";

const router = Router();

router.post("/api/auth/register", registerUser);
router.post("/api/auth/login",loginUser);
router.put("/api/auth/password-change",authenticateToken,changePassword);
router.get("/api/users/:id", authenticateToken, getUserById);
router.put("/api/users/:id", authenticateToken, updateUser);
router.delete("/api/users/:id", deleteUser);


export default router;
