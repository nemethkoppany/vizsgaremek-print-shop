import { Router } from "express";
import { registerUser } from "./controller";

const router = Router();

router.post("/api/auth/register", registerUser);

export default router;
