import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "./config";
import { AuthRequest } from "./interface";
import { JwtPayload } from "./interface";

const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token =
    req.body?.token ||
    req.query?.token ||
    req.headers?.["x-access-token"];

  const authHeader = req.headers.authorization;
  if (!token && authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(403).send("Token szükséges a hozzáféréshez!");
  }

  try {
    const decodedToken = jwt.verify(token, config.jwtSecret!) as JwtPayload;
    req.user = decodedToken;
    next();
  } catch {
    return res.status(401).send("Hibás vagy lejárt token");
  }
};

export default verifyToken;
