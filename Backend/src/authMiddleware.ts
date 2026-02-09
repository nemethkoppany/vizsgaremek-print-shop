import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "./config";
import { AuthRequest } from "./interface";
import { JwtPayload } from "./interface";

const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  let token =
    req.body?.token ||
    req.query?.token ||
    req.headers?.["x-access-token"];

  const authHeader = req.headers.authorization;
  if (!token && authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    res.status(403).send("Token szükséges a hozzáféréshez!");
    return;
  }

  try {
    const decodedToken = jwt.verify(token, config.jwtSecret!) as JwtPayload;
    req.user = decodedToken;
    next();
  } catch {
    res.status(401).send("Hibás vagy lejárt token");
    return;
  }
};




export const checkAdmin: any = (req:AuthRequest, res:Response, next:NextFunction): void=>{
  if(!req.user){
    res.status(401).json("Nincs bejelentkezve!");
    return;
  }

  if(req.user.role !== "admin"){
    res.status(403).json("Admin jogosultság szükséges");
    return;
  }
  next();
}


export default verifyToken;